import { useDelegateRc } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useDelegateRcMutation() {
  const { username, authContext } = useMutationAuth();
  return useDelegateRc(username, authContext);
}
