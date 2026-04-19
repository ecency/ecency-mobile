import { useCallback, RefObject } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { SheetManager } from 'react-native-actions-sheet';
import {
  useBroadcastMutation,
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
  buildConvertOp,
  buildCollateralizedConvertOp,
  buildEngineOp,
} from '@ecency/sdk';
import type { Operation } from '@ecency/sdk';
import { SheetNames } from '../../../navigation/sheets';
import { useMutationAuth } from '../../../providers/sdk/mutations/common';
import { KeychainRequest, KeychainResponse, getRequiredAuthority } from '../bridges/bridgeTypes';

export function useKeychainMessageHandler(webViewRef: RefObject<WebView | null>) {
  const { username, authContext } = useMutationAuth();

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

        case 'delegation':
          return [
            buildDelegateVestingSharesOp(account, data.delegatee, `${data.amount} ${data.unit}`),
          ];

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

        case 'powerDown':
          return [
            buildWithdrawVestingOp(account, `${parseFloat(data.steem_power).toFixed(6)} VESTS`),
          ];

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
          if (data.operation === 'deposit') {
            return [
              buildTransferToSavingsOp(
                account,
                data.to || account,
                `${parseFloat(data.amount).toFixed(3)} ${data.currency}`,
                data.memo || '',
              ),
            ];
          }
          return [
            buildTransferFromSavingsOp(
              account,
              data.to || account,
              `${parseFloat(data.amount).toFixed(3)} ${data.currency}`,
              data.memo || '',
              Date.now() & 0xffffffff,
            ),
          ];
        }

        case 'convert': {
          const requestId = Date.now() & 0xffffffff;
          if (data.collaterized) {
            return [buildCollateralizedConvertOp(account, data.amount, requestId)];
          }
          return [buildConvertOp(account, data.amount, requestId)];
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

        case 'addAccountAuthority':
          // Requires fetching current account authorities — not directly supported yet
          return null;

        default:
          return null;
      }
    },
    [],
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

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let parsed: KeychainRequest;
      try {
        parsed = JSON.parse(event.nativeEvent.data);
      } catch {
        return; // Not a keychain message
      }

      // Handle handshake
      if (parsed.name === 'swHandshake_hive') {
        _sendHandshake(parsed.request_id);
        return;
      }

      if (parsed.name !== 'swRequest_hive') {
        return;
      }

      const { request_id, data } = parsed;
      const { type } = data;
      const requestedUsername = data.username;

      // Validate username matches current account
      if (requestedUsername && username && requestedUsername !== username) {
        _sendError(
          request_id,
          `Account mismatch: requested "${requestedUsername}" but logged in as "${username}"`,
        );
        return;
      }

      const account = requestedUsername || username;
      if (!account) {
        _sendError(request_id, 'No account available. Please log in first.');
        return;
      }

      // Unsupported operations
      if (
        type === 'signBuffer' ||
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
      const operations = _buildOperations(type, data, account);
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
        const approved = await SheetManager.show(SheetNames.KEYCHAIN_CONFIRM, {
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
      broadcastMutation,
      postingBroadcastMutation,
    ],
  );

  return { handleMessage };
}
