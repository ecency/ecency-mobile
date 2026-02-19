import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getProposalsQueryOptions,
  getUserProposalVotesQueryOptions,
  useBroadcastMutation,
} from '@ecency/sdk';
import { useIntl } from 'react-intl';
import { ProposalVoteMeta } from 'redux/reducers/cacheReducer';
import { useAppDispatch, useAppSelector, useActiveKeyOperation } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { updateProposalVoteMeta } from '../../redux/actions/cacheActions';
import { selectCurrentAccount } from '../../redux/selectors';
import { useAuthContext } from '../sdk/useAuthContext';

// query for getting active proposal meta using SDK
// SDK returns Proposal[], but we filter for @ecency creator and map to ProposalMeta
export const useActiveProposalMetaQuery = () => {
  return useQuery({
    ...getProposalsQueryOptions(),
    select: (proposals) => {
      if (!proposals || proposals.length === 0) return undefined;

      // Find latest active proposal created by @ecency account (highest ID)
      const ecencyProposal = proposals
        .filter((p) => p.creator === 'ecency' && p.status === 'active')
        .sort((a, b) => Number(b.proposal_id) - Number(a.proposal_id))[0];

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
  const intl = useIntl();
  const { executeOperation } = useActiveKeyOperation();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const auth = useAuthContext();

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
    () => {},
    auth,
    'active',
  );

  return useMutation<any, Error, { proposalId: number }>({
    mutationFn: async ({ proposalId }) => {
      const operation = [
        'update_proposal_votes',
        {
          voter: currentAccount.name,
          proposal_ids: [proposalId],
          approve: true,
          extensions: [],
        },
      ];

      return executeOperation({
        operations: [operation],
        privateKeyHandler: async () => {
          return broadcastMutation.mutateAsync({ proposalId });
        },
        callbacks: {
          onError: (error) => {
            console.error('[ProposalVote] Broadcast failed:', error);
          },
        },
      });
    },

    retry: (failureCount, error) => {
      const message = error?.message || '';
      if (message === 'Operation cancelled by user') return false;
      if (message.includes('HiveSigner modal closed')) return false;
      return failureCount < 3;
    },
    onSuccess: (_, { proposalId }) => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.thankyou' })));
      dispatch(updateProposalVoteMeta(proposalId, currentAccount.name, true));
    },
    onError: (error) => {
      console.error('[ProposalVote] Error:', error);
      const message = error.message
        ? `${intl.formatMessage({ id: 'alert.fail' })}: ${error.message}`
        : intl.formatMessage({ id: 'alert.fail' });
      dispatch(toastNotification(message));
    },
  });
};
