import { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Services and Actions
import {
  lookupAccounts,
  transferToken,
  transferFromSavings,
  transferToSavings,
  transferToVesting,
  getAccount,
  transferPoint,
  withdrawVesting,
  delegateVestingShares,
  setWithdrawVestingRoute,
} from '../providers/steem/dsteem';
import { toastNotification } from '../redux/actions/uiAction';
import { getUserDataWithUsername } from '../realm/realm';
import { getUser } from '../providers/esteem/ePoint';

// Utils
import { countDecimals } from '../utils/number';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class TransferContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fundType: props.navigation.getParam('fundType', ''),
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

  _getUserPointsBalance = async username => {
    await getUser(username)
      .then(userPoints => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        this.setState({ balance });
      })
      .catch(err => {
        if (err) alert(get(err, 'message') || err.toString());
      });
  };

  fetchBalance = username => {
    const { fundType } = this.state;

    getAccount(username).then(async account => {
      let balance;
      switch (fundType) {
        case 'STEEM':
          balance = account[0].balance.replace(fundType, '');
          break;
        case 'SBD':
          balance = account[0].sbd_balance.replace(fundType, '');
          break;
        case 'ESTM':
          this._getUserPointsBalance(username);
          break;
        case 'SAVING_STEEM':
          this.setState({ fundType: 'STEEM' });
          balance = account[0].savings_balance.replace(' STEEM', '');
          break;
        case 'SAVING_SBD':
          this.setState({ fundType: 'STEEM DOLLAR' });
          balance = account[0].savings_sbd_balance.replace(' SBD', '');
          break;
        case 'STEEM_POWER':
          balance = account[0].balance.replace(fundType, '');
          break;
        default:
          break;
      }

      const local = await getUserDataWithUsername(username);

      if (balance) {
        this.setState({ balance: Number(balance) });
      }

      this.setState({
        selectedAccount: { ...account[0], local: local[0] },
      });
    });
  };

  _getAccountsWithUsername = async username => {
    const validUsers = await lookupAccounts(username);
    return validUsers;
  };

  _transferToAccount = async (from, destination, amount, memo) => {
    const { pinCode, navigation, dispatch, intl } = this.props;
    let { currentAccount } = this.props;
    const { selectedAccount } = this.state;

    const transferType = navigation.getParam('transferType', '');
    const fundType = navigation.getParam('fundType', '');
    let func;

    const data = {
      from,
      destination,
      amount,
      memo,
    };

    if (countDecimals(Number(data.amount)) < 3) {
      data.amount = Number(data.amount).toFixed(3);
    }

    data.amount = `${data.amount} ${fundType}`;

    switch (transferType) {
      case 'transfer_token':
        func = transferToken;
        break;
      case 'transfer_to_saving':
        func = transferToSavings;
        break;
      case 'powerUp':
        func = transferToVesting;
        break;
      case 'withdraw_to_saving':
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
        navigation.goBack();
      })
      .catch(err => {
        navigation.goBack();
        dispatch(toastNotification(err.message));
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

    setWithdrawVestingRoute(currentAccount, pinCode, data).catch(err => {
      alert(err.message || err.toString());
    });
  };

  _handleOnModalClose = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    const { accounts, navigation, children, steemPerMVests, currentAccount } = this.props;
    const { balance, fundType, selectedAccount } = this.state;

    const transferType = navigation.getParam('transferType', '');

    return (
      children &&
      children({
        accounts,
        balance,
        fundType,
        transferType,
        selectedAccount,
        steemPerMVests,
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

const mapStateToProps = state => ({
  accounts: state.account.otherAccounts,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  steemPerMVests: state.account.globalProps.steemPerMVests,
});

export default connect(mapStateToProps)(injectIntl(TransferContainer));
