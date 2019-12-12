import get from 'lodash/get';
import parseToken from './parseToken';
import { vestsToRshares } from './conversions';

export const getEstimatedAmount = (account, globalProps, value = 1) => {
  const { fundRecentClaims, fundRewardBalance, base, quote } = globalProps;
  const votingPower = account.voting_power;
  const totalVests =
    parseToken(get(account, 'vesting_shares')) +
    parseToken(get(account, 'received_vesting_shares')) -
    parseToken(get(account, 'delegated_vesting_shares'));
  const votePct = value * 10000;
  const rShares = vestsToRshares(totalVests, votingPower, votePct);

  return ((rShares / fundRecentClaims) * fundRewardBalance * (base / quote)).toFixed(5);
};
