import parseToken from './parseToken';
import { vestsToRshares } from './conversions';
import { GlobalProps } from '../redux/reducers/accountReducer';

export const getEstimatedAmount = (account, globalProps:GlobalProps, sliderValue:number = 1) => {

  const { fundRecentClaims, fundRewardBalance, base, quote } = globalProps;
  const votingPower:number = account.voting_power;
  const totalVests =
    parseToken(account.vesting_shares) +
    parseToken(account.received_vesting_shares) -
    parseToken(account.delegated_vesting_shares);
  const weight = sliderValue * 10000;
  const hbdMedian = base / quote;

  const rShares = vestsToRshares(totalVests, votingPower, weight);
  const estimatedAmount = rShares / fundRecentClaims * fundRewardBalance * hbdMedian;
  return Number.isNaN(estimatedAmount) ? '0.00000' : estimatedAmount.toFixed(5);

};
