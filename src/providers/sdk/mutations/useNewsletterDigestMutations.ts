import { useLeaveDigest, useSubscribeDigest, useUnsubscribeAllDigests } from '@ecency/sdk';
import { useAuth } from '../../../hooks';

/**
 * Email digest mutations (newsletter reader phase, vision-mobile#3518). These
 * are REST mutations against the newsletter relay, not broadcasts, so they
 * bind the HiveSigner code from useAuth() instead of the platform adapter.
 * The SDK hooks keep the shared subscriptions cache in sync on success.
 */
export function useSubscribeDigestMutation() {
  const { username, code } = useAuth();
  return useSubscribeDigest(username, code);
}

export function useLeaveDigestMutation() {
  const { username, code } = useAuth();
  return useLeaveDigest(username, code);
}

export function useUnsubscribeAllDigestsMutation() {
  const { username, code } = useAuth();
  return useUnsubscribeAllDigests(username, code);
}
