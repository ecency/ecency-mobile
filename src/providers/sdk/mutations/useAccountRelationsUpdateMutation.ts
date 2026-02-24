import { useAccountRelationsUpdate, AccountRelationship } from '@ecency/sdk';
import { useMutationAuth } from './common';

/**
 * Wrapper around the SDK's useAccountRelationsUpdate.
 *
 * Unlike other mutation wrappers, this one requires a `target` username
 * and callbacks because the SDK hook bakes them into the mutation options.
 */
export function useAccountRelationsUpdateMutation(
  target: string | undefined,
  onSuccess: (data: Partial<AccountRelationship> | undefined) => void,
  onError: (e: Error) => void,
) {
  const { username, authContext } = useMutationAuth();
  return useAccountRelationsUpdate(username, target, authContext, onSuccess, onError);
}
