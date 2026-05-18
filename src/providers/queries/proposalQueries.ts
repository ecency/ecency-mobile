import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// Single source of truth for the proposal vote operation so the broadcast
// factory and the active-key path cannot drift apart.
const buildProposalVoteOperation = (voter: string, proposalId: number) => [
  'update_proposal_votes',
  {
    voter,
    proposal_ids: [proposalId],
    approve: true,
    extensions: [],
  },
];

// query for getting active proposal meta using SDK
// SDK returns Proposal[], but we filter for @ecency creator and map to ProposalMeta
export const useActiveProposalMetaQuery = () => {
  return useQuery({
    ...getProposalsQueryOptions(),
    select: (proposals) => {
      if (!proposals || proposals.length === 0) return undefined;

      // Surface the newest votable @ecency proposal (highest id). Hive marks
      // not-yet-started proposals as "inactive" and running ones as "active";
      // both are votable, only "expired" is past its end date. Restricting to
      // "active" hid brand-new (upcoming) proposals that users can already
      // vote for.
      const ecencyProposal = proposals
        .filter((p) => p.creator === 'ecency' && p.status !== 'expired')
        .sort((a, b) => Number(b.proposal_id) - Number(a.proposal_id))[0];

      if (!ecencyProposal) {
        return undefined;
      }

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

  const _username = currentAccount?.name;

  // form meta id
  const _cacheId = `${proposalId}_${_username}`;
  const _proposalVoteMeta: ProposalVoteMeta | null = proposalsVoteMeta?.[_cacheId];

  // Use SDK to get user's proposal votes, then check if this proposal is voted.
  // No initialData: the raw data must stay ProposalVote[] — seeding a boolean
  // corrupts the shared query cache for every other consumer of this key.
  const query = useQuery({
    ...getUserProposalVotesQueryOptions(_username ?? ''),
    enabled: !!_username,
    select: (votedProposals) => {
      if (!proposalId || !votedProposals || votedProposals.length === 0) {
        return false;
      }
      // Normalize proposal IDs to numbers before comparing; `proposal` is
      // optional on ProposalVote, so guard it to avoid throwing in select.
      return votedProposals.some(
        (item) => Number(item.proposal?.proposal_id) === Number(proposalId),
      );
    },
  });

  return {
    ...query,
    meta: _proposalVoteMeta,
  };
};

export const useProposalVoteMutation = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { executeOperation } = useActiveKeyOperation();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const auth = useAuthContext();

  const _username = currentAccount?.name;

  const broadcastMutation = useBroadcastMutation<{ proposalId: number }>(
    ['proposals', 'vote'],
    _username,
    ({ proposalId }) => [buildProposalVoteOperation(_username ?? '', proposalId)],
    () => {},
    auth,
    'active',
    { broadcastMode: 'async' },
  );

  return useMutation<any, Error, { proposalId: number }>({
    mutationFn: async ({ proposalId }) => {
      if (!_username) {
        throw new Error('No active account to vote with');
      }

      return executeOperation({
        operations: [buildProposalVoteOperation(_username, proposalId)],
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

    // Every attempt re-runs the full signing flow (HiveSigner / HiveAuth /
    // auth-upgrade sheet), so auto-retrying would re-prompt the user.
    retry: false,
    onSuccess: (_, { proposalId }) => {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.thankyou' })));

      if (_username) {
        dispatch(updateProposalVoteMeta(proposalId, _username, true));
        // Refresh the authoritative on-chain vote list so every other
        // consumer reflects the new vote instead of staying stale.
        queryClient.invalidateQueries({
          queryKey: getUserProposalVotesQueryOptions(_username).queryKey,
        });
      }
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
