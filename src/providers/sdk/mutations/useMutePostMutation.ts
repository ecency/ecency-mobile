import { useMutePost } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useMutePostMutation() {
  const { username, authContext } = useMutationAuth();
  return useMutePost(username, authContext, 'async');
}
