import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import { toastNotification } from '../../../redux/actions/uiAction';

// Dsteem
import { getAccount, claimRewardBalance } from '../../../providers/steem/dsteem';

// Utils
import { groomingWalletData } from '../../../utils/wallet';
import parseToken from '../../../utils/parseToken';

// Component
import WalletView from '../view/walletView';

/*
 *            Props Name               Description            Value
 * @props -->  currentAccountUsername   description here      Value Type Here
 @ props -->   selectedUsername
 @ props -->   walletData
 *
 */

class WalletContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletData: null,
      isClaiming: false,
      isRefreshing: false,
    };
  }

  componentDidMount() {
    const { selectedUser } = this.props;

    this._getWalletData(selectedUser);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedUser } = this.props;

    if (selectedUser.name !== nextProps.selectedUser.name) {
      this._getWalletData(nextProps.selectedUser);
    }
  }

  // Components functions

  _getWalletData = async (selectedUser) => {
    const { setEstimatedWalletValue, globalProps } = this.props;
    const walletData = await groomingWalletData(selectedUser, globalProps);

    this.setState({ walletData });
    setEstimatedWalletValue(walletData.estimatedValue);
  };

  _isHasUnclaimedRewards = account => parseToken(account.reward_steem_balance) > 0
    || parseToken(account.reward_sbd_balance) > 0
    || parseToken(account.reward_vesting_steem) > 0;

  _claimRewardBalance = async () => {
    const {
      currentAccount, intl, pinCode, dispatch,
    } = this.props;
    const { isClaiming } = this.state;
    let isHasUnclaimedRewards;

    if (isClaiming) {
      return;
    }

    await this.setState({ isClaiming: true });

    getAccount(currentAccount.name)
      .then((account) => {
        isHasUnclaimedRewards = this._isHasUnclaimedRewards(account[0]);
        if (isHasUnclaimedRewards) {
          const {
            reward_steem_balance: steemBal,
            reward_sbd_balance: sbdBal,
            reward_vesting_balance: vestingBal,
          } = account[0];
          return claimRewardBalance(currentAccount, pinCode, steemBal, sbdBal, vestingBal);
        }
        this.setState({ isClaiming: false });
      })
      .then(() => getAccount(currentAccount.name))
      .then((account) => {
        this._getWalletData(account && account[0]);
        if (isHasUnclaimedRewards) {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.claim_reward_balance_ok',
              }),
            ),
          );
        }
      })
      .then((account) => {
        this._getWalletData(account && account[0]);
        this.setState({ isClaiming: false });
      })
      .catch(() => {
        this.setState({ isClaiming: false });

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
      });
  };

  _handleOnWalletRefresh = () => {
    const { selectedUser, dispatch, intl } = this.props;
    this.setState({ isRefreshing: true });

    getAccount(selectedUser.name)
      .then((account) => {
        this._getWalletData(account && account[0]);
        this.setState({ isRefreshing: false });
      })
      .catch(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
        this.setState({ isRefreshing: false });
      });
  };

  render() {
    const {
      currentAccount, selectedUser, isDarkTheme, setPinCodeState,
    } = this.props;
    const { walletData, isClaiming, isRefreshing } = this.state;

    return (
      <WalletView
        currentAccountUsername={currentAccount.name}
        selectedUsername={selectedUser && selectedUser.name}
        walletData={walletData}
        claimRewardBalance={this._claimRewardBalance}
        isClaiming={isClaiming}
        handleOnWalletRefresh={this._handleOnWalletRefresh}
        isRefreshing={isRefreshing}
        isDarkTheme={isDarkTheme}
        setPinCodeState={setPinCodeState}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.account.pin,
  isDarkTheme: state.application.isDarkTheme,
  globalProps: state.account.globalProps,
});

export default injectIntl(connect(mapStateToProps)(WalletContainer));
