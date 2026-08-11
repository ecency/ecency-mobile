import { useQuery } from '@tanstack/react-query';
import { getDiscoverLeaderboardQueryOptions } from '@ecency/sdk';

/** hook used to return leaderboard data using SDK */
export const useGetLeaderboardQuery = (duration: 'day' | 'week' | 'month') => {
  return useQuery({
    ...getDiscoverLeaderboardQueryOptions(duration),
    // Opted in explicitly: the client default is off, because waking every query in
    // the cache on every resume is far more than this needs. The board lives inside a
    // tab that stays mounted, so without this it shows whatever it fetched hours ago
    // until the user thinks to pull to refresh.
    refetchOnWindowFocus: true,
  });
};
