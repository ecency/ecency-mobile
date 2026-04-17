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

  // Set nodes via ConfigManager (validated, deduped). 5 s timeout matches
  // SDK 2.2.1 defaults (retry=1, timeout=5s) — fast failure for reads, and
  // pollTransactionStatusAfterAbort recovers broadcasts that land on-chain
  // but whose response arrives after the timeout.
  ConfigManager.setHiveNodes(selectedServer);
  hiveTxConfig.timeout = 5000;
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
 * hanging on the wire. Covers both the `AbortSignal.timeout` path (emits
 * `TimeoutError`) and generic fetch aborts (`AbortError`). On React Native /
 * Hermes the timeout path falls back to a plain `Error` tagged with
 * `name: 'TimeoutError'` (see hive-tx createTimeoutReason).
 */
const isBroadcastAbortError = (err: unknown): boolean => {
  if (!err || typeof err !== 'object') return false;
  const name = String((err as { name?: string }).name ?? '');
  const message = String((err as { message?: string }).message ?? '');
  if (name === 'TimeoutError' || name === 'AbortError') return true;
  return /aborted due to timeout|operation was aborted|the user aborted a request/i.test(message);
};

/**
 * Broadcast states that mean the tx is (or will be) on-chain. `within_mempool`
 * is excluded: the tx is accepted but not yet in a block, so we keep polling.
 */
const BROADCAST_SUCCESS_STATES = new Set(['within_reversible_block', 'within_irreversible_block']);

const BROADCAST_FAILURE_STATES = new Set(['expired_reversible', 'expired_irreversible', 'too_old']);

/**
 * After a broadcast throws a timeout/abort error, the tx bytes may have
 * already reached the node and landed in a block (fetch abort in RN does not
 * un-send the request). Poll `transaction_status_api.find_transaction` a few
 * times before declaring failure so users don't get told "transaction aborted"
 * on a transfer/convert that actually succeeded.
 *
 * Returns the on-chain tx id when confirmed, null when confirmed expired, or
 * undefined if the status is still indeterminate after the poll budget.
 */
const pollTransactionStatusAfterAbort = async (
  tx: HiveTxTransaction,
): Promise<string | null | undefined> => {
  // ~10 s total: 1.5 + 2 + 2.5 + 3 = 9 s of polling with a final check.
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
      // within_mempool / unknown: keep polling
    } catch {
      // transaction_status_api may be unavailable on some nodes; keep polling
      // until the budget is exhausted and then fall through to rethrow.
    }
  }
  return undefined;
};

export const sendHiveOperations = async (
  operations: Operation[],
  key: PrivateKey | PrivateKey[],
): Promise<TransactionConfirmation> => {
  const keys = Array.isArray(key) ? key : [key];
  // Build and sign the transaction ourselves (mirrors @ecency/sdk's
  // broadcastOperations) so we have the local txId + expiration available
  // for post-timeout recovery via transaction_status_api.
  const tx = new HiveTxTransaction();
  // eslint-disable-next-line no-restricted-syntax
  for (const op of operations) {
    // eslint-disable-next-line no-await-in-loop
    await tx.addOperation(op[0] as OperationName, op[1] as OperationBody<OperationName>);
  }
  tx.sign(keys);
  const localTxId = tx.digest().txId;

  try {
    const result: any = await callRPCBroadcast('condenser_api.broadcast_transaction_synchronous', [
      tx.transaction,
    ]);
    return { id: result?.id || result?.tx_id || localTxId, ...result } as TransactionConfirmation;
  } catch (err) {
    // Defensive recovery: if the broadcast aborted/timed out, the tx may
    // have already landed on-chain. Poll before declaring failure.
    if (isBroadcastAbortError(err)) {
      try {
        const confirmed = await pollTransactionStatusAfterAbort(tx);
        if (confirmed) {
          console.log(
            `[sendHiveOperations] recovered from broadcast timeout; tx ${confirmed} landed`,
          );
          return { id: confirmed } as TransactionConfirmation;
        }
      } catch (recoveryErr) {
        // Swallow — fall through to the original error path below.
        console.warn('[sendHiveOperations] status poll recovery failed', recoveryErr);
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

  try {
    const privateKey = PrivateKey.fromString(key);
    // Wrap the already-resolved tx (with its TAPOS fields) rather than
    // rebuilding from scratch, so the signed output matches what
    // resolveTransaction() produced.
    const transaction = new HiveTxTransaction({ transaction: tx });
    transaction.sign(privateKey);
    const result = await callRPCBroadcast('condenser_api.broadcast_transaction_synchronous', [
      transaction.transaction,
    ]);
    return { id: result?.id || result?.tx_id || '', ...result };
  } catch (err) {
    const errString = handleChainError(err.toString());
    captureExceptionWithRpcParams(err, { tx }, (scope) => {
      scope.setTag('context', 'handle-hive-uri-operation');
      scope.setContext('tx', tx);
    });
    return Promise.reject(errString);
  }
};
