import { useMutation, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { ProposalVoteMeta } from 'redux/reducers/cacheReducer';
import QUERIES from './queryKeys';
import { getProposalsVoted, voteProposal } from '../hive/dhive';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { updateProposalVoteMeta } from '../../redux/actions/cacheActions';
import { getActiveProposalMeta } from '../../providers/ecency/ecency';
import { ProposalMeta } from '../../providers/ecency/ecency.types';

//query for getting active proposal meta;
export const useActiveProposalMetaQuery = () => {
  return useQuery<ProposalMeta>([QUERIES.PROPOSALS.GET_ACTIVE_PROPOSAL], getActiveProposalMeta);
}

export const useProposalVotedQuery = (proposalId?: number) => {
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const proposalsVoteMeta = useSelector((state) => state.cache.proposalsVoteMeta);

  // form meta id
  const _cacheId = `${proposalId}_${currentAccount.username}`;
  const _proposalVoteMeta: ProposalVoteMeta | null = proposalsVoteMeta[_cacheId];

  const _getProposalVoteStatus = async () => {
    if (!proposalId) {
      return true;
    }
    const votedProposals = await getProposalsVoted(currentAccount.username);
    const isVoted = votedProposals.some((item) => item.proposal.proposal_id === proposalId);

    console.log('is proposal voted', isVoted);
    return isVoted;
  };

  const query = useQuery(
    [QUERIES.PROPOSALS.GET_VOTES, currentAccount.name, proposalId],
    _getProposalVoteStatus,
    { initialData: true },
  );

  return {
    ...query,
    meta: _proposalVoteMeta,
  };
};

export const useProposalVoteMutation = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  return useMutation<any, Error, { proposalId: number }>(
    ({ proposalId }) => voteProposal(currentAccount, pinHash, proposalId),
    {
      retry: 3,
      onSuccess: (_, { proposalId }) => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.thankyou' })));
        dispatch(updateProposalVoteMeta(proposalId, currentAccount.username, true));
      },
      onError: () => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      },
    },
  );
};
