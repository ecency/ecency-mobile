import parseToken from './parseToken';
import { GlobalProps } from '../redux/reducers/accountReducer';
import { votingPower } from '../providers/hive/dhive';

export const getEstimatedAmount = (account, globalProps: GlobalProps, sliderValue: number = 1) => {
  const { fundRecentClaims, fundRewardBalance, base, quote } = globalProps;
  const _votingPower: number = votingPower(account) * 100;
  const vestingShares = parseToken(account.vesting_shares);
  const receievedVestingShares = parseToken(account.received_vesting_shares);
  const delegatedVestingShared = parseToken(account.delegated_vesting_shares);
  const totalVests = vestingShares + receievedVestingShares - delegatedVestingShared;
  // const totalVests = parseToken(account.post_voting_power);

  const weight = sliderValue * 10000;
  const hbdMedian = base / quote;
  const voteEffectiveShares = calculateVoteRshares(totalVests, _votingPower, weight);
  const voteValue = (voteEffectiveShares / fundRecentClaims) * fundRewardBalance * hbdMedian;
  const estimatedAmount = (weight < 0 ? Math.min(voteValue * -1, 0) : Math.max(voteValue, 0)) * 200;

  if (isNaN(estimatedAmount)) {
    return '0.00';
  }
  else if (estimatedAmount >= 1) {
    return estimatedAmount.toFixed(2)
  } else {
    const _fixed = parseFloat(estimatedAmount.toFixed(4));
    const _precision = _fixed < 0.001 ? 1 : 2
    return _fixed.toPrecision(_precision);
  }

};

/*
 * Changes in HF25
 * Full 'rshares' always added to the post.
 * Curation rewards use 'weight' for posts/comments:
 *   0-24 hours -> weight = rshares_voted
 *   24 hours; 24+48=72 hours -> weight = rshares_voted /2
 *   72 hours; 3 days ->    rshares_voted / 8
 */
export const calculateVoteRshares = (userEffectiveVests: number, vp = 10000, weight = 10000) => {
  const userVestingShares = userEffectiveVests * 1e6;
  const userVotingPower = vp * (Math.abs(weight) / 10000);
  const voteRshares = userVestingShares * (userVotingPower / 10000) * 0.02;
  return voteRshares;
};
