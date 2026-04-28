import { votingPower, votingRshares, votingValue } from '@ecency/sdk';
import { GlobalProps } from '../redux/reducers/accountReducer';

export const getEstimatedAmount = (account, globalProps: GlobalProps, sliderValue = 1) => {
  const weight = sliderValue * 10000;
  const sign = weight < 0 ? -1 : 1;
  const estimatedAmount =
    votingValue(account, globalProps as any, votingPower(account) * 100, Math.abs(weight)) * sign;

  if (Number.isNaN(estimatedAmount)) {
    return '0.00';
  }

  const absAmount = Math.abs(estimatedAmount);
  const signPrefix = estimatedAmount < 0 ? '-' : '';

  if (absAmount >= 1) {
    return `${signPrefix}${absAmount.toFixed(2)}`;
  }

  const _fixed = parseFloat(absAmount.toFixed(4));
  const _precision = _fixed < 0.001 ? 1 : 2;
  return `${signPrefix}${_fixed.toPrecision(_precision)}`;
};

export const calculateEstimatedRShares = (
  account: any,
  globalProps: GlobalProps,
  weight = 10000,
) => {
  return votingRshares(account, globalProps as any, votingPower(account) * 100, Math.abs(weight));
};

export const calculateVoteReward = (voteRShares: number, post: any, totalRshares?: number) => {
  if (!voteRShares) {
    return 0;
  }

  const totalPayout =
    post.total_payout ||
    parseFloat(post.pending_payout_value) ||
    0 + parseFloat(post.total_payout_value) ||
    0 + parseFloat(post.curator_payout_value) ||
    0;

  if (totalRshares === undefined) {
    totalRshares = post.active_votes.length
      ? post.active_votes.reduce(
          (accumulator: number, item: any) => accumulator + parseFloat(item.rshares),
          0,
        )
      : voteRShares;
  }

  const ratio = totalRshares ? totalPayout / totalRshares : 0;

  return voteRShares * ratio;
};
