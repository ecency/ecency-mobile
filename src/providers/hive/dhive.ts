// import '../../../shim';
// import * as bitcoin from 'bitcoinjs-lib';

import {
  Client,
  cryptoUtils,
  Types,
  Transaction,
  Operation,
  TransactionConfirmation,
} from '@hiveio/dhive';
import { PrivateKey } from '@esteemapp/dhive';
import bytebuffer from 'bytebuffer';
import * as Crypto from 'expo-crypto';

import { Client as hsClient } from 'hivesigner';
import Config from 'react-native-config';
import { get, has } from 'lodash';
import * as hiveuri from 'hive-uri';
import * as Sentry from '@sentry/react-native';
import {
  getQueryClient,
  getAccountFullQueryOptions,
  getAccountsQueryOptions,
  parseProfileMetadata,
  getCommunityQueryOptions,
  getDynamicPropsQueryOptions,
  getTrendingTagsQueryOptions,
  getMarketStatisticsQueryOptions,
} from '@ecency/sdk';
import { getServer, getCache, setCache } from '../../realm/realm';

// Utils
import { decryptKey } from '../../utils/crypto';
import { getName, getAvatar, parseReputation } from '../../utils/user';
import { jsonStringify } from '../../utils/jsonUtils';
import { getDsteemDateErrorMessage } from '../../utils/dsteemUtils';

// Constant
import AUTH_TYPE from '../../constants/authType';
import { SERVER_LIST } from '../../constants/options/api';
import { b64uEnc } from '../../utils/b64';
import TransferTypes from '../../constants/transferTypes';

interface LocalAccount {
  authType: string;
  accessToken: string;
}

interface CurrentAccount {
  username: string;
  local: LocalAccount;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = global.Buffer || require('buffer').Buffer;

let client = new Client([...SERVER_LIST], {
  timeout: 4000,
  failoverThreshold: 10,
  consoleOnFailover: true,
});

export const checkClient = async () => {
  const selectedServer = [...SERVER_LIST];

  await getServer().then((response) => {
    if (response) {
      selectedServer.unshift(response);
    }
  });

  client = new Client(selectedServer, {
    timeout: 4000,
    failoverThreshold: 10,
    consoleOnFailover: true,
  });
};

checkClient();

const isInvalidParamsRpcError = (error: unknown): boolean => {
  const name = (error as { name?: string })?.name;
  const message = (error as { message?: string; jse_shortmsg?: string })?.message;
  const shortMessage = (error as { jse_shortmsg?: string })?.jse_shortmsg;

  return (
    name === 'RPCError' &&
    (message === 'Invalid parameters' || shortMessage === 'Invalid parameters')
  );
};

const captureExceptionWithRpcParams = (
  error: unknown,
  params?: Record<string, unknown>,
  configureScope?: (scope: Sentry.Scope) => void,
) => {
  Sentry.captureException(error, (scope) => {
    if (params && isInvalidParamsRpcError(error)) {
      scope.setContext('params', params);
    }
    configureScope?.(scope);
    return scope;
  });
};

const isDsteemDateError = (error: unknown): boolean => {
  const code = get(error, 'jse_info.code');
  if (code === 4030100) {
    return true;
  }

  const message = String(get(error, 'message') || error || '').toLowerCase();
  return (
    message.includes('trx.expiration') ||
    message.includes('transaction expiration') ||
    message.includes('trx_expiration')
  );
};

const getDateErrorDiagnostics = async () => {
  const diagnostics: Record<string, unknown> = {
    localTimeIso: new Date().toISOString(),
    localTimestampMs: Date.now(),
    timezoneOffsetMin: new Date().getTimezoneOffset(),
  };

  try {
    diagnostics.selectedServer = await getServer();
  } catch {
    diagnostics.selectedServer = null;
  }

  diagnostics.serverPool = [...SERVER_LIST];

  try {
    const props = await client.database.getDynamicGlobalProperties();
    diagnostics.clientHeadTime = props?.time;
    diagnostics.clientHeadBlock = props?.head_block_number;
    if (props?.time) {
      diagnostics.clientHeadSkewMs = Date.now() - new Date(`${props.time}Z`).getTime();
    }
  } catch (error) {
    diagnostics.clientPropsError = String((error as Error)?.message || error);
  }

  try {
    const sdkProps = await getDynamicGlobalProperties();
    const sdkHead = sdkProps?.raw?.globalDynamic;
    diagnostics.sdkHeadTime = sdkHead?.time;
    diagnostics.sdkHeadBlock = sdkHead?.head_block_number;
    if (sdkHead?.time) {
      diagnostics.sdkHeadSkewMs = Date.now() - new Date(`${sdkHead.time}Z`).getTime();
    }
  } catch (error) {
    diagnostics.sdkPropsError = String((error as Error)?.message || error);
  }

  return diagnostics;
};

/**
 * Checks if error indicates missing posting authority for HiveAuth users
 */
const isMissingAuthorityError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || error.toString() || '';
  const errorDescription = error.error_description || '';
  let safeErrorString = '';
  try {
    safeErrorString = JSON.stringify(error);
  } catch {
    safeErrorString = error.toString ? error.toString() : '';
  }
  const safeLower = safeErrorString.toLowerCase();

  // Log error for debugging
  console.log('[HiveAuth Debug] Error check:', {
    message: errorMessage,
    description: errorDescription,
    fullError: safeLower.substring(0, 200),
  });

  return (
    errorMessage.includes('missing required posting authority') ||
    errorMessage.includes('Missing Posting Authority') ||
    errorMessage.includes('Missing Authority') ||
    errorMessage.includes('missing_posting_auths') ||
    errorMessage.includes('posting authority') ||
    errorDescription.includes('Missing Authority') ||
    errorDescription.includes('posting authority') ||
    safeLower.includes('missing_posting_auth') ||
    safeLower.includes('missing required posting authority') ||
    (safeLower.includes('posting') && safeLower.includes('authority'))
  );
};

/**
 * Determines if error should trigger HiveAuth fallback
 * More permissive than isMissingAuthorityError - includes token issues
 */
const shouldTriggerHiveAuthFallback = (error: any): boolean => {
  if (!error) return false;

  if (isMissingAuthorityError(error)) {
    return true;
  }

  const status = error?.status ?? error?.response?.status;
  if (status === 401 || status === 403) {
    return true;
  }

  const code = error?.code ?? error?.error_code;
  if (code === 'MISSING_AUTHORITY' || code === 'INSUFFICIENT_AUTHORITY') {
    return true;
  }
  if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN' || code === 'HS_UNAUTHORIZED') {
    return true;
  }
  if (code === 'TOKEN_EXPIRED') {
    return true;
  }

  const name = error?.name;
  if (name === 'UnauthorizedError' || name === 'ForbiddenError') {
    return true;
  }

  const errorMessage = (error?.message || error?.toString?.() || '').toLowerCase();
  if (/\binvalid token\b/.test(errorMessage) || /\btoken expired\b/.test(errorMessage)) {
    return true;
  }

  return false;
};

/**
 * Handles HiveAuth fallback for operations when access token fails
 * Returns a promise that resolves when HiveAuth broadcast completes
 *
 * IMPORTANT: This function can be called from non-UI contexts (Redux actions, utilities, etc.)
 * The SheetManager is safe to use as long as the app is fully initialized and the sheet provider
 * is mounted. If called very early during app initialization or from background tasks before UI
 * is ready, it may fail silently. This is acceptable as operations requiring HiveAuth should only
 * be triggered after successful login when UI is fully interactive.
 */
// Cached dynamic imports to avoid re-resolving on every fallback call
let _cachedSheetManager: typeof import('react-native-actions-sheet').SheetManager | null = null;
let _cachedSheetNames: typeof import('../../navigation/sheets').SheetNames | null = null;

const getSheetDeps = async () => {
  if (!_cachedSheetManager || !_cachedSheetNames) {
    const [actionSheetModule, sheetsModule] = await Promise.all([
      import('react-native-actions-sheet'),
      import('../../navigation/sheets'),
    ]);
    _cachedSheetManager = actionSheetModule.SheetManager;
    _cachedSheetNames = sheetsModule.SheetNames;
  }
  return { SheetManager: _cachedSheetManager!, SheetNames: _cachedSheetNames! };
};

/**
 * Recursion guard for HiveAuth fallback
 * Tracks active fallback operations to prevent infinite recursion
 * Key format: `${accountName}:${operationName}`
 */
const _activeFallbacks = new Set<string>();

export const handleHiveAuthFallback = async (
  currentAccount: any,
  operations: Operation[],
  operationName: string,
): Promise<any> => {
  // Prevent infinite recursion: block if this exact operation is already in fallback
  const fallbackKey = `${currentAccount?.name || 'unknown'}:${operationName}`;

  if (_activeFallbacks.has(fallbackKey)) {
    const recursionError = new Error(
      `[HiveAuth Fallback] Recursion detected for ${operationName}. Already in fallback state.`,
    );
    console.error(recursionError.message);
    throw recursionError;
  }

  // Mark this fallback as active
  _activeFallbacks.add(fallbackKey);

  console.log(
    `[HiveAuth Fallback] Access token failed for ${operationName}, ` +
      'falling back to HiveAuth broadcast',
  );

  const { SheetManager, SheetNames } = await getSheetDeps();

  return new Promise((resolve, reject) => {
    const timeoutMs = 60000;
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      // Clean up recursion guard
      _activeFallbacks.delete(fallbackKey);
      fn();
    };

    const timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      SheetManager.hide(SheetNames.HIVE_AUTH_BROADCAST);
      // Clean up recursion guard on timeout
      _activeFallbacks.delete(fallbackKey);
      reject(new Error('HiveAuth broadcast timed out'));
    }, timeoutMs);

    // Wrap SheetManager.show in try-catch to prevent recursion if sheet display fails
    try {
      SheetManager.show(SheetNames.HIVE_AUTH_BROADCAST, {
        payload: {
          operations,
          onSuccess: (result) => {
            console.log(`[HiveAuth Fallback] ${operationName} broadcast successful`, result);
            finish(() => resolve(result));
          },
          onError: (error) => {
            console.error(`[HiveAuth Fallback] ${operationName} broadcast failed`, error);
            finish(() => reject(error));
          },
          onClose: (error) => {
            console.warn(`[HiveAuth Fallback] ${operationName} dismissed`, error);
            finish(() => reject(error || new Error('HiveAuth broadcast was dismissed')));
          },
        },
      });
    } catch (sheetError) {
      // If SheetManager.show fails immediately (e.g., UI not ready), clean up and reject
      // This prevents recursion if the error bubbles back to the calling operation
      settled = true;
      clearTimeout(timeoutId);
      _activeFallbacks.delete(fallbackKey);
      console.error(`[HiveAuth Fallback] Failed to show sheet for ${operationName}:`, sheetError);
      reject(new Error(`HiveAuth fallback UI failed: ${sheetError?.message || 'Unknown error'}`));
    }
  });
};

/**
 * Computes the SHA-256 hash of the input.
 *
 * @param {Buffer} input - The input data to hash (either a Buffer or a string).
 * @returns {Promise<Buffer>} - A Promise that resolves to the hash as a Buffer.
 */
const sha256 = async (input: Buffer | Uint8Array): Promise<Buffer> => {
  // Convert input buffer to a int8array
  const inputData = new Int8Array(input);

  // Compute the SHA-256 hash using expo-crypto
  const hash = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, inputData);

  // Convert the hexadecimal hash string back to a Buffer
  return Buffer.from(hash, 'hex');
};

const generateTrxId = async (transaction: Transaction): Promise<string> => {
  const buffer = new bytebuffer(bytebuffer.DEFAULT_CAPACITY, bytebuffer.LITTLE_ENDIAN);
  try {
    Types.Transaction(buffer, transaction);
  } catch (cause) {
    console.warn('SerializationError', cause);
  }
  buffer.flip();
  const transactionData = Buffer.from(buffer.toBuffer());
  const _bufferHash = await sha256(transactionData);
  return _bufferHash.toString('hex').slice(0, 40); // CryptoJS.enc.Hex;
};

export const sendHiveOperations = async (
  operations: Operation[],
  key: PrivateKey | PrivateKey[],
): Promise<TransactionConfirmation> => {
  try {
    // IMPORTANT: use the same client for TAPOS props + broadcast.
    // Mixing SDK query client/node pool with dhive broadcast node pool can produce
    // expiration mismatches when one pool resolves a lagging RPC node.
    const { head_block_number, head_block_id, time } =
      await client.database.getDynamicGlobalProperties();
    const ref_block_num = head_block_number & 0xffff;
    const ref_block_prefix = Buffer.from(head_block_id, 'hex').readUInt32LE(4);
    const expireTime = 60 * 1000;
    const chainId = Buffer.from(
      'beeab0de00000000000000000000000000000000000000000000000000000000',
      'hex',
    );
    const expiration = new Date(new Date(`${time}Z`).getTime() + expireTime)
      .toISOString()
      .slice(0, -5);
    const extensions = [];

    const tx: Transaction = {
      expiration,
      extensions,
      operations,
      ref_block_num,
      ref_block_prefix,
    };

    const transaction = await cryptoUtils.signTransaction(tx, key, chainId);
    const trxId = await generateTrxId(transaction);
    const resultHive = await client.broadcast.call('broadcast_transaction', [transaction]);
    const result = Object.assign({ id: trxId }, resultHive);
    return result;
  } catch (err) {
    const isDateError = isDsteemDateError(err);
    const dateDiagnostics = isDateError ? await getDateErrorDiagnostics().catch(() => null) : null;

    captureExceptionWithRpcParams(err, { operations }, (scope) => {
      scope.setTag('context', 'send-hive-operations');
      if (isDateError) {
        scope.setTag('error_type', 'dsteem_date_error');
      }
      scope.setContext('operationsArray', {
        operations: operations.map((op) =>
          String(
            Array.isArray(op) ? op[0] : (op as any)?.type ?? (op as any)?.operation ?? 'unknown',
          ),
        ),
      });
      if (dateDiagnostics) {
        scope.setContext('dateDiagnostics', dateDiagnostics);
      }
    });
    throw err;
  }
};

const isHsClientSupported = (authType) => {
  switch (authType) {
    case AUTH_TYPE.STEEM_CONNECT:
    case AUTH_TYPE.HIVE_AUTH:
    case AUTH_TYPE.ACTIVE_KEY:
      return true;
    default:
      return false;
  }
};

/** reuseable broadcast json method with posting auth */

export const broadcastPostingJSON = async (
  id: string,
  json: unknown,
  currentAccount: CurrentAccount,
  pinHash: string,
): Promise<TransactionConfirmation> => {
  const digitPinCode = getDigitPinCode(pinHash);
  const key = getPostingKey(currentAccount.local, digitPinCode);

  // HiveAuth without posting authority: go directly to HiveAuth broadcast
  if (shouldUseDirectHiveAuthBroadcast(currentAccount)) {
    const custom_json = {
      id,
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [currentAccount.name],
    };
    const customJsonOp: Operation = ['custom_json', custom_json];
    return handleHiveAuthFallback(
      currentAccount,
      [customJsonOp],
      `custom_json:${id}`,
    ) as Promise<TransactionConfirmation>;
  }

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    try {
      return await api
        .customJson([], [currentAccount.name], id, JSON.stringify(json))
        .then((r) => r.result as TransactionConfirmation);
    } catch (err) {
      // Check if this is a HiveAuth user with auth error (missing authority, expired token, etc.)
      const isHiveAuth = currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH;

      if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
        // Build custom_json operation
        const custom_json = {
          id,
          json: JSON.stringify(json),
          required_auths: [],
          required_posting_auths: [currentAccount.name],
        };
        const customJsonOp: Operation = ['custom_json', custom_json];

        return handleHiveAuthFallback(
          currentAccount,
          [customJsonOp],
          `custom_json:${id}`,
        ) as Promise<TransactionConfirmation>;
      }

      throw err;
    }
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const custom_json = {
      id,
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [currentAccount.name],
    };
    const opArray: Operation[] = [['custom_json', custom_json] as Operation];

    return new Promise<TransactionConfirmation>((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const buildActiveCustomJsonOpArr = (
  username: string,
  operationId: string,
  json: unknown,
): Operation[] => {
  return [
    [
      'custom_json',
      {
        id: operationId,
        json: JSON.stringify(json),
        required_auths: [username],
        required_posting_auths: [],
      },
    ] as Operation,
  ];
};

/**
 * Builds operation array for boosting a post
 * @param username - User's account name
 * @param point - Points to spend on boost
 * @param author - Post author
 * @param permlink - Post permlink
 * @returns Operation array for broadcasting
 */
export const buildBoostOpArr = (
  username: string,
  point: number,
  author: string,
  permlink: string,
): Operation[] => {
  return buildActiveCustomJsonOpArr(username, 'ecency_boost', {
    user: username,
    author,
    permlink,
    amount: `${point.toFixed(3)} POINT`,
  });
};
/**
 * Builds operation array for token transfer
 * @param from - Sender account name
 * @param destination - Receiver account name(s) - can be comma or space separated
 * @param amount - Amount with asset symbol (e.g., "1.000 HIVE")
 * @param memo - Transfer memo
 * @returns Operation array for broadcasting
 */
export const buildTransferTokenOpArr = (
  from: string,
  destination: string,
  amount: string,
  memo: string,
): Operation[] => {
  // Split the destination input into an array of usernames
  // Handles both spaces and commas as separators
  const destinations = destination
    ? destination
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean)
    : [];

  // Create a transfer operation for each destination username
  return destinations.map((dest) => [
    'transfer',
    {
      from,
      to: dest.trim(),
      amount,
      memo,
    },
  ]) as Operation[];
};

/**
 * Builds operation array for recurrent transfer
 */
export const buildRecurrentTransferOpArr = (
  from: string,
  destination: string,
  amount: string,
  memo: string,
  recurrence: number,
  executions: number,
): Operation[] => {
  return [
    [
      'recurrent_transfer',
      {
        from,
        to: destination,
        amount,
        memo,
        recurrence,
        executions,
        extensions: [],
      },
    ],
  ] as Operation[];
};

/**
 * Builds operation array for HBD conversion
 */
export const buildConvertOpArr = (
  owner: string,
  amount: string,
  requestId: number,
): Operation[] => {
  return [
    [
      'convert',
      {
        owner,
        amount,
        requestid: requestId,
      },
    ],
  ] as Operation[];
};

/**
 * Builds operation array for transfer to savings
 */
export const buildTransferToSavingsOpArr = (
  from: string,
  destination: string,
  amount: string,
  memo: string,
): Operation[] => {
  return [
    [
      'transfer_to_savings',
      {
        from,
        to: destination,
        amount,
        memo,
      },
    ],
  ] as Operation[];
};

/**
 * Builds operation array for transfer from savings
 */
export const buildTransferFromSavingsOpArr = (
  from: string,
  destination: string,
  amount: string,
  memo: string,
  requestId: number,
): Operation[] => {
  return [
    [
      'transfer_from_savings',
      {
        from,
        to: destination,
        amount,
        memo,
        request_id: requestId,
      },
    ],
  ] as Operation[];
};

/**
 * Builds operation array for transfer to vesting (power up)
 */
export const buildTransferToVestingOpArr = (
  from: string,
  destination: string,
  amount: string,
): Operation[] => {
  return [
    [
      'transfer_to_vesting',
      {
        from,
        to: destination,
        amount,
      },
    ],
  ] as Operation[];
};

/**
 * Builds operation array for withdraw vesting (power down)
 */
export const buildWithdrawVestingOpArr = (account: string, vestingShares: string): Operation[] => {
  return [
    [
      'withdraw_vesting',
      {
        account,
        vesting_shares: vestingShares,
      },
    ],
  ] as Operation[];
};

/**
 * Builds operation array for delegate vesting shares (HP delegation)
 */
export const buildDelegateVestingSharesOpArr = (
  delegator: string,
  delegatee: string,
  vestingShares: string,
): Operation[] => {
  return [
    [
      'delegate_vesting_shares',
      {
        delegator,
        delegatee,
        vesting_shares: vestingShares,
      },
    ],
  ] as Operation[];
};

/**
 * Builds operation array for set withdraw vesting route
 */
export const buildSetWithdrawVestingRouteOpArr = (
  fromAccount: string,
  toAccount: string,
  percent: number,
  autoVest: boolean,
): Operation[] => {
  return [
    [
      'set_withdraw_vesting_route',
      {
        from_account: fromAccount,
        to_account: toAccount,
        percent,
        auto_vest: autoVest,
      },
    ],
  ] as Operation[];
};

/**
 * Builds operation array for Ecency point transfer
 */
export const buildTransferPointOpArr = (
  sender: string,
  destination: string,
  amount: string,
  memo: string,
): Operation[] => {
  // Split the destination input into an array of usernames
  const destinations = destination ? destination.trim().split(/[\s,]+/) : [];

  // Create a transfer operation for each destination username
  return destinations.map((dest) => {
    const json = JSON.stringify({
      sender,
      receiver: dest.trim(),
      amount,
      memo,
    });
    return [
      'custom_json',
      {
        id: 'ecency_point_transfer',
        json,
        required_auths: [sender],
        required_posting_auths: [],
      },
    ];
  }) as Operation[];
};

export const getDigitPinCode = (pin) => decryptKey(pin, Config.PIN_KEY);

export const getDynamicGlobalProperties = async () => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getDynamicPropsQueryOptions());
};
/**
 * Get market statistics using SDK query
 */
export const getMarketStatistics = () => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getMarketStatisticsQueryOptions());
};
/**
 * @method getAccount fetch raw account data without post processings
 * @param username username
 * Uses SDK internally for blockchain data fetching
 */
export const getAccount = async (username) => {
  const queryClient = getQueryClient();
  const accounts = await queryClient.fetchQuery(getAccountsQueryOptions([username]));

  if (accounts && accounts.length > 0) {
    return accounts[0];
  }
  throw new Error(`Account not found, ${username}`);
};

/**
 * @method getAccount get account data
 * @param user username
 */
export const getState = async (path) => {
  try {
    const state = await client.database.getState(path);
    return state;
  } catch (error) {
    return error;
  }
};

const getUserReputation = async (author) => {
  try {
    const response = await client.call('condenser_api', 'get_account_reputations', [author, 1]);

    if (response && response.length < 1) {
      return 0;
    }

    const _account = {
      ...response[0],
    };

    return parseReputation(_account.reputation);
  } catch (error) {
    captureExceptionWithRpcParams(error, { author });
    return 0;
  }
};

const vestToSteem = async (vestingShares, totalVestingShares, totalVestingFundSteem) =>
  (
    parseFloat(totalVestingFundSteem) *
    (parseFloat(vestingShares) / parseFloat(totalVestingShares))
  ).toFixed(0);

/**
 * @method getUser get account data with calculated fields
 * @param user username
 * Uses SDK internally for blockchain data fetching
 */
export const getUser = async (user) => {
  try {
    const queryClient = getQueryClient();

    // Fetch account data using SDK
    const accountData = await queryClient.fetchQuery(getAccountFullQueryOptions(user));
    if (!accountData) {
      return null;
    }

    const _account = {
      ...accountData,
    };
    const unreadActivityCount = 0;

    let globalProperties;
    try {
      globalProperties = await getDynamicGlobalProperties();
    } catch (error) {
      globalProperties = getCache('globalDynamic');
    }

    const rcPower =
      (user &&
        (await client.call('rc_api', 'find_rc_accounts', {
          accounts: [user],
        }))) ||
      getCache('rcPower');
    await setCache('rcPower', rcPower);

    _account.reputation = await getUserReputation(user);
    _account.username = _account.name;
    _account.unread_activity_count = unreadActivityCount;
    _account.vp_manabar = client.rc.calculateVPMana(_account);
    _account.rc_manabar = client.rc.calculateRCMana(rcPower.rc_accounts[0]);

    // Use raw blockchain data for vesting calculations (snake_case fields)
    const rawGlobalProps =
      globalProperties?.raw?.globalDynamic ?? globalProperties?.globalDynamic ?? globalProperties;
    if (!rawGlobalProps) {
      throw new Error('Missing global properties');
    }
    _account.steem_power = await vestToSteem(
      _account.vesting_shares,
      rawGlobalProps.total_vesting_shares,
      rawGlobalProps.total_vesting_fund_hive,
    );
    _account.received_steem_power = await vestToSteem(
      get(_account, 'received_vesting_shares'),
      get(rawGlobalProps, 'total_vesting_shares'),
      get(rawGlobalProps, 'total_vesting_fund_hive'),
    );
    _account.delegated_steem_power = await vestToSteem(
      get(_account, 'delegated_vesting_shares'),
      get(rawGlobalProps, 'total_vesting_shares'),
      get(rawGlobalProps, 'total_vesting_fund_hive'),
    );

    // Parse profile metadata using SDK
    // parseProfileMetadata may return: { profile: {...} } or {...} directly
    if (has(_account, 'posting_json_metadata')) {
      try {
        const parsed = parseProfileMetadata(get(_account, 'posting_json_metadata'));
        // Handle both formats: extract profile field if wrapped, or use directly
        _account.profile = parsed?.profile || parsed || {};
      } catch (e) {
        _account.profile = {};
      }
    } else {
      _account.profile = {};
    }

    // getName/getAvatar now handle both formats (profile object or wrapped)
    _account.avatar = getAvatar(_account.profile);
    _account.display_name = getName(_account.profile);

    return _account;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getCommunity = async (tag, observer = '') => {
  try {
    const queryClient = getQueryClient();
    const community = await queryClient.fetchQuery(getCommunityQueryOptions(tag, observer));
    if (community) {
      return community;
    } else {
      return {};
    }
  } catch (err) {
    captureExceptionWithRpcParams(err, { tag, observer }, (scope) => {
      scope.setContext('info', { message: 'failed to get community' });
    });
    throw err;
  }
};

export const ignoreUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getPostingKey(currentAccount.local, digitPinCode);

  // HiveAuth without posting authority: go directly to HiveAuth broadcast
  if (shouldUseDirectHiveAuthBroadcast(currentAccount)) {
    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: ['ignore'],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };
    const ignoreOp: Operation = ['custom_json', json];
    return handleHiveAuthFallback(currentAccount, [ignoreOp], 'ignore');
  }

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    try {
      return await api.ignore(data.follower, data.following);
    } catch (err) {
      // Check if this is a HiveAuth user with auth error (missing authority, expired token, etc.)
      const isHiveAuth = currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH;

      if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
        // Build ignore operation
        const json = {
          id: 'follow',
          json: jsonStringify([
            'follow',
            {
              follower: `${data.follower}`,
              following: `${data.following}`,
              what: ['ignore'],
            },
          ]),
          required_auths: [],
          required_posting_auths: [`${data.follower}`],
        };
        const ignoreOp: Operation = ['custom_json', json];

        return handleHiveAuthFallback(currentAccount, [ignoreOp], 'ignore');
      }

      throw err;
    }
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: ['ignore'],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };
    const opArray = [['custom_json', json]];

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const getPurePost = async (author, permlink) => {
  author = author && author.toLowerCase();
  permlink = permlink && permlink.toLowerCase();
  try {
    return await client.call('bridge', 'get_post', { author, permlink });
  } catch (error) {
    console.warn('Failed to get pure post', error);
    captureExceptionWithRpcParams(error, { author, permlink }, (scope) => {
      scope.setContext('params', { author, permlink });
    });
    return error;
  }
};

export const signImage = async (file, currentAccount, pin) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getPostingKey(currentAccount.local, digitPinCode);

  if (isHsClientSupported(currentAccount.local.authType)) {
    return decryptKey(currentAccount.local.accessToken, digitPinCode);
  }
  if (key) {
    const message = {
      signed_message: { type: 'posting', app: 'ecency.app' },
      authors: [currentAccount.name],
      timestamp: parseInt(new Date().getTime() / 1000, 10),
    };
    const hash = cryptoUtils.sha256(JSON.stringify(message));

    const privateKey = PrivateKey.fromString(key);
    const signature = privateKey.sign(hash).toString();
    message.signatures = [signature];
    return b64uEnc(JSON.stringify(message));
  }
};

// /**
//  * @method getBlockNum return block num based on transaction id
//  * @param trx_id transactionId
//  */
// const getBlockNum = async (trx_id) => {
//   try {
//     console.log('Getting transaction data', trx_id);
//     const transData = await client.call('condenser_api', 'get_transaction', [trx_id]);
//     const blockNum = transData.block_num;
//     console.log('Block number', blockNum);
//     return blockNum;
//   } catch (err) {
//     console.warn('Failed to get transaction data: ', err);
//     return undefined;
//   }
// };

/**
 * @method upvote upvote a content
 * @param vote vote object(author, permlink, voter, weight)
 * @param postingKey private posting key
 */

export const vote = async (account, pin, author, permlink, weight) => {
  try {
    const resp = await _vote(account, pin, author, permlink, weight);
    console.log('Returning vote response', resp);

    return resp;
  } catch (err) {
    console.warn('Failed to complete vote', err);
    return Promise.reject(err);
  }
};

const _vote = (currentAccount, pin, author, permlink, weight) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getPostingKey(currentAccount.local, digitPinCode);
  const voter = currentAccount.name || currentAccount.username;

  // HiveAuth without posting authority: go directly to HiveAuth broadcast
  if (shouldUseDirectHiveAuthBroadcast(currentAccount)) {
    const voteOp: Operation = ['vote', { voter, author, permlink, weight }];
    return handleHiveAuthFallback(currentAccount, [voteOp], 'vote');
  }

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    return new Promise((resolve, reject) => {
      api
        .vote(voter, author, permlink, weight)
        .then((result) => {
          resolve(result.result);
        })
        .catch(async (err) => {
          captureExceptionWithRpcParams(err, { voter, author, permlink, weight });

          // Check if this is a HiveAuth user
          const isHiveAuth = currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH;

          console.log('[Vote] Operation failed:', {
            isHiveAuth,
            errorMessage: err?.message,
            errorType: err?.constructor?.name,
          });

          if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
            console.log('[Vote] Triggering HiveAuth fallback');
            // Build vote operation
            const voteOp: Operation = [
              'vote',
              {
                voter,
                author,
                permlink,
                weight,
              },
            ];

            try {
              const result = await handleHiveAuthFallback(currentAccount, [voteOp], 'vote');
              resolve(result);
              return;
            } catch (fallbackErr) {
              console.error('[Vote] HiveAuth fallback failed:', fallbackErr);
              reject(fallbackErr);
              return;
            }
          }

          reject(err);
        });
    });
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const voter = currentAccount.name || currentAccount.username;
    const args = [
      [
        'vote',
        {
          voter,
          author,
          permlink,
          weight,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          console.log('vote result', result);
          resolve(result);
        })
        .catch((err) => {
          if (err && get(err, 'jse_info.code') === 4030100) {
            err.message = getDsteemDateErrorMessage(err);
          }
          captureExceptionWithRpcParams(err, { voter, author, permlink, weight });
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};
export const transferToken = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth users: always use HiveAuth broadcast for active-key operations
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const destinationInput = data.destination;
    const destinations = destinationInput
      ? destinationInput
          .trim()
          .split(/[\s,]+/)
          .filter(Boolean)
      : [];

    const opArray: Operation[] = destinations.map((destination) => [
      'transfer',
      {
        from: data.from,
        to: destination.trim(),
        amount: data.amount,
        memo: data.memo,
      },
    ]);

    return handleHiveAuthFallback(currentAccount, opArray, 'transfer');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const destinationInput = data.destination;

    // Split the destination input into an array of usernames
    // Handles both spaces and commas as separators
    const destinations = destinationInput
      ? destinationInput
          .trim()
          .split(/[\s,]+/)
          .filter(Boolean) // Split by spaces or commas
      : [];

    // Prepare the base arguments for the transfer operation
    const baseArgs = {
      from: data.from,
      amount: data.amount,
      memo: data.memo,
    };

    // Create a transfer operation for each destination username
    const opArray = destinations.map((destination) => {
      const args = { ...baseArgs, to: destination.trim() }; // Trim whitespace
      return ['transfer', args];
    });

    console.log(opArray); // Output the array of operations

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          if (result) {
            resolve(result);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const recurrentTransferToken = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const args = {
      from: get(data, 'from'),
      to: get(data, 'destination'),
      amount: get(data, 'amount'),
      memo: get(data, 'memo'),
      recurrence: get(data, 'recurrence'),
      executions: get(data, 'executions'),
      extensions: [],
    };
    const opArray: Operation[] = [[TransferTypes.RECURRENT_TRANSFER, args]];
    return handleHiveAuthFallback(currentAccount, opArray, 'recurrent_transfer');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = {
      from: get(data, 'from'),
      to: get(data, 'destination'),
      amount: get(data, 'amount'),
      memo: get(data, 'memo'),
      recurrence: get(data, 'recurrence'),
      executions: get(data, 'executions'),
      extensions: [],
    };

    const opArray = [[TransferTypes.RECURRENT_TRANSFER, args]];

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          if (result) {
            resolve(result);
          }
        })
        .catch((err) => {
          console.log('====================================');
          console.log('error on recurrent transfer token');
          console.log('====================================');
          console.log(err);
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const convert = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const opArray: Operation[] = [
      [
        'convert',
        {
          owner: get(data, 'from'),
          amount: get(data, 'amount'),
          requestid: get(data, 'requestId'),
        },
      ],
    ];
    return handleHiveAuthFallback(currentAccount, opArray, 'convert');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const args = [
      [
        'convert',
        {
          owner: get(data, 'from'),
          amount: get(data, 'amount'),
          requestid: get(data, 'requestId'),
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          if (result) {
            resolve(result);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const transferToSavings = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const opArray: Operation[] = [
      [
        'transfer_to_savings',
        {
          from: get(data, 'from'),
          to: get(data, 'destination'),
          amount: get(data, 'amount'),
          memo: get(data, 'memo'),
        },
      ],
    ];
    return handleHiveAuthFallback(currentAccount, opArray, 'transfer_to_savings');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const args = [
      [
        'transfer_to_savings',
        {
          from: get(data, 'from'),
          to: get(data, 'destination'),
          amount: get(data, 'amount'),
          memo: get(data, 'memo'),
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const transferFromSavings = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const opArray: Operation[] = [
      [
        'transfer_from_savings',
        {
          from: get(data, 'from'),
          to: get(data, 'destination'),
          amount: get(data, 'amount'),
          memo: get(data, 'memo'),
          request_id: get(data, 'requestId'),
        },
      ],
    ];
    return handleHiveAuthFallback(currentAccount, opArray, 'transfer_from_savings');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'transfer_from_savings',
        {
          from: get(data, 'from'),
          to: get(data, 'destination'),
          amount: get(data, 'amount'),
          memo: get(data, 'memo'),
          request_id: get(data, 'requestId'),
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const transferToVesting = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const opArray: Operation[] = [
      [
        'transfer_to_vesting',
        {
          from: data.from,
          to: data.destination,
          amount: data.amount,
        },
      ],
    ];
    return handleHiveAuthFallback(currentAccount, opArray, 'transfer_to_vesting');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'transfer_to_vesting',
        {
          from: data.from,
          to: data.destination,
          amount: data.amount,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const withdrawVesting = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const opArray: Operation[] = [
      [
        'withdraw_vesting',
        {
          account: data.from,
          vesting_shares: data.amount,
        },
      ],
    ];
    return handleHiveAuthFallback(currentAccount, opArray, 'withdraw_vesting');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'withdraw_vesting',
        {
          account: data.from,
          vesting_shares: data.amount,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const delegateVestingShares = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const opArray: Operation[] = [
      [
        'delegate_vesting_shares',
        {
          delegator: data.from,
          delegatee: data.destination,
          vesting_shares: data.amount,
        },
      ],
    ];
    return handleHiveAuthFallback(currentAccount, opArray, 'delegate_vesting_shares');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'delegate_vesting_shares',
        {
          delegator: data.from,
          delegatee: data.destination,
          vesting_shares: data.amount,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};
export const setWithdrawVestingRoute = (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const opArray: Operation[] = [
      [
        'set_withdraw_vesting_route',
        {
          from_account: data.from,
          to_account: data.to,
          percent: data.percentage,
          auto_vest: data.autoVest,
        },
      ],
    ];
    return handleHiveAuthFallback(currentAccount, opArray, 'set_withdraw_vesting_route');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const args = [
      [
        'set_withdraw_vesting_route',
        {
          from_account: data.from,
          to_account: data.to,
          percent: data.percentage,
          auto_vest: data.autoVest,
        },
      ],
    ];

    return new Promise((resolve, reject) => {
      sendHiveOperations(args, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const followUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getPostingKey(currentAccount.local, digitPinCode);

  // HiveAuth without posting authority: go directly to HiveAuth broadcast
  if (shouldUseDirectHiveAuthBroadcast(currentAccount)) {
    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: ['blog'],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };
    const followOp: Operation = ['custom_json', json];
    return handleHiveAuthFallback(currentAccount, [followOp], 'follow');
  }

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    try {
      return await api.follow(data.follower, data.following);
    } catch (err) {
      // Check if this is a HiveAuth user with missing posting authority
      const isHiveAuth = currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH;

      console.log('[Follow] Operation failed:', {
        isHiveAuth,
        errorMessage: err?.message,
        errorType: err?.constructor?.name,
      });

      if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
        console.log('[Follow] Triggering HiveAuth fallback');
        // Build follow operation
        const json = {
          id: 'follow',
          json: jsonStringify([
            'follow',
            {
              follower: `${data.follower}`,
              following: `${data.following}`,
              what: ['blog'],
            },
          ]),
          required_auths: [],
          required_posting_auths: [`${data.follower}`],
        };
        const followOp: Operation = ['custom_json', json];

        try {
          const result = await handleHiveAuthFallback(currentAccount, [followOp], 'follow');
          console.log('[Follow] HiveAuth fallback succeeded');
          return result;
        } catch (fallbackErr) {
          console.error('[Follow] HiveAuth fallback failed:', fallbackErr);
          throw fallbackErr;
        }
      }

      throw err;
    }
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: ['blog'],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };
    const opArray = [['custom_json', json]];

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const unfollowUser = async (currentAccount, pin, data) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getPostingKey(currentAccount.local, digitPinCode);

  // HiveAuth without posting authority: go directly to HiveAuth broadcast
  if (shouldUseDirectHiveAuthBroadcast(currentAccount)) {
    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: [],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };
    const unfollowOp: Operation = ['custom_json', json];
    return handleHiveAuthFallback(currentAccount, [unfollowOp], 'unfollow');
  }

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(currentAccount.local.accessToken, digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    try {
      return await api.unfollow(data.follower, data.following);
    } catch (err) {
      // Check if this is a HiveAuth user with missing posting authority or other auth errors
      const isHiveAuth = currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH;

      console.log('[Unfollow] Operation failed:', {
        isHiveAuth,
        errorMessage: err?.message,
        errorType: err?.constructor?.name,
      });

      if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
        console.log('[Unfollow] Triggering HiveAuth fallback');

        // Build unfollow operation
        const json = {
          id: 'follow',
          json: jsonStringify([
            'follow',
            {
              follower: `${data.follower}`,
              following: `${data.following}`,
              what: [],
            },
          ]),
          required_auths: [],
          required_posting_auths: [`${data.follower}`],
        };
        const unfollowOp: Operation = ['custom_json', json];

        try {
          const result = await handleHiveAuthFallback(currentAccount, [unfollowOp], 'unfollow');
          console.log('[Unfollow] HiveAuth fallback succeeded');
          return result;
        } catch (fallbackErr) {
          console.error('[Unfollow] HiveAuth fallback failed:', fallbackErr);
          throw fallbackErr;
        }
      }

      throw err;
    }
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const json = {
      id: 'follow',
      json: jsonStringify([
        'follow',
        {
          follower: `${data.follower}`,
          following: `${data.following}`,
          what: [],
        },
      ]),
      required_auths: [],
      required_posting_auths: [`${data.follower}`],
    };
    const opArray = [['custom_json', json]];
    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const markHiveNotifications = async (currentAccount, pinHash) => {
  const digitPinCode = getDigitPinCode(pinHash);
  const key = getPostingKey(currentAccount.local, digitPinCode);

  const now = new Date().toISOString();
  const date = now.split('.')[0];

  const params = {
    id: 'notify',
    required_auths: [],
    required_posting_auths: [currentAccount.name],
    json: JSON.stringify(['setLastRead', { date }]),
  };
  const params1 = {
    id: 'ecency_notify',
    required_auths: [],
    required_posting_auths: [currentAccount.name],
    json: JSON.stringify(['setLastRead', { date }]),
  };

  const opArray: Operation[] = [
    ['custom_json', params],
    ['custom_json', params1],
  ];

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    try {
      return await api.broadcast(opArray).then((resp) => resp.result);
    } catch (err) {
      const isHiveAuth = currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH;
      if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
        return handleHiveAuthFallback(currentAccount, opArray, 'mark_notifications');
      }
      throw err;
    }
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const lookupAccounts = async (username) => {
  try {
    const users = await client.database.call('lookup_accounts', [username, 20]);
    return users;
  } catch (error) {
    return [];
    // throw error;
  }
};

export const getTrendingTags = async (number = 20) => {
  try {
    const queryClient = getQueryClient();
    const result = await queryClient.fetchQuery(getTrendingTagsQueryOptions(number));
    const tags = result || [];
    return tags;
  } catch (error) {
    return [];
  }
};
export const postContent = (
  account,
  pin,
  parentAuthor,
  parentPermlink,
  permlink,
  title,
  body,
  jsonMetadata,
  options = null,
  voteWeight = null,
) =>
  _postContent(
    account,
    pin,
    parentAuthor,
    parentPermlink,
    permlink,
    title,
    body,
    jsonMetadata,
    options,
    voteWeight,
  )
    .then((resp) => {
      return resp;
    })
    .catch((err) => {
      console.warn('Failed to post conent', err);
      captureExceptionWithRpcParams(err, {
        account: account?.name,
        parentAuthor,
        parentPermlink,
        permlink,
      });
      throw err;
    });

/**
 * @method _postContent post content to blockchain (used for post creation/editing)
 * @param comment comment object { author, permlink, ... }
 */
const _postContent = async (
  account,
  pin,
  parentAuthor,
  parentPermlink,
  permlink,
  title,
  body,
  jsonMetadata,
  options = null,
  voteWeight = null,
) => {
  const { name: author } = account;
  const digitPinCode = getDigitPinCode(pin);
  const key = getPostingKey(account.local, digitPinCode);

  // HiveAuth without posting authority: go directly to HiveAuth broadcast
  if (shouldUseDirectHiveAuthBroadcast(account)) {
    const opArray: Operation[] = [
      [
        'comment',
        {
          parent_author: parentAuthor,
          parent_permlink: parentPermlink || '',
          author,
          permlink,
          title,
          body,
          json_metadata: jsonStringify(jsonMetadata),
        },
      ],
    ];
    if (options) {
      opArray.push(['comment_options', options] as Operation);
    }
    if (voteWeight) {
      opArray.push(['vote', { voter: author, author, permlink, weight: voteWeight }] as Operation);
    }
    return handleHiveAuthFallback(
      account,
      opArray,
      'post_content',
    ) as Promise<TransactionConfirmation>;
  }

  if (isHsClientSupported(account.local.authType)) {
    const token = decryptKey(account.local.accessToken, digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    const params = {
      parent_author: parentAuthor,
      parent_permlink: parentPermlink || '',
      author,
      permlink,
      title,
      body,
      json_metadata: jsonStringify(jsonMetadata),
    };

    const opArray = [['comment', params]];

    if (options) {
      const e = ['comment_options', options];
      opArray.push(e);
    }

    if (voteWeight) {
      const e = [
        'vote',
        {
          voter: author,
          author,
          permlink,
          weight: voteWeight,
        },
      ];
      opArray.push(e);
    }

    try {
      return await api.broadcast(opArray).then((resp) => resp.result);
    } catch (err) {
      // Check if this is a HiveAuth user with auth error (missing authority, expired token, etc.)
      const isHiveAuth = account.local?.authType === AUTH_TYPE.HIVE_AUTH;

      if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
        return handleHiveAuthFallback(
          account,
          opArray as Operation[],
          'post_content',
        ) as Promise<TransactionConfirmation>;
      }

      throw err;
    }
  }

  if (key) {
    const opArray = [
      [
        'comment',
        {
          parent_author: parentAuthor,
          parent_permlink: parentPermlink,
          author,
          permlink,
          title,
          body,
          json_metadata: jsonStringify(jsonMetadata),
        },
      ],
    ];

    if (options) {
      const e = ['comment_options', options];
      opArray.push(e);
    }

    if (voteWeight) {
      const e = [
        'vote',
        {
          voter: author,
          author,
          permlink,
          weight: voteWeight,
        },
      ];
      opArray.push(e);
    }

    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          if (error && get(error, 'jse_info.code') === 4030100) {
            error.message = getDsteemDateErrorMessage(error);
          }
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

// Re-blog
// TODO: remove pinCode
export const reblog = (account, pinCode, author, permlink, undo = false) =>
  _reblog(account, pinCode, author, permlink, undo).then((resp) => {
    return resp;
  });

const _reblog = async (account, pinCode, author, permlink, undo = false) => {
  const json = [
    'reblog',
    {
      account: account.name,
      author,
      permlink,
      delete: undo ? 'delete' : undefined,
    },
  ];

  return broadcastPostingJSON('follow', json, account, pinCode);
};

export const claimRewardBalance = async (account, pinCode, rewardHive, rewardHbd, rewardVests) => {
  const pin = getDigitPinCode(pinCode);
  const key = getPostingKey(get(account, 'local'), pin);

  // HiveAuth without posting authority: go directly to HiveAuth broadcast
  if (shouldUseDirectHiveAuthBroadcast(account)) {
    const claimOp: Operation = [
      'claim_reward_balance',
      {
        account: account.name,
        reward_hive: rewardHive,
        reward_hbd: rewardHbd,
        reward_vests: rewardVests,
      },
    ];
    return handleHiveAuthFallback(account, [claimOp], 'claim_reward_balance');
  }

  if (isHsClientSupported(account.local.authType)) {
    const token = decryptKey(get(account, 'local.accessToken'), pin);
    const api = new hsClient({
      accessToken: token,
    });

    // Verify the method exists before calling
    if (typeof api.claimRewardBalance !== 'function') {
      const errorMsg = `HiveSigner client error: claimRewardBalance is ${typeof api.claimRewardBalance}. API object: ${JSON.stringify(
        Object.keys(api || {}),
      )}`;
      Sentry.captureMessage(errorMsg, 'error');
      return Promise.reject(new Error(errorMsg));
    }

    try {
      return await api.claimRewardBalance(get(account, 'name'), rewardHive, rewardHbd, rewardVests);
    } catch (err) {
      // Check if this is a HiveAuth user with auth error (missing authority, expired token, etc.)
      const isHiveAuth = account.local?.authType === AUTH_TYPE.HIVE_AUTH;

      if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
        // Build claim_reward_balance operation
        const claimOp: Operation = [
          'claim_reward_balance',
          {
            account: account.name,
            reward_hive: rewardHive,
            reward_hbd: rewardHbd,
            reward_vests: rewardVests,
          },
        ];

        return handleHiveAuthFallback(account, [claimOp], 'claim_reward_balance');
      }

      throw err;
    }
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const opArray = [
      [
        'claim_reward_balance',
        {
          account: account.name,
          reward_hive: rewardHive,
          reward_hbd: rewardHbd,
          reward_vests: rewardVests,
        },
      ],
    ];

    return sendHiveOperations(opArray, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const transferPoint = (currentAccount, pinCode, data) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);
  const username = get(currentAccount, 'name');

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const destinationInput = data.destination;
    const destinations = destinationInput
      ? destinationInput
          .trim()
          .split(/[\s,]+/)
          .filter(Boolean)
      : [];

    const opArray: Operation[] = destinations.map((destination) => {
      const json = JSON.stringify({
        sender: data.from,
        amount: data.amount,
        memo: data.memo,
        receiver: destination.trim(),
      });
      return [
        'custom_json',
        {
          id: 'ecency_point_transfer',
          json,
          required_auths: [username],
          required_posting_auths: [],
        },
      ] as Operation;
    });
    return handleHiveAuthFallback(currentAccount, opArray, 'transfer_point');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const destinationInput = data.destination;

    // Split the destination input into an array of usernames
    // Handles both spaces and commas as separators
    const destinations = destinationInput
      ? destinationInput
          .trim()
          .split(/[\s,]+/)
          .filter(Boolean) // Split by spaces or commas
      : [];

    // Prepare the base arguments for the transfer operation
    const baseArgs = {
      sender: data.from,
      amount: data.amount,
      memo: data.memo,
    };

    // Create a transfer operation for each destination username
    const opArray = destinations.map((destination) => {
      const json = JSON.stringify({ ...baseArgs, receiver: destination.trim() }); // Trim whitespace
      const op = {
        id: 'ecency_point_transfer',
        json,
        required_auths: [username],
        required_posting_auths: [],
      };
      return ['custom_json', op];
    });

    console.log(opArray); // Output the array of operations

    return sendHiveOperations(opArray, privateKey);
  } else {
    const err = new Error('Check private key permission! Required private active key or above.');
    captureExceptionWithRpcParams(err, { username: currentAccount.name, data }, (scope) => {
      scope.setUser({ username: currentAccount.name });
      scope.setTag('context', 'transfer-points');
    });
    return Promise.reject(err);
  }
};

export const promote = (currentAccount, pinCode, duration, author, permlink) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const user = get(currentAccount, 'name');
    const json = {
      id: 'ecency_promote',
      json: JSON.stringify({ user, author, permlink, duration }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray: Operation[] = [['custom_json', json]];
    return handleHiveAuthFallback(currentAccount, opArray, 'promote');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const user = get(currentAccount, 'name');

    const json = {
      id: 'ecency_promote',
      json: JSON.stringify({
        user,
        author,
        permlink,
        duration,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray = [['custom_json', json]];

    return sendHiveOperations(opArray, privateKey);
  } else {
    const err = new Error('Check private key permission! Required private active key or above.');
    captureExceptionWithRpcParams(
      err,
      { username: currentAccount.name, author, permlink, duration },
      (scope) => {
        scope.setUser({ username: currentAccount.name });
        scope.setTag('context', 'promoting-content');
      },
    );
    return Promise.reject(err);
  }
};

export const boostPlus = (currentAccount, pinCode, duration, account) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const user = get(currentAccount, 'name');
    const json = {
      id: 'ecency_boost_plus',
      json: JSON.stringify({ user, account, duration }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray: Operation[] = [['custom_json', json]];
    return handleHiveAuthFallback(currentAccount, opArray, 'boost_plus');
  }

  if (key) {
    const privateKey = PrivateKey.fromString(key);
    const user = get(currentAccount, 'name');

    const json = {
      id: 'ecency_boost_plus',
      json: JSON.stringify({
        user,
        account,
        duration,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray = [['custom_json', json]];

    return sendHiveOperations(opArray, privateKey);
  } else {
    const err = new Error('Check private key permission! Required private active key or above.');
    captureExceptionWithRpcParams(
      err,
      { username: currentAccount.name, account, duration },
      (scope) => {
        scope.setUser({ username: currentAccount.name });
        scope.setTag('context', 'boost-plus-content');
      },
    );
    return Promise.reject(err);
  }
};

export const boost = (currentAccount, pinCode, point, author, permlink) => {
  const pin = getDigitPinCode(pinCode);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  // HiveAuth: sign via HiveAuth app (active authority)
  if (currentAccount?.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    if (!point) {
      return Promise.reject(new Error('Points amount is required'));
    }
    const user = get(currentAccount, 'name');
    const json = {
      id: 'ecency_boost',
      json: JSON.stringify({
        user,
        author,
        permlink,
        amount: `${point.toFixed(3)} POINT`,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray: Operation[] = [['custom_json', json]];
    return handleHiveAuthFallback(currentAccount, opArray, 'boost');
  }

  if (key && point) {
    const privateKey = PrivateKey.fromString(key);
    const user = get(currentAccount, 'name');

    const json = {
      id: 'ecency_boost',
      json: JSON.stringify({
        user,
        author,
        permlink,
        amount: `${point.toFixed(3)} POINT`,
      }),
      required_auths: [user],
      required_posting_auths: [],
    };
    const opArray = [['custom_json', json]];

    return sendHiveOperations(opArray, privateKey);
  } else {
    const err = new Error('Check private key permission! Required private active key or above.');
    captureExceptionWithRpcParams(
      err,
      { username: currentAccount.name, author, permlink, point },
      (scope) => {
        scope.setUser({ username: currentAccount.name });
        scope.setTag('context', 'boosting-content');
      },
    );
    return Promise.reject(err);
  }
};

export const grantPostingPermission = async (json, pin, currentAccount) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getActiveKey(get(currentAccount, 'local'), digitPinCode);

  const existingAuths = get(currentAccount, 'posting.account_auths', []);
  const updatedAuths = existingAuths.some((auth) => auth[0] === 'ecency.app')
    ? [...existingAuths]
    : [...existingAuths, ['ecency.app', get(currentAccount, 'posting.weight_threshold')]];
  updatedAuths.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

  const newPosting = Object.assign(
    {},
    {
      ...get(currentAccount, 'posting'),
    },
    {
      account_auths: updatedAuths,
    },
  );

  // HiveAuth users: account_update requires ACTIVE authority
  // Access tokens don't have active authority, so directly trigger HiveAuth broadcast
  if (currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH) {
    const _params = {
      account: get(currentAccount, 'name'),
      posting: newPosting,
      memo_key: get(currentAccount, 'memo_key'),
      json_metadata: json,
    };

    const opArray: Operation[] = [['account_update', _params]];

    return handleHiveAuthFallback(
      currentAccount,
      opArray,
      'grant_posting_permission',
    ) as Promise<TransactionConfirmation>;
  }

  if (key) {
    const opArray = [
      [
        'account_update',
        {
          account: get(currentAccount, 'name'),
          memo_key: get(currentAccount, 'memo_key'),
          json_metadata: json,
          posting: newPosting,
        },
      ],
    ];
    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          if (error && get(error, 'jse_info.code') === 4030100) {
            error.message = getDsteemDateErrorMessage(error);
          }
          console.warn('Failed to update posting key, non-steam', error);
          captureExceptionWithRpcParams(error, { account: get(currentAccount, 'name') });
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const profileUpdate = async (params, pin, currentAccount) => {
  const digitPinCode = getDigitPinCode(pin);
  const key = getPostingKey(get(currentAccount, 'local'), digitPinCode);

  // Parse existing posting_json_metadata to preserve all top-level fields
  let existingMetadata = {};
  try {
    const raw = get(currentAccount, 'posting_json_metadata');
    existingMetadata = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
  } catch (e) {
    existingMetadata = {};
  }

  // Construct new metadata preserving all existing fields
  const newMetadata = {
    ...existingMetadata,
    profile: {
      ...(currentAccount.profile || {}),
      ...params,
    },
  };

  // HiveAuth without posting authority: go directly to HiveAuth broadcast
  if (shouldUseDirectHiveAuthBroadcast(currentAccount)) {
    const _params = {
      account: get(currentAccount, 'name'),
      json_metadata: '',
      posting_json_metadata: jsonStringify(newMetadata),
      extensions: [],
    };
    const opArray: Operation[] = [['account_update2', _params]];
    return handleHiveAuthFallback(
      currentAccount,
      opArray,
      'profile_update',
    ) as Promise<TransactionConfirmation>;
  }

  if (isHsClientSupported(currentAccount.local.authType)) {
    const token = decryptKey(get(currentAccount, 'local.accessToken'), digitPinCode);
    const api = new hsClient({
      accessToken: token,
    });

    const _params = {
      account: get(currentAccount, 'name'),
      json_metadata: '',
      posting_json_metadata: jsonStringify(newMetadata),
      extensions: [],
    };

    const opArray = [['account_update2', _params]];

    try {
      return await api.broadcast(opArray).then((resp) => resp.result);
    } catch (err) {
      // Check if this is a HiveAuth user with auth error (missing authority, expired token, etc.)
      const isHiveAuth = currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH;

      if (isHiveAuth && shouldTriggerHiveAuthFallback(err)) {
        return handleHiveAuthFallback(
          currentAccount,
          opArray as Operation[],
          'profile_update',
        ) as Promise<TransactionConfirmation>;
      }

      console.log(err);
      throw err;
    }
  }

  if (key) {
    const _params = {
      account: get(currentAccount, 'name'),
      json_metadata: '',
      posting_json_metadata: jsonStringify(newMetadata),
      extensions: [],
    };

    const opArray = [['account_update2', _params]];

    const privateKey = PrivateKey.fromString(key);

    return new Promise((resolve, reject) => {
      sendHiveOperations(opArray, privateKey)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          if (error && get(error, 'jse_info.code') === 4030100) {
            error.message = getDsteemDateErrorMessage(error);
          }
          reject(error);
        });
    });
  }

  return Promise.reject(
    new Error('Check private key permission! Required private posting key or above.'),
  );
};

export const subscribeCommunity = (currentAccount, pinCode, data) => {
  const json = [data.isSubscribed ? 'unsubscribe' : 'subscribe', { community: data.communityId }];

  return broadcastPostingJSON('community', json, currentAccount, pinCode);
};
// HELPERS

export const getPostingKey = (local, pin) => {
  if (local?.postingKey) {
    return decryptKey(local.postingKey, pin);
  }

  return false;
};

export const getActiveKey = (local, pin) => {
  if (local?.activeKey) {
    return decryptKey(local.activeKey, pin);
  }

  return false;
};
export const votingPower = (account) => {
  const calc = client.rc.calculateVPMana(account);
  const { percentage } = calc;

  return percentage / 100;
};

const hasEcencyPostingAuthority = (account: any): boolean => {
  const postingAccountAuths = account?.posting?.account_auths;
  if (!Array.isArray(postingAccountAuths)) {
    return false;
  }
  return postingAccountAuths.some((auth: any) => auth[0] === 'ecency.app');
};

/**
 * Determines if posting authority prompt should be shown before posting operations.
 * Returns true only for HiveAuth users who haven't granted ecency.app posting authority.
 *
 * @param account - Current user account object
 * @returns true if prompt should be shown, false otherwise
 */
export const shouldPromptPostingAuthority = (account: any): boolean => {
  // Only prompt for HiveAuth authenticated users
  if (account?.local?.authType !== AUTH_TYPE.HIVE_AUTH) {
    return false;
  }

  // Don't prompt if posting authority already granted
  if (hasEcencyPostingAuthority(account)) {
    return false;
  }

  // Prompt should be shown
  return true;
};

/**
 * Determines if HiveAuth user should use direct HiveAuth broadcast (no posting authority)
 * vs HiveSigner access token (has posting authority).
 */
const shouldUseDirectHiveAuthBroadcast = (account: any): boolean => {
  return account?.local?.authType === AUTH_TYPE.HIVE_AUTH && !hasEcencyPostingAuthority(account);
};
export const resolveTransaction = async (parsedTx, parsedParams, signer) => {
  const EXPIRE_TIME = 60 * 1000;
  // Get dynamic props from SDK (cached up to 60s, which is fine for TAPOS)
  const dynamicProps = await getDynamicGlobalProperties();
  const props = dynamicProps.raw.globalDynamic;

  // resolve the decoded tx and params to a signable tx
  const { tx } = hiveuri.resolveTransaction(parsedTx, parsedParams, {
    ref_block_num: props.head_block_number & 0xffff,
    ref_block_prefix: Buffer.from(props.head_block_id, 'hex').readUInt32LE(4),
    expiration: new Date(Date.now() + client.broadcast.expireTime + EXPIRE_TIME)
      .toISOString()
      .slice(0, -5),
    signers: [signer],
    preferred_signer: signer,
  });
  tx.ref_block_num = parseInt(`${tx.ref_block_num}`, 10);
  tx.ref_block_prefix = parseInt(`${tx.ref_block_prefix}`, 10);

  return tx;
};

const handleChainError = (strErr: string) => {
  if (strErr.includes('chain-error.missing-authority')) {
    return 'chain-error.missing-authority';
  }
  if (/You may only post once every/.test(strErr)) {
    return 'chain-error.min-root-comment';
  } else if (/Your current vote on this comment is identical/.test(strErr)) {
    return 'chain-error.identical-vote';
  } else if (/Please wait to transact, or power up/.test(strErr)) {
    return 'chain-error.insufficient-resource';
  } else if (/Cannot delete a comment with net positive/.test(strErr)) {
    return 'chain-error.delete-comment-with-vote';
  } else if (/children == 0/.test(strErr)) {
    return 'chain-error.comment-children';
  } else if (/comment_cashout/.test(strErr)) {
    return 'chain-error.comment-cashout';
  } else if (/Votes evaluating for comment that is paid out is forbidden/.test(strErr)) {
    return 'chain-error.paid-out-post-forbidden';
  } else if (/Missing Active Authority/.test(strErr)) {
    return 'chain-error.missing-authority';
  } else if (/Missing Owner Authority/.test(strErr)) {
    return 'chain-error.missing-owner-authority';
  } else if (/does not have sufficient funds/.test(strErr)) {
    return 'chain-error.insufficient_fund';
  }
  return null;
};

const POSTING_AUTH_OPERATION_NAMES = new Set([
  'vote',
  'comment',
  'comment_options',
  'custom_json',
  'delete_comment',
  'claim_reward_balance',
]);

const resolveOperationAuthority = (operation: Operation): 'posting' | 'active' => {
  const [operationName, payload] = operation;

  if (operationName === 'custom_json') {
    const hasActiveAuth = Array.isArray(payload?.required_auths)
      ? payload.required_auths.length > 0
      : false;
    if (hasActiveAuth) {
      return 'active';
    }
    return 'posting';
  }

  return POSTING_AUTH_OPERATION_NAMES.has(operationName) ? 'posting' : 'active';
};

const resolveTxRequiredAuthority = (operations: Operation[]): 'posting' | 'active' => {
  if (!operations || operations.length === 0) {
    return 'posting';
  }

  return operations.some((operation) => resolveOperationAuthority(operation) === 'active')
    ? 'active'
    : 'posting';
};

export const handleHiveUriOperation = async (
  currentAccount: any,
  pin: any,
  tx: any,
): Promise<TransactionConfirmation> => {
  const digitPinCode = getDigitPinCode(pin);
  const requiredAuthority = resolveTxRequiredAuthority(tx?.operations || []);
  const key =
    requiredAuthority === 'posting'
      ? getPostingKey(currentAccount.local, digitPinCode)
      : getActiveKey(currentAccount.local, digitPinCode);

  if (!key) {
    return Promise.reject(new Error('chain-error.missing-authority'));
  }

  try {
    const privateKey = PrivateKey.fromString(key);
    const chainId = Buffer.from(
      'beeab0de00000000000000000000000000000000000000000000000000000000',
      'hex',
    );
    // console.log('tx : ', tx);
    const transaction = cryptoUtils.signTransaction(tx, privateKey, chainId);
    const trxId = await generateTrxId(transaction);
    const resultHive = await client.broadcast.call('broadcast_transaction', [transaction]);
    const result = Object.assign({ id: trxId }, resultHive);
    return result;
  } catch (err) {
    const errString = handleChainError(err.toString());
    captureExceptionWithRpcParams(err, { tx }, (scope) => {
      scope.setTag('context', 'handle-hive-uri-operation');
      scope.setContext('tx', tx);
    });
    return Promise.reject(errString);
  }
};
