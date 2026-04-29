import { useTransferPoint } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferPointMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransferPoint(username, authContext, 'async');
}
