import { useQuery } from '@tanstack/react-query';
import { getProMembersQueryOptions, proMembersSet, type ProMembersResponse } from '@ecency/sdk';

// Module-level select keeps its identity stable across renders so React Query
// memoizes the derived Set instead of rebuilding it on every consumer render.
const selectProSet = (data: ProMembersResponse): Set<string> => proMembersSet(data.members);

/**
 * Fetch the public Ecency Pro roster and expose it as a lowercase Set for O(1)
 * membership checks. Backed by the shared SDK query (`getProMembersQueryOptions`) and
 * `proMembersSet`, so web and mobile share a single implementation of both the fetch
 * and the normalization.
 */
export const useProMembersQuery = () =>
  useQuery({
    ...getProMembersQueryOptions(),
    gcTime: 30 * 60 * 1000, // keep the roster cached across screens (roster changes rarely)
    select: selectProSet,
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
