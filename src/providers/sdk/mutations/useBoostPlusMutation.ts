import { useBoostPlus } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useBoostPlusMutation() {
  const { username, authContext } = useMutationAuth();
  return useBoostPlus(username, authContext, 'async');
}
