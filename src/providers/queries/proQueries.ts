import { useQuery } from '@tanstack/react-query';
import QUERIES from './queryKeys';
import { getProMembers } from '../ecency/ecency';
import { ProMembersResponse } from '../ecency/ecency.types';

const PRO_STALE_TIME = 5 * 60 * 1000; // 5 minutes - roster changes infrequently
const PRO_GC_TIME = 30 * 60 * 1000; // Keep in cache for 30 minutes

// Module-level select keeps its identity stable across renders so React Query
// memoizes the derived Set instead of rebuilding it on every consumer render.
const selectProSet = (data: ProMembersResponse): Set<string> =>
  new Set((data?.members ?? []).map((username) => username.toLowerCase()));

/**
 * Fetch the public Ecency Pro roster once and expose it as a lowercase Set for
 * O(1) membership checks. The roster is shared across every Pro badge, so it is
 * fetched under a single query key and cached for all consumers.
 */
export const useProMembersQuery = () =>
  useQuery({
    queryKey: [QUERIES.PRO.GET_MEMBERS],
    queryFn: getProMembers,
    select: selectProSet,
    staleTime: PRO_STALE_TIME,
    gcTime: PRO_GC_TIME,
  });

/**
 * Convenience hook: true when the given username is an Ecency Pro member.
 */
export const useIsProMember = (username?: string): boolean => {
  const { data: proSet } = useProMembersQuery();

  if (!username || !proSet) {
    return false;
  }

  return proSet.has(username.toLowerCase());
};
