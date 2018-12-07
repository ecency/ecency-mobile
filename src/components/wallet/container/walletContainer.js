import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import { globalProps, getFeedHistory, getState } from '../../../providers/steem/dsteem';

// Middleware

// Constants

// Utilities
import parseToken from '../../../utils/parseToken';
import parseDate from '../../../utils/parseDate';
import { vestsToSp } from '../../../utils/conversions';

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
    this.state = {
      walletData: null,
    };
  }

  // Component Life Cycle Functions

  async componentWillMount() {
    const { user } = this.props;

    const walletData = {};

    // TODO: move them to utils these so big for a lifecycle function
    walletData.rewardSteemBalance = parseToken(user.reward_steem_balance);
    walletData.rewardSbdBalance = parseToken(user.reward_sbd_balance);
    walletData.rewardVestingSteem = parseToken(user.reward_vesting_steem);
    walletData.hasUnclaimedRewards = walletData.rewardSteemBalance > 0
      || walletData.rewardSbdBalance > 0
      || walletData.rewardVestingSteem > 0;
    walletData.balance = parseToken(user.balance);
    walletData.vestingShares = parseToken(user.vesting_shares);
    walletData.vestingSharesDelegated = parseToken(user.delegated_vesting_shares);
    walletData.vestingSharesReceived = parseToken(user.received_vesting_shares);
    walletData.vestingSharesTotal = walletData.vestingShares
      - walletData.vestingSharesDelegated
      + walletData.vestingSharesReceived;

    walletData.sbdBalance = parseToken(user.sbd_balance);
    walletData.savingBalance = parseToken(user.savings_balance);
    walletData.savingBalanceSbd = parseToken(user.savings_sbd_balance);

    const global = await globalProps();
    const feedHistory = await getFeedHistory();

    walletData.steemPerMVests = (parseToken(global.total_vesting_fund_steem) / parseToken(global.total_vesting_shares)) * 1e6;

    walletData.estimatedValue = vestsToSp(walletData.vestingShares, walletData.steemPerMVests)
        * parseToken(feedHistory.current_median_history.base)
      + walletData.balance * parseToken(feedHistory.current_median_history.base)
      + walletData.sbdBalance;

    walletData.showPowerDown = user.next_vesting_withdrawal !== '1969-12-31T23:59:59';
    const timeDiff = Math.abs(parseDate(user.next_vesting_withdrawal) - new Date());
    walletData.nextVestingWithdrawal = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const state = await getState(`/@${user.name}/transfers`);
    const { accounts } = state;
    const { transfer_history: transferHistory } = accounts[user.name];
    walletData.transactions = transferHistory
      .slice(Math.max(transferHistory.length - 20, 0))
      .reverse();

    this.setState({ walletData });
  }

  // Component Functions

  render() {
    const { walletData } = this.state;
    const { currentAccount, user } = this.props;

    return (
      <WalletView
        currentAccountUsername={currentAccount.username}
        selectedUsername={user.username}
        {...this.props}
        walletData={walletData}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(WalletContainer);
