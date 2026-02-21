import { useTransfer } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransfer(username, authContext);
}
