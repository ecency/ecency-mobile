import { useTransferToSavings } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferToSavingsMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransferToSavings(username, authContext);
}
