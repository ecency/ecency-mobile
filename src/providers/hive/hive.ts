// import '../../../shim';
// import * as bitcoin from 'bitcoinjs-lib';

import {
  PrivateKey,
  callRPC,
  sha256 as hiveTxSha256,
  ConfigManager,
  calculateVPMana,
  calculateRCMana,
  getQueryClient,
  getAccountFullQueryOptions,
  getAccountsQueryOptions,
  parseProfileMetadata,
  getDynamicPropsQueryOptions,
  getMarketStatisticsQueryOptions,
  HiveTxTransaction,
  callRPCBroadcast,
  hiveTxConfig,
} from '@ecency/sdk';
import type { Operation, TransactionConfirmation, OperationName, OperationBody } from '@ecency/sdk';

import Config from 'react-native-config';
import { get, has } from 'lodash';
import * as hiveuri from 'hive-uri';
import * as Sentry from '@sentry/react-native';
import { getServer, getCache, setCache } from '../../realm/realm';

// Utils
import { decryptKey } from '../../utils/crypto';
import { getName, getAvatar, parseReputation } from '../../utils/user';

// Constant
import AUTH_TYPE from '../../constants/authType';
import { SERVER_LIST } from '../../constants/options/api';
import { b64uEnc } from '../../utils/b64';
import { delay } from '../../utils/editor';

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.Buffer = global.Buffer || require('buffer').Buffer;

export const checkClient = async () => {
  const selectedServer = [...SERVER_LIST];

  await getServer().then((response) => {
    if (response) {
      selectedServer.unshift(response);
    }
  });

  // Set nodes via ConfigManager (validated, deduped). With async broadcast
  // (broadcast_transaction), the RPC returns once the node accepts the tx
  // into the mempool — typically <1s — so 10s is generous headroom that still
  // lets the SDK fail over on dead nodes.
  ConfigManager.setHiveNodes(selectedServer);
  hiveTxConfig.timeout = 10000;
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
    const props = await callRPC('condenser_api.get_dynamic_global_properties', []);
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
    // Use require here to avoid Metro's async import() wrapper
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const actionSheetModule = require('react-native-actions-sheet');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sheetsModule = require('../../navigation/sheets');

    _cachedSheetManager = actionSheetModule.SheetManager;
    _cachedSheetNames = sheetsModule.SheetNames;
  }
  return { SheetManager: _cachedSheetManager!, SheetNames: _cachedSheetNames! };
};

/**
 * Deduplication map for HiveAuth fallback.
 * If a second call arrives for the same account+operation while one is already
 * in-flight, it piggybacks on the existing promise instead of throwing.
 * Key format: `${accountName}:${operationName}`
 */
const _activeFallbackPromises = new Map<string, Promise<any>>();

export const handleHiveAuthFallback = async (
  currentAccount: any,
  operations: Operation[],
  operationName: string,
): Promise<any> => {
  const fallbackKey = `${currentAccount?.name || 'unknown'}:${operationName}`;

  const existing = _activeFallbackPromises.get(fallbackKey);
  if (existing) {
    console.warn(
      `[HiveAuth Fallback] Concurrent call for ${operationName}, reusing in-flight request`,
    );
    return existing;
  }

  const promise = _executeHiveAuthFallback(currentAccount, operations, operationName);
  _activeFallbackPromises.set(fallbackKey, promise);

  try {
    return await promise;
  } finally {
    _activeFallbackPromises.delete(fallbackKey);
  }
};

const _executeHiveAuthFallback = async (
  currentAccount: any,
  operations: Operation[],
  operationName: string,
): Promise<any> => {
  console.log(
    `[HiveAuth Fallback] Access token failed for ${operationName}, ` +
      'falling back to HiveAuth broadcast',
  );

  const timeoutMs = 180000; // 3 minutes — HiveAuth requires switching to keychain app
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    const { SheetManager, SheetNames } = await getSheetDeps();

    await delay(500);
    const response = await Promise.race([
      SheetManager.show(SheetNames.HIVE_AUTH_BROADCAST, {
        payload: { operations },
      }),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          SheetManager.hide(SheetNames.HIVE_AUTH_BROADCAST);
          reject(new Error('HiveAuth broadcast timed out'));
        }, timeoutMs);
      }),
    ]);

    if (response?.success) {
      console.log(`[HiveAuth Fallback] ${operationName} broadcast successful`);
      return response.result;
    } else if (response?.success === false) {
      console.error(`[HiveAuth Fallback] ${operationName} broadcast failed`, response.error);
      const rawError = response.error;
      throw rawError instanceof Error
        ? rawError
        : new Error(
            typeof rawError === 'object' && rawError !== null && 'message' in rawError
              ? String(rawError.message)
              : rawError
              ? String(rawError)
              : 'HiveAuth broadcast failed',
          );
    } else {
      console.warn(`[HiveAuth Fallback] ${operationName} dismissed`);
      throw new Error('HiveAuth broadcast was dismissed');
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Detect client-side aborts / timeouts that may leave a successful broadcast
 * hanging on the wire. Even with async broadcast (mempool accept only), the
 * accept response can be cut off by a network blip — the bytes already reached
 * the node and the tx will land in the next block.
 */
const isBroadcastAbortError = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false;
  const name = String((err as { name?: string }).name ?? '');
  const message = String((err as { message?: string }).message ?? '');
  if (name === 'TimeoutError' || name === 'AbortError') return true;
  return /aborted due to timeout|operation was aborted|the user aborted a request/i.test(message);
};

// Treat `within_mempool` as a recovered success: async broadcast already
// returns at mempool acceptance, so a tx in the mempool after a client-side
// abort means the node received it and it will land in the next block.
const BROADCAST_SUCCESS_STATES = new Set([
  'within_mempool',
  'within_reversible_block',
  'within_irreversible_block',
]);
const BROADCAST_FAILURE_STATES = new Set(['expired_reversible', 'expired_irreversible', 'too_old']);

/**
 * Poll `transaction_status_api.find_transaction` after a broadcast abort to
 * see if the tx actually landed. Returns the txId on success, null when
 * confirmed expired, or undefined if status remains indeterminate.
 */
const pollTransactionStatusAfterAbort = async (
  tx: HiveTxTransaction,
): Promise<string | null | undefined> => {
  // ~9s total budget across 4 attempts, allowing for the next block to land.
  const delaysMs = [1500, 2000, 2500, 3000];
  // eslint-disable-next-line no-restricted-syntax
  for (const ms of delaysMs) {
    // eslint-disable-next-line no-await-in-loop
    await delay(ms);
    try {
      // eslint-disable-next-line no-await-in-loop
      const status = await tx.checkStatus();
      const s = (status as { status?: string } | undefined)?.status;
      if (s && BROADCAST_SUCCESS_STATES.has(s)) {
        return tx.digest().txId;
      }
      if (s && BROADCAST_FAILURE_STATES.has(s)) {
        return null;
      }
    } catch {
      // transaction_status_api may be unavailable on some nodes; keep polling.
    }
  }
  return undefined;
};

export const sendHiveOperations = async (
  operations: Operation[],
  key: PrivateKey | PrivateKey[],
): Promise<TransactionConfirmation> => {
  const keys = Array.isArray(key) ? key : [key];
  // Build and sign the transaction ourselves so we have the local txId
  // available — async broadcast returns no id, only an accept ack.
  const tx = new HiveTxTransaction();
  // eslint-disable-next-line no-restricted-syntax
  for (const op of operations) {
    // eslint-disable-next-line no-await-in-loop
    await tx.addOperation(op[0] as OperationName, op[1] as OperationBody<OperationName>);
  }
  tx.sign(keys);
  const localTxId = tx.digest().txId;

  try {
    // Async broadcast: returns once the node accepts the tx into the mempool.
    // Validation errors (insufficient balance, missing auth, bad signature)
    // still surface as RPC errors here. Block inclusion happens in the next
    // ~3s and is observable via subsequent account/balance refetches.
    await callRPCBroadcast('condenser_api.broadcast_transaction', [tx.transaction]);
    return { id: localTxId } as TransactionConfirmation;
  } catch (err) {
    // The accept response can be cut off by a network abort even though the
    // node already received the bytes. Poll status before declaring failure
    // so users don't see "Aborted" on a tx that actually landed.
    if (isBroadcastAbortError(err)) {
      let confirmed: string | null | undefined;
      try {
        confirmed = await pollTransactionStatusAfterAbort(tx);
      } catch (recoveryErr) {
        console.warn('[sendHiveOperations] status poll recovery failed', recoveryErr);
      }
      if (typeof confirmed === 'string') {
        return { id: confirmed } as TransactionConfirmation;
      }
      // null = polling confirmed the tx expired on chain. Reject with a
      // specific error so callers distinguish it from a generic abort.
      // undefined = status indeterminate; fall through to the original error.
      if (confirmed === null) {
        return Promise.reject(new Error('chain-error.transaction-expired'));
      }
    }
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

const getDynamicGlobalProperties = async () => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getDynamicPropsQueryOptions());
};

export const getMarketStatistics = () => {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(getMarketStatisticsQueryOptions());
};

/**
 * @method getAccount fetch raw account data without post processings
 * @param username username
 */
export const getAccount = async (username) => {
  const queryClient = getQueryClient();
  const accounts = await queryClient.fetchQuery(getAccountsQueryOptions([username]));

  if (accounts && accounts.length > 0) {
    return accounts[0];
  }
  throw new Error(`Account not found, ${username}`);
};

const getUserReputation = async (author) => {
  try {
    const response = await callRPC('condenser_api.get_account_reputations', [author, 1]);

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
 */
export const getUser = async (user) => {
  try {
    const queryClient = getQueryClient();

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
        (await callRPC('rc_api.find_rc_accounts', {
          accounts: [user],
        }))) ||
      getCache('rcPower');
    await setCache('rcPower', rcPower);

    _account.reputation = await getUserReputation(user);
    _account.username = _account.name;
    _account.unread_activity_count = unreadActivityCount;
    _account.vp_manabar = calculateVPMana(_account);
    _account.rc_manabar = calculateRCMana(rcPower.rc_accounts[0]);

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

    if (has(_account, 'posting_json_metadata')) {
      try {
        const parsed = parseProfileMetadata(get(_account, 'posting_json_metadata'));
        _account.profile = parsed?.profile || parsed || {};
      } catch (e) {
        _account.profile = {};
      }
    } else {
      _account.profile = {};
    }

    _account.avatar = getAvatar(_account.profile);
    _account.display_name = getName(_account.profile);

    return _account;
  } catch (error) {
    return Promise.reject(error);
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
    const hash = hiveTxSha256(JSON.stringify(message));

    const privateKey = PrivateKey.fromString(key);
    const signature = privateKey.sign(hash).toString();
    message.signatures = [signature];
    return b64uEnc(JSON.stringify(message));
  }
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
  const calc = calculateVPMana(account);
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

export const shouldPromptPostingAuthority = (account: any): boolean => {
  if (account?.local?.authType !== AUTH_TYPE.HIVE_AUTH) {
    return false;
  }

  if (hasEcencyPostingAuthority(account)) {
    return false;
  }

  return true;
};

export const resolveTransaction = async (parsedTx, parsedParams, signer) => {
  const EXPIRE_TIME = 60 * 1000;
  const dynamicProps = await getDynamicGlobalProperties();
  const props = dynamicProps.raw.globalDynamic;

  const { tx } = hiveuri.resolveTransaction(parsedTx, parsedParams, {
    ref_block_num: props.head_block_number & 0xffff,
    ref_block_prefix: Buffer.from(props.head_block_id, 'hex').readUInt32LE(4),
    // Double the expiration buffer to account for clock skew between client and node
    expiration: new Date(Date.now() + EXPIRE_TIME * 2).toISOString().slice(0, -5),
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

  // Wrap the already-resolved tx (with its TAPOS fields) rather than
  // rebuilding from scratch, so the signed output matches what
  // resolveTransaction() produced.
  const privateKey = PrivateKey.fromString(key);
  const transaction = new HiveTxTransaction({ transaction: tx });
  transaction.sign(privateKey);
  const localTxId = transaction.digest().txId;

  try {
    await callRPCBroadcast('condenser_api.broadcast_transaction', [transaction.transaction]);
    return { id: localTxId } as TransactionConfirmation;
  } catch (err) {
    if (isBroadcastAbortError(err)) {
      try {
        const confirmed = await pollTransactionStatusAfterAbort(transaction);
        if (typeof confirmed === 'string') {
          return { id: confirmed } as TransactionConfirmation;
        }
        // null = chain confirms expiration. Reject with a specific error so
        // the caller surfaces "transaction expired" rather than the generic
        // abort/network failure path below.
        if (confirmed === null) {
          return Promise.reject(new Error('chain-error.transaction-expired'));
        }
      } catch (recoveryErr) {
        console.warn('[handleHiveUriOperation] status poll recovery failed', recoveryErr);
      }
    }
    const errString = handleChainError(String((err as Error)?.message ?? err));
    captureExceptionWithRpcParams(err, { tx }, (scope) => {
      scope.setTag('context', 'handle-hive-uri-operation');
      scope.setContext('tx', tx);
    });
    return Promise.reject(errString);
  }
};
