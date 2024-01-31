import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../../ecency/ecency';
import QUERIES from '../queryKeys';

/** hook used to return user drafts */
export const useGetLeaderboardQuery = (duration: 'day' | 'week' | 'month') => {
  const _getLeaderboard = async () => {
    const data = await getLeaderboard(duration);
    return data || [];
  };

  return useQuery([QUERIES.LEADERBOARD.GET, duration], _getLeaderboard);
};
