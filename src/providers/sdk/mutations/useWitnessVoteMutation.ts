import { useWitnessVote } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useWitnessVoteMutation() {
  const { username, authContext } = useMutationAuth();
  return useWitnessVote(username, authContext, 'async');
}
