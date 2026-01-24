import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getProposalsQueryOptions,
  getUserProposalVotesQueryOptions,
  useBroadcastMutation,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { ProposalVoteMeta } from 'redux/reducers/cacheReducer';
import * as hiveuri from 'hive-uri';
import { useNavigation } from '@react-navigation/native';
import { PrivateKey } from '@hiveio/dhive';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { updateProposalVoteMeta } from '../../redux/actions/cacheActions';
import authType from '../../constants/authType';
import ROUTES from '../../constants/routeNames';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';
import { getDigitPinCode, getClient } from '../hive/dhive';
import { mapAuthTypeToLoginType } from '../../utils/authMapper';

// query for getting active proposal meta using SDK
// SDK returns Proposal[], but we filter for @ecency creator and map to ProposalMeta
export const useActiveProposalMetaQuery = () => {
  return useQuery({
    ...getProposalsQueryOptions('active'),
    select: (proposals) => {
      if (!proposals || proposals.length === 0) return undefined;

      // Find first active proposal created by @ecency account
      const ecencyProposal = proposals.find((p) => p.creator === 'ecency' && p.status === 'active');

      if (!ecencyProposal) {
        return undefined;
      }

      // Map to ProposalMeta format
      const proposalMeta: ProposalMeta = {
        id: Number(ecencyProposal.proposal_id),
      };

      return proposalMeta;
    },
  });
};

export const useProposalVotedQuery = (proposalId?: number) => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const proposalsVoteMeta = useAppSelector((state) => state.cache.proposalsVoteMeta);

  // form meta id
  const _cacheId = `${proposalId}_${currentAccount.name}`;
  const _proposalVoteMeta: ProposalVoteMeta | null = proposalsVoteMeta[_cacheId];

  // Use SDK to get user's proposal votes, then check if this proposal is voted
  const query = useQuery({
    ...getUserProposalVotesQueryOptions(currentAccount.name),
    select: (votedProposals) => {
      if (!proposalId || !votedProposals || votedProposals.length === 0) {
        return false;
      }
      // Normalize proposal IDs to numbers before comparing
      const isVoted = votedProposals.some(
        (item) => Number(item.proposal.proposal_id) === Number(proposalId),
      );
      return isVoted;
    },
    initialData: false,
  });

  return {
    ...query,
    meta: _proposalVoteMeta,
  };
};

export const useProposalVoteMutation = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const intl = useIntl();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

  // Prepare auth credentials
  const digitPinCode = getDigitPinCode(pinHash);
  if (!digitPinCode) {
    console.error('[ProposalVote] Failed to get digit pin code');
  }

  const isHiveSigner =
    currentAccount.local.authType === authType.STEEM_CONNECT ||
    currentAccount.local.authType === authType.HIVE_AUTH;

  const accessToken = isHiveSigner
    ? decryptKey(currentAccount.local.accessToken, digitPinCode)
    : undefined;

  // Note: proposal voting requires active key, not posting key
  const activeKey =
    !isHiveSigner && currentAccount.local.activeKey
      ? decryptKey(currentAccount.local.activeKey, digitPinCode)
      : undefined;

  // Validate required credentials
  if (!isHiveSigner && !activeKey) {
    console.error('[ProposalVote] Active key required for proposal voting but not found');
  }
  if (isHiveSigner && !accessToken) {
    console.error('[ProposalVote] Access token required for HiveSigner but not found');
  }

  // Prepare auth context matching SDK signature
  const auth = isHiveSigner
    ? {
        accessToken,
        loginType: mapAuthTypeToLoginType(currentAccount.local.authType),
      }
    : {
        // For proposal voting, we need active authority
        broadcast: async (operations: any[]) => {
          if (!activeKey) {
            throw new Error('[ProposalVote] Active key required for proposal voting');
          }
          const privateKey = PrivateKey.fromString(activeKey);
          const client = await getClient();
          return client.broadcast.sendOperations(operations, privateKey);
        },
        loginType: 'privateKey' as const,
      };

  const broadcastMutation = useBroadcastMutation<{ proposalId: number }>(
    ['proposals', 'vote'],
    currentAccount.name,
    ({ proposalId }) => [
      [
        'update_proposal_votes',
        {
          voter: currentAccount.name,
          proposal_ids: [proposalId],
          approve: true,
          extensions: [],
        },
      ],
    ],
    () => {}, // onSuccess callback
    auth,
  );

  return useMutation<any, Error, { proposalId: number }>({
    mutationFn: async ({ proposalId }) => {
      console.log('[ProposalVote] Starting vote for proposal:', proposalId);
      console.log('[ProposalVote] Auth type:', currentAccount.local.authType);
      console.log('[ProposalVote] Has active key:', !!activeKey);
      console.log('[ProposalVote] Is HiveSigner:', isHiveSigner);

      // Validate credentials before attempting broadcast
      if (!isHiveSigner && !activeKey) {
        console.error('[ProposalVote] Missing active key');
        throw new Error('ACTIVE_KEY_REQUIRED');
      }
      if (isHiveSigner && !accessToken) {
        console.error('[ProposalVote] Missing access token');
        throw new Error('ACCESS_TOKEN_REQUIRED');
      }

      // For HiveSigner/HiveAuth, use navigation modal instead of direct API call
      if (
        currentAccount.local.authType === authType.STEEM_CONNECT ||
        currentAccount.local.authType === authType.HIVE_AUTH
      ) {
        console.log('[ProposalVote] Using HiveSigner modal');
        const _enHiveuri = hiveuri.encodeOp([
          'update_proposal_votes',
          {
            voter: currentAccount.name,
            proposal_ids: [proposalId],
            approve: true,
            extensions: [],
          },
        ]);

        return new Promise((resolve, reject) => {
          navigation.navigate(ROUTES.MODALS.HIVE_SIGNER, {
            hiveuri: _enHiveuri,
            onSuccess: () => {
              // Transaction was successfully signed
              console.log('[ProposalVote] HiveSigner success');
              resolve(true);
            },
            onClose: () => {
              // User closed modal without signing
              console.log('[ProposalVote] HiveSigner modal closed');
              reject(new Error('HiveSigner modal closed without signing transaction'));
            },
          });
        });
      }

      // For other auth types, use SDK broadcast
      console.log('[ProposalVote] Using SDK broadcast with active key');
      try {
        const result = await broadcastMutation.mutateAsync({ proposalId });
        console.log('[ProposalVote] Broadcast successful:', result);
        return result;
      } catch (error) {
        console.error('[ProposalVote] Broadcast failed:', error);
        throw error;
      }
    },

    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message === 'ACTIVE_KEY_REQUIRED' || error.message === 'ACCESS_TOKEN_REQUIRED') {
        return false;
      }
      // Retry network/blockchain errors up to 3 times
      return failureCount < 3;
    },
    onSuccess: (_, { proposalId }) => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.thankyou' })));
      dispatch(updateProposalVoteMeta(proposalId, currentAccount.name, true));
    },
    onError: (error) => {
      console.error('[ProposalVote] Error:', error);
      console.error('[ProposalVote] Error message:', error.message);
      console.error('[ProposalVote] Error stack:', error.stack);

      // Show specific error messages based on error type
      if (error.message === 'ACTIVE_KEY_REQUIRED') {
        const message =
          intl.formatMessage({ id: 'alert.key_warning.active_key' }) ||
          'Active key required for proposal voting. Please add your active key in settings.';
        console.log('[ProposalVote] Showing active key required message');
        dispatch(toastNotification(message));
      } else if (error.message === 'ACCESS_TOKEN_REQUIRED') {
        const message = `${intl.formatMessage({ id: 'alert.fail' })}: Access token missing`;
        console.log('[ProposalVote] Showing access token required message');
        dispatch(toastNotification(message));
      } else {
        // Show the actual error message if available, otherwise generic fail message
        const message = error.message
          ? `${intl.formatMessage({ id: 'alert.fail' })}: ${error.message}`
          : intl.formatMessage({ id: 'alert.fail' });
        console.log('[ProposalVote] Showing generic error message:', message);
        dispatch(toastNotification(message));
      }
    },
  });
};
