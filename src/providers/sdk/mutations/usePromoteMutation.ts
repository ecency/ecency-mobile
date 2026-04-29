import { usePromote } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function usePromoteMutation() {
  const { username, authContext } = useMutationAuth();
  return usePromote(username, authContext, 'async');
}
