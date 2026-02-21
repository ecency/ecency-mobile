import { useProposalVote } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useProposalVoteMutation() {
  const { username, authContext } = useMutationAuth();
  return useProposalVote(username, authContext);
}
