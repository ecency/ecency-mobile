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
import { ProposalMeta } from '../ecency/ecency.types';
import authType from '../../constants/authType';
import ROUTES from '../../constants/routeNames';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { decryptKey } from '../../utils/crypto';
import { getDigitPinCode, getClient } from '../hive/dhive';
import { mapAuthTypeToLoginType } from '../../utils/authMapper';

// query for getting active proposal meta using SDK
// SDK returns Proposal[], but we select the first active proposal
export const useActiveProposalMetaQuery = () => {
  return useQuery({
    ...getProposalsQueryOptions('active'),
    select: (proposals) => {
      // Return first active proposal as ProposalMeta
      return proposals?.[0] as ProposalMeta | undefined;
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
      const isVoted = votedProposals.some((item) => item.proposal.proposal_id === proposalId);
      console.log('is proposal voted', isVoted);
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
    mutationFn: ({ proposalId }) => {
      // Validate credentials before attempting broadcast
      if (!isHiveSigner && !activeKey) {
        throw new Error('Active key required for proposal voting');
      }
      if (isHiveSigner && !accessToken) {
        throw new Error('Access token required for HiveSigner');
      }

      // For HiveSigner/HiveAuth, use navigation modal instead of direct API call
      if (
        currentAccount.local.authType === authType.STEEM_CONNECT ||
        currentAccount.local.authType === authType.HIVE_AUTH
      ) {
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
              resolve(true);
            },
            onClose: () => {
              // User closed modal without signing
              reject(new Error('HiveSigner modal closed without signing transaction'));
            },
          });
        });
      }

      // For other auth types, use SDK broadcast
      return broadcastMutation.mutateAsync({ proposalId });
    },

    retry: 3,
    onSuccess: (_, { proposalId }) => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.thankyou' })));
      dispatch(updateProposalVoteMeta(proposalId, currentAccount.name, true));
    },
    onError: () => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
    },
  });
};
