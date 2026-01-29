import { useMutation, useQuery } from '@tanstack/react-query';
import { getPointsQueryOptions } from '@ecency/sdk';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  deletePointActivityCache,
  updatePointActivityCache,
} from '../../redux/actions/cacheActions';
import { generateRndStr } from '../../utils/editor';
import { PointActivity, PointActivityIds } from '../ecency/ecency.types';
import { userActivity } from '../ecency/ePoint';
import { selectCurrentAccount } from '../../redux/selectors';

interface UserActivityMutationVars {
  pointsTy: PointActivityIds;
  blockNum?: string | number;
  transactionId?: string;
  cacheId?: string;
}

/**
 * Hook to get points summary and transactions using SDK
 * @param username - The username to fetch points for
 * @param filter - Transaction type filter (0 = all, 10 = transfer, 20 = boost, etc.)
 * @returns Query result with points, uPoints (unclaimed), and transactions
 */
export const useGetPointsQuery = (username?: string, filter = 0) => {
  return useQuery(getPointsQueryOptions(username, filter));
};

export const useUserActivityMutation = () => {
  const dispatch = useAppDispatch();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pointActivitiesCache: Map<string, PointActivity> = useAppSelector(
    (state) => state.cache.pointActivities,
  );

  const _mutationFn = async ({ pointsTy, blockNum, transactionId }: UserActivityMutationVars) => {
    await userActivity(pointsTy, transactionId, blockNum);
    return true;
  };

  const mutation = useMutation<boolean, Error, UserActivityMutationVars>({
    mutationFn: _mutationFn,
    retry: 2,
    onSuccess: (data, vars) => {
      console.log('successfully logged activity', data, vars);
      // remove entry from redux
      if (vars.cacheId) {
        console.log('must remove from redux');
        dispatch(deletePointActivityCache(vars.cacheId));
      }
    },
    onError: (error, vars) => {
      console.log('failed to log activity', error, vars);
      // add entry in redux
      if (!vars.cacheId && currentAccount) {
        console.log('must add to from redux');
        const cacheId = generateRndStr();
        const { username } = currentAccount;
        dispatch(updatePointActivityCache(cacheId, { ...vars, username }));
      }
    },
  });

  const lazyMutatePendingActivities = () => {
    setTimeout(() => {
      // read pending activities from redux
      if (currentAccount && pointActivitiesCache && pointActivitiesCache.size) {
        Array.from(pointActivitiesCache).forEach(([id, activity]) => {
          if (currentAccount.name === activity.username) {
            mutation.mutate({
              cacheId: id,
              ...activity,
            });
          }
        });
      }
    }, 3000);
  };

  return {
    ...mutation,
    lazyMutatePendingActivities,
  };
};
