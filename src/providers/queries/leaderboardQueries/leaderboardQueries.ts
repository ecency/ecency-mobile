import { useQuery } from '@tanstack/react-query';
import { getDiscoverLeaderboardQueryOptions } from '@ecency/sdk';

/** hook used to return leaderboard data using SDK */
export const useGetLeaderboardQuery = (duration: 'day' | 'week' | 'month') => {
  return useQuery(getDiscoverLeaderboardQueryOptions(duration));
};
