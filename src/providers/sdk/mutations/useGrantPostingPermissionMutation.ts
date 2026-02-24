import { useGrantPostingPermission } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useGrantPostingPermissionMutation() {
  const { username, authContext } = useMutationAuth();
  return useGrantPostingPermission(username, authContext);
}
