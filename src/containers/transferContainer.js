import { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Services and Actions
import {
  lookupAccounts,
  transferToken,
  convert,
  transferFromSavings,
  transferToSavings,
  transferToVesting,
  getAccount,
  transferPoint,
  withdrawVesting,
  delegateVestingShares,
  setWithdrawVestingRoute,
} from '../providers/hive/dhive';
import { toastNotification } from '../redux/actions/uiAction';
import { getUserDataWithUsername } from '../realm/realm';
import { getPointsSummary } from '../providers/ecency/ePoint';

// Utils
import { countDecimals } from '../utils/number';
import bugsnagInstance from '../config/bugsnag';
import { fetchAndSetCoinsData } from '../redux/actions/walletActions';
import {
  delegateHiveEngine,
  stakeHiveEngine,
  transferHiveEngine,
  undelegateHiveEngine,
  unstakeHiveEngine,
} from '../providers/hive-engine/hiveEngineActions';
import { fetchTokenBalances } from '../providers/hive-engine/hiveEngine';
import TransferTypes from '../constants/transferTypes';
import { transferLarynx, transferSpk } from '../providers/hive-spk/hiveSpk';


/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class TransferContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fundType: props.route.params?.fundType ?? '',
      balance: props.route.params?.balance ?? '',
      tokenAddress: props.route.params?.tokenAddress ?? '',
      transferType: props.route.params?.transferType ?? '',
      referredUsername: props.route.params?.referredUsername,
      selectedAccount: props.currentAccount,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const {
      currentAccount: { name },
    } = this.props;

    this.fetchBalance(name);
  }

  // Component Functions

  _getUserPointsBalance = async (username) => {
    await getPointsSummary(username)
      .then((userPoints) => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        this.setState({ balance });
      })
      .catch((err) => {
        if (err) {
          alert(get(err, 'message') || err.toString());
        }
      });
  };

  fetchBalance = (username) => {
    const { fundType, transferType, tokenAddress } = this.state;

    getAccount(username).then(async (account) => {
      let balance;

      if (transferType.endsWith('_engine')) {
        const tokenBalances = await fetchTokenBalances(username);

        tokenBalances.forEach((tokenBalance) => {
          if (tokenBalance.symbol === fundType) {
            switch (transferType) {
              case TransferTypes.UNDELEGATE_ENGINE:
                balance = tokenBalance.delegationsOut;
                break;
              case TransferTypes.UNSTAKE_ENGINE:
                balance = tokenBalance.stake;
                break;
              default:
                balance = tokenBalance.balance;
                break;
            }
          }
          if (!balance) {
            balance = '0';
          }
        });

        console.log('retrieved balance', balance);
      } else {
        if (
          (transferType === 'purchase_estm' || transferType === 'transfer_token') &&
          fundType === 'HIVE'
        ) {
          balance = account.balance.replace(fundType, '');
        }
        if (
          (transferType === 'purchase_estm' ||
            transferType === 'convert' ||
            transferType === 'transfer_token') &&
          fundType === 'HBD'
        ) {
          balance = account.hbd_balance.replace(fundType, '');
        }
        if (transferType === 'points' && fundType === 'ESTM') {
          this._getUserPointsBalance(username);
        }
        if (transferType === 'transfer_to_savings' && fundType === 'HIVE') {
          balance = account.balance.replace(fundType, '');
        }
        if (transferType === 'transfer_to_savings' && fundType === 'HBD') {
          balance = account.hbd_balance.replace(fundType, '');
        }
        if (transferType === 'transfer_to_vesting' && fundType === 'HIVE') {
          balance = account.balance.replace(fundType, '');
        }
        if (transferType === 'address_view' && fundType === 'BTC') {
          // TODO implement transfer of custom tokens
          console.log(tokenAddress);
        }
      }

      const local = await getUserDataWithUsername(username);

      if (balance) {
        this.setState({ balance: Number(balance) });
      }

      this.setState({
        selectedAccount: { ...account, local: local[0] },
      });
    });
  };

  _getAccountsWithUsername = async (username) => {
    const validUsers = await lookupAccounts(username);
    return validUsers;
  };

  _delayedRefreshCoinsData = () => {
    const { dispatch } = this.props;
    setTimeout(() => {
      dispatch(fetchAndSetCoinsData(true));
    }, 3000);
  };

  _transferToAccount = async (from, destination, amount, memo) => {
    const { pinCode, navigation, dispatch, intl, route } = this.props;
    let { currentAccount } = this.props;
    const { selectedAccount } = this.state;

    const transferType = route.params?.transferType ?? '';
    const fundType = route.params?.fundType ?? '';
    let func;

    const data = {
      from,
      destination,
      amount,
      memo,
      fundType,
    };

    if (countDecimals(Number(data.amount)) < 3) {
      data.amount = Number(data.amount).toFixed(3);
    }

    data.amount = `${data.amount} ${fundType}`;
    switch (transferType) {
      case 'transfer_token':
        func = transferToken;
        break;
      case 'purchase_estm':
        func = transferToken;
        break;
      case 'convert':
        func = convert;
        data.requestId = new Date().getTime() >>> 0;
        break;
      case 'transfer_to_savings':
        func = transferToSavings;
        break;
      case 'transfer_to_vesting':
        func = transferToVesting;
        break;
      case 'withdraw_hive':
        func = transferFromSavings;
        data.requestId = new Date().getTime() >>> 0;
        break;
      case 'withdraw_hbd':
        func = transferFromSavings;
        data.requestId = new Date().getTime() >>> 0;
        break;
      case 'points':
        func = transferPoint;
        break;
      case 'power_down':
        data.amount = `${amount.toFixed(6)} VESTS`;
        func = withdrawVesting;
        currentAccount = selectedAccount;
        break;
      case 'delegate':
        func = delegateVestingShares;
        currentAccount = selectedAccount;
        data.amount = `${amount.toFixed(6)} VESTS`;
        break;
      case 'transfer_engine':
        func = transferHiveEngine;
        break;
      case 'stake_engine':
        func = stakeHiveEngine;
        break;
      case 'delegate_engine':
        func = delegateHiveEngine;
        break;
      case 'unstake_engine':
        func = unstakeHiveEngine;
        break;
      case 'undelegate_engine':
        func = undelegateHiveEngine;
        break;
      case TransferTypes.TRANSFER_SPK:
        func = transferSpk
      case TransferTypes.TRANSFER_LARYNX:
        func = transferLarynx
      default:
        break;
    }
    if (!currentAccount.local) {
      const realmData = await getUserDataWithUsername(currentAccount.name);
      currentAccount.local = realmData[0];
    }

    return func(currentAccount, pinCode, data)
      .then(() => {
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
        this._delayedRefreshCoinsData();
        navigation.goBack();
      })
      .catch((err) => {
        navigation.goBack();
        bugsnagInstance.notify(err);
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.key_warning' })));
      });
  };

  _setWithdrawVestingRoute = (from, to, percentage, autoVest) => {
    const { currentAccount, pinCode } = this.props;

    const data = {
      from,
      to,
      percentage,
      autoVest,
    };

    setWithdrawVestingRoute(currentAccount, pinCode, data).catch((err) => {
      alert(err.message || err.toString());
    });
  };

  _handleOnModalClose = () => {
    const { navigation } = this.props;
    this._delayedRefreshCoinsData();
    navigation.goBack();
  };

  render() {
    const {
      accounts,
      children,
      hivePerMVests,
      currentAccount,
      actionModalVisible,
      dispatch,
      route,
    } = this.props;
    const { balance, fundType, selectedAccount, tokenAddress, referredUsername } = this.state;

    const transferType = route.params?.transferType ?? '';

    return (
      children &&
      children({
        dispatch,
        accounts,
        balance,
        tokenAddress,
        fundType,
        transferType,
        selectedAccount,
        hivePerMVests,
        actionModalVisible,
        referredUsername,
        fetchBalance: this.fetchBalance,
        getAccountsWithUsername: this._getAccountsWithUsername,
        transferToAccount: this._transferToAccount,
        handleOnModalClose: this._handleOnModalClose,
        accountType: get(selectedAccount || currentAccount, 'local.authType'),
        currentAccountName: get(currentAccount, 'name'),
        setWithdrawVestingRoute: this._setWithdrawVestingRoute,
      })
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.account.otherAccounts,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  hivePerMVests: state.account.globalProps.hivePerMVests,
  actionModalVisible: state.ui.actionModalVisible,
});

export default connect(mapStateToProps)(injectIntl(TransferContainer));
