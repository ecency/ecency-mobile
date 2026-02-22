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
  getMarketStatisticsQueryOptions,
} from '@ecency/sdk';
import { getServer, getCache, setCache } from '../../realm/realm';

// Utils
import { decryptKey } from '../../utils/crypto';
import { getName, getAvatar, parseReputation } from '../../utils/user';
import { getDsteemDateErrorMessage } from '../../utils/dsteemUtils';

// Constant
import AUTH_TYPE from '../../constants/authType';
import { SERVER_LIST } from '../../constants/options/api';
import { b64uEnc } from '../../utils/b64';

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
