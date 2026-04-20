import { useCallback, RefObject } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { SheetManager } from 'react-native-actions-sheet';
import {
  useBroadcastMutation,
  PrivateKey,
  sha256,
  buildVoteOp,
  buildCommentOp,
  buildCommentOptionsOp,
  buildTransferOp,
  buildDelegateVestingSharesOp,
  buildWitnessVoteOp,
  buildWitnessProxyOp,
  buildTransferToVestingOp,
  buildWithdrawVestingOp,
  buildRecurrentTransferOp,
  buildTransferToSavingsOp,
  buildTransferFromSavingsOp,
  buildCancelTransferFromSavingsOp,
  buildConvertOp,
  buildCollateralizedConvertOp,
  buildEngineOp,
} from '@ecency/sdk';
import type { Operation } from '@ecency/sdk';
import { SheetNames } from '../../../navigation/sheets';
import { useMutationAuth } from '../../../providers/sdk/mutations/common';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';
import { store } from '../../../redux/store/store';
import { getDigitPinCode, getPostingKey, getActiveKey } from '../../../providers/hive/hive';
import { hpToVests } from '../../../utils/conversions';
import {
  KeychainRequest,
  KeychainResponse,
  PeakVaultRequest,
  PeakVaultResponse,
  getRequiredAuthority,
} from '../bridges/bridgeTypes';

export function useHiveBridgeHandler(webViewRef: RefObject<WebView | null>) {
  const { username, authContext } = useMutationAuth();
  const globalProps = useAppSelector((state) => state.account.globalProps);

  const _sendResponse = useCallback(
    (requestId: number, response: Omit<KeychainResponse, 'request_id'>) => {
      const fullResponse: KeychainResponse = { ...response, request_id: requestId };
      const js = `
        if (window.hive_keychain) {
          window.hive_keychain.onAnswerReceived('hive_keychain_response', ${JSON.stringify(
            fullResponse,
          )});
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(js);
    },
    [webViewRef],
  );

  const _sendHandshake = useCallback(
    (_requestId: number) => {
      const js = `
        if (window.hive_keychain) {
          window.hive_keychain.onAnswerReceived('hive_keychain_handshake');
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(js);
    },
    [webViewRef],
  );

  const _sendPvResponse = useCallback(
    (resId: number, response: PeakVaultResponse) => {
      const js = `
        document.dispatchEvent(new CustomEvent('peak-vault-response-${resId}', {
          detail: ${JSON.stringify(JSON.stringify(response))}
        }));
        true;
      `;
      webViewRef.current?.injectJavaScript(js);
    },
    [webViewRef],
  );

  const _sendPvError = useCallback(
    (resId: number, error: string, account: string) => {
      _sendPvResponse(resId, {
        success: false,
        error,
        account,
        result: null,
      });
    },
    [_sendPvResponse],
  );

  const _sendError = useCallback(
    (requestId: number, error: string) => {
      _sendResponse(requestId, {
        success: false,
        error,
        result: null,
        message: error,
      });
    },
    [_sendResponse],
  );

  const _buildOperations = useCallback(
    (type: string, data: Record<string, any>, account: string): Operation[] | null => {
      switch (type) {
        case 'vote':
          return [buildVoteOp(account, data.author, data.permlink, data.weight)];

        case 'post': {
          const ops: Operation[] = [
            buildCommentOp(
              account,
              data.permlink,
              data.parent_username || '',
              data.parent_perm || '',
              data.title || '',
              data.body || '',
              typeof data.json_metadata === 'string'
                ? JSON.parse(data.json_metadata)
                : data.json_metadata || {},
            ),
          ];
          if (data.comment_options) {
            const opts =
              typeof data.comment_options === 'string'
                ? JSON.parse(data.comment_options)
                : data.comment_options;
            ops.push(
              buildCommentOptionsOp(
                account,
                data.permlink,
                opts.max_accepted_payout || '1000000.000 HBD',
                opts.percent_hbd ?? opts.percent_steem_dollars ?? 10000,
                opts.allow_votes !== false,
                opts.allow_curation_rewards !== false,
                opts.extensions || [],
              ),
            );
          }
          return ops;
        }

        case 'custom': {
          const jsonStr = typeof data.json === 'string' ? data.json : JSON.stringify(data.json);
          const method = data.method?.toLowerCase?.();
          const isActive = method === 'active';
          const op: Operation = [
            'custom_json',
            {
              required_auths: isActive ? [account] : [],
              required_posting_auths: isActive ? [] : [account],
              id: data.id,
              json: jsonStr,
            },
          ];
          return [op];
        }

        case 'transfer':
          return [
            buildTransferOp(
              account,
              data.to,
              `${parseFloat(data.amount).toFixed(3)} ${data.currency}`,
              data.memo || '',
            ),
          ];

        case 'delegation': {
          const unit = (data.unit || 'HP').toUpperCase();
          if (unit === 'HP') {
            if (!globalProps?.hivePerMVests) return null;
            const vests = hpToVests(parseFloat(data.amount), globalProps.hivePerMVests);
            return [
              buildDelegateVestingSharesOp(account, data.delegatee, `${vests.toFixed(6)} VESTS`),
            ];
          }
          return [
            buildDelegateVestingSharesOp(
              account,
              data.delegatee,
              `${parseFloat(data.amount).toFixed(6)} VESTS`,
            ),
          ];
        }

        case 'witnessVote':
          return [buildWitnessVoteOp(account, data.witness, data.vote)];

        case 'proxy':
          return [buildWitnessProxyOp(account, data.proxy || '')];

        case 'powerUp':
          return [
            buildTransferToVestingOp(
              account,
              data.recipient || account,
              `${parseFloat(data.steem).toFixed(3)} HIVE`,
            ),
          ];

        case 'powerDown': {
          if (!globalProps?.hivePerMVests) return null;
          const vestsPD = hpToVests(parseFloat(data.steem_power), globalProps.hivePerMVests);
          return [buildWithdrawVestingOp(account, `${vestsPD.toFixed(6)} VESTS`)];
        }

        case 'recurrentTransfer':
          return [
            buildRecurrentTransferOp(
              account,
              data.to,
              `${parseFloat(data.amount).toFixed(3)} ${data.currency}`,
              data.memo || '',
              data.recurrence,
              data.executions,
            ),
          ];

        case 'savings': {
          const savingsAmount = `${parseFloat(data.amount).toFixed(3)} ${data.currency}`;
          if (data.operation === 'deposit') {
            return [
              buildTransferToSavingsOp(account, data.to || account, savingsAmount, data.memo || ''),
            ];
          }
          if (data.operation === 'withdraw_cancel') {
            const cancelId = data.request_id || 0;
            return [buildCancelTransferFromSavingsOp(account, cancelId)];
          }
          // withdraw
          const savingsReqId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
          return [
            buildTransferFromSavingsOp(
              account,
              data.to || account,
              savingsAmount,
              data.memo || '',
              savingsReqId,
            ),
          ];
        }

        case 'convert': {
          const convertReqId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
          if (data.collaterized) {
            const hiveAmt = `${parseFloat(data.amount).toFixed(3)} HIVE`;
            return [buildCollateralizedConvertOp(account, hiveAmt, convertReqId)];
          }
          const hbdAmt = `${parseFloat(data.amount).toFixed(3)} HBD`;
          return [buildConvertOp(account, hbdAmt, convertReqId)];
        }

        case 'sendToken':
          return [
            buildEngineOp(account, 'transfer', {
              symbol: data.currency,
              to: data.to,
              quantity: data.amount,
              memo: data.memo || '',
            }),
          ];

        case 'broadcast':
          if (Array.isArray(data.operations)) {
            return data.operations;
          }
          return null;

        default:
          return null;
      }
    },
    [globalProps?.hivePerMVests],
  );

  // Generic broadcast mutation for dApp operations
  const broadcastMutation = useBroadcastMutation<{ operations: Operation[] }>(
    ['dapp-browser', 'broadcast'],
    username,
    (payload) => payload.operations,
    undefined,
    authContext,
    'active', // default; overridden per-request via the mutation call
  );

  const postingBroadcastMutation = useBroadcastMutation<{ operations: Operation[] }>(
    ['dapp-browser', 'broadcast-posting'],
    username,
    (payload) => payload.operations,
    undefined,
    authContext,
    'posting',
  );

  const _handlePeakVaultMessage = useCallback(
    async (pvData: PeakVaultRequest['data']) => {
      const { resId, account: requestedAccount, operations, keyRole, broadcast } = pvData;

      // Handle connect (returns list of available accounts)
      if (
        operations.length === 1 &&
        Array.isArray(operations[0]) &&
        operations[0][0] === 'peakvault-connect'
      ) {
        if (!username) {
          _sendPvError(resId, 'No account available. Please log in first.', '');
          return;
        }
        _sendPvResponse(resId, {
          success: true,
          error: '',
          account: username,
          result: [username],
        });
        return;
      }

      // Reject if not logged in
      if (!username) {
        _sendPvError(resId, 'No account available. Please log in first.', '');
        return;
      }

      const account = requestedAccount || username;

      // Validate username matches
      if (requestedAccount && requestedAccount !== username) {
        _sendPvError(
          resId,
          `Account mismatch: requested "${requestedAccount}" but logged in as "${username}"`,
          account,
        );
        return;
      }

      // Handle signBuffer (peakvault-sign_buffer)
      if (
        operations.length === 1 &&
        Array.isArray(operations[0]) &&
        operations[0][0] === 'peakvault-sign_buffer'
      ) {
        let domain = '';
        try {
          domain = new URL(pvData.sourceUrl || '').hostname;
        } catch {
          domain = 'Unknown';
        }

        try {
          const approved = await SheetManager.show(SheetNames.SIGN_CONFIRM, {
            payload: {
              type: 'signBuffer',
              username: account,
              message: operations[0][1]?.message,
              domain,
              method: keyRole === 'active' ? 'Active' : 'Posting',
            },
          });
          if (!approved) {
            _sendPvError(resId, 'User rejected the request.', account);
            return;
          }

          const state = store.getState();
          const pin = state.application?.pin;
          if (!pin) {
            _sendPvError(resId, 'PIN not available. Please unlock the app.', account);
            return;
          }
          const digitPin = getDigitPinCode(pin);
          const currentAccount = selectCurrentAccount(state);
          const local = currentAccount?.local;
          if (!local) {
            _sendPvError(resId, 'No local account data available.', account);
            return;
          }

          if (keyRole === 'memo') {
            _sendPvError(resId, 'Memo key operations are not yet supported.', account);
            return;
          }
          const keyWif =
            keyRole === 'active' ? getActiveKey(local, digitPin) : getPostingKey(local, digitPin);
          if (!keyWif) {
            _sendPvError(resId, `${keyRole} key not available.`, account);
            return;
          }

          const privateKey = PrivateKey.fromString(keyWif);
          const messageHash = sha256(operations[0][1].message);
          const signature = privateKey.sign(messageHash).toString();
          const publicKey = privateKey.createPublic().toString();

          _sendPvResponse(resId, {
            success: true,
            error: '',
            account,
            publicKey,
            result: signature,
          });
        } catch (err: any) {
          _sendPvError(resId, err?.message || 'Sign buffer failed.', account);
        }
        return;
      }

      // Handle contact picker (not supported)
      if (
        operations.length === 1 &&
        Array.isArray(operations[0]) &&
        operations[0][0] === 'peakvault-choose_contact'
      ) {
        _sendPvError(resId, 'Contact picker is not supported in Ecency browser.', account);
        return;
      }

      // Handle encode/decode (not supported yet)
      if (
        operations.length === 1 &&
        Array.isArray(operations[0]) &&
        (operations[0][0] === 'peakvault-decode' ||
          operations[0][0] === 'peakvault-encode' ||
          operations[0][0] === 'peakvault-encode_with_keys')
      ) {
        _sendPvError(
          resId,
          `Operation "${operations[0][0]}" is not yet supported in Ecency browser.`,
          account,
        );
        return;
      }

      // Standard operations: filter out peakvault-prefixed ops (internal)
      const standardOps = operations.filter(
        (op: any) => Array.isArray(op) && !String(op[0]).startsWith('peakvault'),
      ) as Operation[];

      if (standardOps.length === 0) {
        _sendPvError(resId, 'No valid operations found.', account);
        return;
      }

      // Extract domain for display
      let domain = '';
      try {
        domain = new URL(pvData.sourceUrl || '').hostname;
      } catch {
        domain = 'Unknown';
      }

      // Determine display message
      const displayTitle =
        typeof pvData.displayMessage === 'string'
          ? pvData.displayMessage
          : pvData.displayMessage?.title || 'Transaction';

      // Show confirmation sheet
      try {
        const approved = await SheetManager.show(SheetNames.SIGN_CONFIRM, {
          payload: {
            type: broadcast ? 'broadcast' : 'signTx',
            username: account,
            domain,
            method: keyRole === 'active' ? 'Active' : keyRole === 'memo' ? 'Memo' : 'Posting',
            operations: standardOps,
            display_msg: displayTitle,
          },
        });

        if (!approved) {
          _sendPvError(resId, 'User rejected the request.', account);
          return;
        }

        if (broadcast) {
          // Broadcast via the appropriate mutation
          const mutation = keyRole === 'posting' ? postingBroadcastMutation : broadcastMutation;
          const result = await mutation.mutateAsync({ operations: standardOps });
          _sendPvResponse(resId, {
            success: true,
            error: '',
            account,
            result,
          });
        } else {
          // Sign-only: sign with key but don't broadcast
          const state = store.getState();
          const pin = state.application?.pin;
          if (!pin) {
            _sendPvError(resId, 'PIN not available. Please unlock the app.', account);
            return;
          }
          const digitPin = getDigitPinCode(pin);
          const currentAccount = selectCurrentAccount(state);
          const local = currentAccount?.local;
          if (!local) {
            _sendPvError(resId, 'No local account data available.', account);
            return;
          }

          if (keyRole === 'memo') {
            _sendPvError(resId, 'Memo key operations are not yet supported.', account);
            return;
          }
          const keyWif =
            keyRole === 'active' ? getActiveKey(local, digitPin) : getPostingKey(local, digitPin);
          if (!keyWif) {
            _sendPvError(resId, `${keyRole} key not available.`, account);
            return;
          }

          // Sign-only mode cannot produce a usable signed transaction without
          // the full Transaction API. Return error so the dApp knows to use
          // the broadcast flow instead.
          _sendPvError(
            resId,
            'Sign-only mode is not supported. Use requestSignOp to broadcast.',
            account,
          );
        }
      } catch (err: any) {
        _sendPvError(resId, err?.message || 'Transaction failed.', account);
      }
    },
    [username, _sendPvResponse, _sendPvError, broadcastMutation, postingBroadcastMutation],
  );

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let parsed: KeychainRequest | PeakVaultRequest;
      try {
        parsed = JSON.parse(event.nativeEvent.data);
      } catch {
        return; // Not a bridge message
      }

      // Handle Peak Vault messages
      if (parsed.name === 'pvRequest') {
        _handlePeakVaultMessage((parsed as PeakVaultRequest).data);
        return;
      }

      // Handle Keychain handshake
      if (parsed.name === 'swHandshake_hive') {
        _sendHandshake((parsed as KeychainRequest).request_id);
        return;
      }

      if (parsed.name !== 'swRequest_hive') {
        return;
      }

      const { request_id, data } = parsed;
      const { type } = data;
      const requestedUsername = data.username;

      // Reject if not logged in
      if (!username) {
        _sendError(request_id, 'No account available. Please log in first.');
        return;
      }

      // Validate username matches current account
      if (requestedUsername && requestedUsername !== username) {
        _sendError(
          request_id,
          `Account mismatch: requested "${requestedUsername}" but logged in as "${username}"`,
        );
        return;
      }

      const account = requestedUsername || username;

      // Handle signBuffer (used for dApp login)
      if (type === 'signBuffer') {
        let domain = '';
        try {
          domain = new URL(data.domain || '').hostname;
        } catch {
          domain = data.domain || 'Unknown';
        }

        try {
          const approved = await SheetManager.show(SheetNames.SIGN_CONFIRM, {
            payload: { ...data, username: account, domain },
          });
          if (!approved) {
            _sendError(request_id, 'User rejected the request.');
            return;
          }

          const state = store.getState();
          const pin = state.application?.pin;
          if (!pin) {
            _sendError(request_id, 'PIN not available. Please unlock the app.');
            return;
          }
          const digitPin = getDigitPinCode(pin);
          const currentAccount = selectCurrentAccount(state);
          const local = currentAccount?.local;
          if (!local) {
            _sendError(request_id, 'No local account data available.');
            return;
          }

          const method = (data.method || 'Posting').toLowerCase();
          const keyWif =
            method === 'active' ? getActiveKey(local, digitPin) : getPostingKey(local, digitPin);
          if (!keyWif) {
            _sendError(request_id, `${data.method || 'Posting'} key not available.`);
            return;
          }

          const privateKey = PrivateKey.fromString(keyWif);
          const messageHash = sha256(data.message);
          const signature = privateKey.sign(messageHash).toString();
          const publicKey = privateKey.createPublic().toString();

          _sendResponse(request_id, {
            success: true,
            error: null,
            result: signature,
            publicKey,
          });
        } catch (err: any) {
          _sendError(request_id, err?.message || 'Sign buffer failed.');
        }
        return;
      }

      // Unsupported operations
      if (
        type === 'signTx' ||
        type === 'encode' ||
        type === 'decode' ||
        type === 'signedCall' ||
        type === 'addAccount' ||
        type === 'addAccountAuthority' ||
        type === 'removeAccountAuthority' ||
        type === 'addKeyAuthority' ||
        type === 'removeKeyAuthority' ||
        type === 'createClaimedAccount' ||
        type === 'swap'
      ) {
        _sendError(request_id, `Operation "${type}" is not yet supported in Ecency browser.`);
        return;
      }

      // Build operations
      let operations: Operation[] | null;
      try {
        operations = _buildOperations(type, data, account);
      } catch (buildErr: any) {
        _sendError(request_id, `Failed to build operations for "${type}": ${buildErr.message}`);
        return;
      }
      if (!operations || operations.length === 0) {
        _sendError(request_id, `Failed to build operations for "${type}".`);
        return;
      }

      // Extract domain for display
      let domain = '';
      try {
        domain = new URL(data.domain || '').hostname;
      } catch {
        domain = data.domain || 'Unknown';
      }

      // Show confirmation sheet
      try {
        const approved = await SheetManager.show(SheetNames.SIGN_CONFIRM, {
          payload: { ...data, username: account, domain },
        });

        if (!approved) {
          _sendError(request_id, 'User rejected the request.');
          return;
        }

        // Broadcast via the appropriate mutation
        const authority = getRequiredAuthority(type, data.method);
        const mutation = authority === 'posting' ? postingBroadcastMutation : broadcastMutation;

        const result = await mutation.mutateAsync({ operations });

        _sendResponse(request_id, {
          success: true,
          error: null,
          result,
          message: 'Transaction broadcast successfully.',
        });
      } catch (err: any) {
        _sendError(request_id, err?.message || 'Transaction failed.');
      }
    },
    [
      username,
      _sendHandshake,
      _sendError,
      _sendResponse,
      _buildOperations,
      _handlePeakVaultMessage,
      broadcastMutation,
      postingBroadcastMutation,
    ],
  );

  return { handleMessage };
}
