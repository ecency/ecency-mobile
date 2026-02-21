import { useUndelegateEngineToken } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useUndelegateEngineTokenMutation() {
  const { username, authContext } = useMutationAuth();
  return useUndelegateEngineToken(username, authContext);
}
