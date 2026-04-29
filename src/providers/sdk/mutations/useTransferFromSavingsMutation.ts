import { useTransferFromSavings } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferFromSavingsMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransferFromSavings(username, authContext, 'async');
}
