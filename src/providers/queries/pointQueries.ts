import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPointsQueryOptions, getQuestsQueryOptions } from '@ecency/sdk';
import { scheduleQuestsRefresh } from '../../utils/refreshQuests';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  deletePointActivityCache,
  updatePointActivityCache,
} from '../../redux/actions/cacheActions';
import { generateRndStr } from '../../utils/editor';
import { PointActivity, PointActivityIds } from '../ecency/ecency.types';
import { userActivity } from '../ecency/ePoint';
import { selectCurrentAccount, selectIsLoggedIn } from '../../redux/selectors';

interface UserActivityMutationVars {
  pointsTy: PointActivityIds;
  blockNum?: string | number;
  transactionId?: string;
  cacheId?: string;
  /**
   * Who performed the activity, captured when it happened. The quest refresh fires a
   * minute later, by which time `currentAccount` may be someone else: without this, a
   * switch mid-flight refreshes the wrong account and leaves the real one stale.
   * Replayed activities already carry it from the redux queue.
   */
  username?: string;
}

/**
 * Hook to get points summary and transactions using SDK
 * @param username - The username to fetch points for
 * @param filter - Transaction type filter (0 = all, 10 = transfer, 20 = boost, etc.)
 * @returns Query result with points, uPoints (unclaimed), and transactions
 */
export const useGetPointsQuery = (username?: string, filter = 0) => {
  const queryResult = useQuery({
    ...getPointsQueryOptions(username, filter),
    enabled: !!username,
  });

  return queryResult;
};

/**
 * Read-only daily/weekly/monthly quest progress for the perks dashboard.
 * Aggregates the user's existing points activity (no minting).
 */
export const useGetQuestsQuery = (username?: string) => {
  return useQuery({
    ...getQuestsQueryOptions(username),
    enabled: !!username,
    // Opted in explicitly: the client default is off, because waking every query in
    // the cache on every resume is far more than this needs. Quest progress is the
    // thing users come back to the app to look at.
    refetchOnWindowFocus: true,
  });
};

export const useUserActivityMutation = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
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
      // The activity is only recorded here, not yet credited. Ask again once the
      // backend has had time to verify and process it, otherwise the quest card and
      // the editor chip keep showing pre-action numbers until something remounts.
      scheduleQuestsRefresh(queryClient, vars.username ?? currentAccount?.name);
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

// The backend records at most one check-in per ~15 min window and drops
// anything closer, so repeated content opens inside a window would only burn
// requests. Kept at module scope so the spacing survives screen remounts, and
// keyed by account so switching users still checks in.
const CHECKIN_THROTTLE_MS = 15 * 60 * 1000;
const lastCheckinAt: Record<string, number> = {};

/**
 * Records a daily check-in (point activity type 10) when the user actually
 * reads something: opening a post/comment/reply, including from notifications,
 * or browsing waves. Deliberately not wired to app startup, which already has
 * plenty to do on launch.
 */
export const useCheckIn = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const { mutate } = useUserActivityMutation();

  const username = currentAccount?.name;

  return useCallback(() => {
    if (!isLoggedIn || !username) {
      return;
    }

    const now = Date.now();
    if (now - (lastCheckinAt[username] || 0) < CHECKIN_THROTTLE_MS) {
      return;
    }

    // Claim the window before firing so parallel opens don't double-post, then
    // release it if the request ends up failing: the activity is queued for
    // replay, but a rejected call shouldn't also mute the next 15 minutes.
    lastCheckinAt[username] = now;
    mutate(
      { pointsTy: PointActivityIds.CHECKIN, username },
      {
        onError: () => {
          if (lastCheckinAt[username] === now) {
            delete lastCheckinAt[username];
          }
        },
      },
    );
  }, [isLoggedIn, username, mutate]);
};
