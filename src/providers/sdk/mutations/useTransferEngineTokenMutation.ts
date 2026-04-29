import { useTransferEngineToken } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useTransferEngineTokenMutation() {
  const { username, authContext } = useMutationAuth();
  return useTransferEngineToken(username, authContext, 'async');
}
