import { useBroadcastMutation, buildIgnoreOp } from '@ecency/sdk';
import { useMutationAuth } from './common';

export function useIgnoreUserMutation() {
  const { username, authContext } = useMutationAuth();
  return useBroadcastMutation(
    ['hive', 'ignore-user'],
    username,
    ({ following }: { following: string }) => [buildIgnoreOp(username!, following)],
    undefined,
    authContext,
    'posting',
    { broadcastMode: 'async' },
  );
}
