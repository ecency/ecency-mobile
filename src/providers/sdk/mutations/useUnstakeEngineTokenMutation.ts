import { useUnstakeEngineToken } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useUnstakeEngineTokenMutation() {
  const { username, authContext } = useMutationAuth();
  return useUnstakeEngineToken(username, authContext, 'async');
}
