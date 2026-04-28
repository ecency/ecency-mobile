import { useTransferLarynx } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferLarynxMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransferLarynx(username, authContext, 'async');
}
