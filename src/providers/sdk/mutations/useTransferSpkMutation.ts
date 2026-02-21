import { useTransferSpk } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferSpkMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransferSpk(username, authContext);
}
