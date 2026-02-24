import { useDelegateEngineToken } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useDelegateEngineTokenMutation() {
  const { username, authContext } = useMutationAuth();
  return useDelegateEngineToken(username, authContext);
}
