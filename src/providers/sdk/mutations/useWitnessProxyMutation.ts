import { useWitnessProxy } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useWitnessProxyMutation() {
  const { username, authContext } = useMutationAuth();
  return useWitnessProxy(username, authContext);
}
