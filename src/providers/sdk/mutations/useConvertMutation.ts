import { useConvert } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useConvertMutation() {
  const { username, authContext } = useMutationAuth();
  return useConvert(username, authContext);
}
