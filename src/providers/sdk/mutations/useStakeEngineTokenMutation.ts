import { useStakeEngineToken } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useStakeEngineTokenMutation() {
  const { username, authContext } = useMutationAuth();
  return useStakeEngineToken(username, authContext);
}
