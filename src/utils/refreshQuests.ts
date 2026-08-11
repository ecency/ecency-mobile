import { QueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@ecency/sdk';

/**
 * How long to wait before asking the backend for updated quest progress.
 *
 * A blockchain action is not credited the moment it is broadcast: it has to be
 * verified against the chain and then processed before it counts, which lands a
 * little over a minute after the fact. Refreshing sooner just re-reads the
 * pre-action numbers and, because the answer is then fresh for the query's
 * staleTime, actively prevents the real update from being picked up.
 */
export const QUESTS_REFRESH_DELAY = 70 * 1000;

let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced refresh of the quests/streak query so the perks quest card and the
 * editor quest chip catch up after a points-earning action.
 *
 * The debounce coalesces a burst of actions into a single `/private-api/quests`
 * request, and invalidating (rather than refetching) means nothing goes over the
 * wire unless a screen is actually observing the query.
 *
 * Unlike the website this is not skipped for votes. The website excludes them
 * because its debounce is short enough that fast feed voting would fan out
 * requests; at this delay a voting burst collapses into one request after the
 * user stops, and the daily vote quest is exactly one people watch.
 */
export const scheduleQuestsRefresh = (queryClient: QueryClient, username?: string | null) => {
  const name = username?.replace('@', '');
  if (!name) {
    return;
  }

  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    timer = null;
    queryClient.invalidateQueries({ queryKey: QueryKeys.quests.status(name) });
  }, QUESTS_REFRESH_DELAY);
};

/** Test seam: drop any pending refresh so specs do not leak timers into each other. */
export const cancelQuestsRefresh = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};
