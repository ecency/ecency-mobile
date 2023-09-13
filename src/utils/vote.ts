import parseToken from './parseToken';
import { GlobalProps } from '../redux/reducers/accountReducer';
import { votingPower } from '../providers/hive/dhive';


export const getEstimatedAmount = (account, globalProps: GlobalProps, sliderValue: number = 1) => {
  const { fundRecentClaims, fundRewardBalance, base, quote } = globalProps;

  const hbdMedian = base / quote;
  const weight = sliderValue * 10000;

  const voteEffectiveShares = calculateEstimatedRShares(account, weight)
  const voteValue = (voteEffectiveShares / fundRecentClaims) * fundRewardBalance * hbdMedian;
  const estimatedAmount = weight < 0 ? Math.min(voteValue * -1, 0) : Math.max(voteValue, 0);

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


export const calculateEstimatedRShares = (account:any, weight: number = 10000) => {
 
  const _votingPower: number = votingPower(account) * 100;
  const vestingShares = parseToken(account.vesting_shares);
  const receievedVestingShares = parseToken(account.received_vesting_shares);
  const delegatedVestingShared = parseToken(account.delegated_vesting_shares);
  const totalVests = vestingShares + receievedVestingShares - delegatedVestingShared;

  return calculateVoteRshares(totalVests, _votingPower, weight);
}



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




export const calculateVoteReward = (voteRShares:number, post:any, totalRshares?:number) => {
  const totalPayout =
    post.total_payout ||
    parseFloat(post.pending_payout_value) +
    parseFloat(post.total_payout_value) +
    parseFloat(post.curator_payout_value);

  if(totalRshares === undefined){
    totalRshares = post.active_votes.reduce((accumulator:number, item:any) => accumulator + parseFloat(item.rshares), 0);
  }

  const ratio = totalPayout / totalRshares || 0;

  return (voteRShares * ratio).toFixed(3);
}