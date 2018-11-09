import React, { Component } from 'react';

// Services and Actions

// Middleware

// Constants

// Utilities
import parseToken from '../../../utils/parseToken';

// Component
import { WalletView } from '..';

/*
*            Props Name        Description                                     Value
*@props -->  props name here   description here                                Value Type Here
*
*/

class WalletContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  componentWillMount() {
    const { user } = this.props;
    console.log('user :', user);

    const walletData = {};

    walletData.rewardSteemBalance = parseToken(user.reward_steem_balance);
    walletData.rewardSbdBalance = parseToken(user.reward_sbd_balance);
    walletData.rewardVestingSteem = parseToken(user.reward_vesting_steem);
    walletData.hasUnclaimedRewards = (
      walletData.rewardSteemBalance > 0
      || walletData.rewardSbdBalance > 0
      || walletData.rewardVestingSteem > 0
    );
    walletData.balance = parseToken(user.balance);
    walletData.vestingShares = parseToken(user.vesting_shares);
    walletData.vestingSharesDelegated = parseToken(user.delegated_vesting_shares);
    walletData.vestingSharesReceived = parseToken(user.received_vesting_shares);
    walletData.vestingSharesTotal = (
      walletData.vestingShares
      - walletData.vestingSharesDelegated
      + walletData.vestingSharesReceived
    );

    walletData.sbdBalance = parseToken(user.sbd_balance);
    walletData.savingBalance = parseToken(user.savings_balance);
    walletData.savingBalanceSbd = parseToken(user.savings_sbd_balance);

    // walletData.estimatedValue = (
    //   (vestsToSp(walletData.vestingShares, steemPerMVests) * base)
    //   + (walletData.balance * base)
    //   + walletData.sbdBalance
    // ) * currencyRate;

    // walletData.showPowerDown = user.next_vesting_withdrawal !== '1969-12-31T23:59:59';
    // walletData.nextVestingWithdrawal = parseDate(user.next_vesting_withdrawal);
  }

  // Component Functions

  render() {
    // eslint-disable-next-line
    //const {} = this.props;

    return <WalletView {...this.props} />;
  }
}

export default WalletContainer;
