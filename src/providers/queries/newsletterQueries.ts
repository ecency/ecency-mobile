import { useQuery } from '@tanstack/react-query';
import {
  DigestSubscription,
  DigestType,
  getDigestSubscriptionsQueryOptions,
  useLeaveDigest,
  useSubscribeDigest,
  useUnsubscribeAllDigests,
} from '@ecency/sdk';
import { useAuth } from '../../hooks';

/**
 * Email digest subscriptions (the newsletter reader phase, vision-mobile#3518).
 * Transport lives in @ecency/sdk (shared with web): the relay at
 * {privateApiHost}/api/newsletter/* authenticates POSTs from the body `code`
 * and GET/DELETE from the X-HS-Token header; signed-in callers need no
 * captcha. These wrappers only bind the SDK hooks to the mobile auth context.
 */

/** The source value the relay's allowlist accepts for this app (vision-web#1660). */
export const MOBILE_DIGEST_SOURCE = 'mobile-app' as const;

/** The signed-in account's digest subscription for one list, if any. */
export const findDigestSubscription = (
  subscriptions: DigestSubscription[] | undefined,
  type: DigestType,
  target: string,
): DigestSubscription | undefined =>
  (subscriptions ?? []).find(
    (s) => s.type === type && s.target.toLowerCase() === target.toLowerCase(),
  );

/**
 * The address the service already holds for this account, learned from any
 * live subscription. When known, a further subscribe is one action; when
 * unknown, the person is asked for an address.
 */
export const knownDigestAddress = (
  subscriptions: DigestSubscription[] | undefined,
): string | null => subscriptions?.find((s) => s.email)?.email ?? null;

export const useDigestSubscriptionsQuery = () => {
  const { username, code } = useAuth();
  return useQuery(getDigestSubscriptionsQueryOptions(username, code));
};

export const useDigestSubscription = (type: DigestType, target: string) => {
  const query = useDigestSubscriptionsQuery();
  return { ...query, subscription: findDigestSubscription(query.data, type, target) };
};

export const useSubscribeDigestMutation = () => {
  const { username, code } = useAuth();
  return useSubscribeDigest(username, code);
};

export const useLeaveDigestMutation = () => {
  const { username, code } = useAuth();
  return useLeaveDigest(username, code);
};

export const useUnsubscribeAllDigestsMutation = () => {
  const { username, code } = useAuth();
  return useUnsubscribeAllDigests(username, code);
};
