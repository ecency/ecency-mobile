import { useQuery } from '@tanstack/react-query';
import {
  estimateRcPrecheck,
  getAccountRcQueryOptions,
  getRcResourceParamsQueryOptions,
  getRcStatsQueryOptions,
} from '@ecency/sdk';
import type { RcPrecheckOperation, RcPrecheckPayload } from '@ecency/sdk';

interface RcPrecheck {
  /** All inputs were available, so the answer means something. */
  ready: boolean;
  /** The broadcast is likely to be rejected for insufficient RC. */
  willLikelyFail: boolean;
  /** RC the operation is estimated to cost. */
  cost: number;
  /** RC the account is short by, 0 when it is not short. */
  deficit: number;
}

const NOT_READY: RcPrecheck = { ready: false, willLikelyFail: false, cost: 0, deficit: 0 };

/**
 * Whether the account can afford to broadcast what it is about to broadcast.
 *
 * RC cost is dominated by serialized transaction size, so a long post can cost
 * many times an average comment. Without this the first anyone hears of a
 * shortfall is the chain rejecting a post they already finished writing, and
 * for a large enough post no amount of waiting helps: the cost can exceed the
 * account's maximum RC, not merely its current balance.
 *
 * Pass the payload that will actually be broadcast. Without one the estimator
 * prices a minimal operation of that type, which is a lower bound and so can
 * miss a marginal case, but never warns about one that would have succeeded.
 */
export const useRcPrecheck = (
  username: string | undefined,
  payload?: RcPrecheckPayload,
  operation: RcPrecheckOperation = 'comment_operation',
): RcPrecheck => {
  const { data: rcAccounts } = useQuery({
    ...getAccountRcQueryOptions(username!),
    enabled: !!username,
  });
  const { data: rcStats } = useQuery(getRcStatsQueryOptions());
  const { data: rcParams } = useQuery(getRcResourceParamsQueryOptions());

  if (!username) {
    return NOT_READY;
  }

  const { ready, willLikelyFail, cost, deficit } = estimateRcPrecheck({
    rcAccount: rcAccounts?.[0],
    rcStats,
    rcParams,
    operation,
    payload,
  });

  return { ready, willLikelyFail, cost, deficit };
};
