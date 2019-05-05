import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import {
  lookupAccounts,
  transferToken,
  transferFromSavings,
  transferToSavings,
  transferToVesting,
  getAccount,
} from '../../../providers/steem/dsteem';
import { toastNotification } from '../../../redux/actions/uiAction';

// Component
import TransferView from '../screen/transferScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class TransferContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { currentAccount: { name } } = this.props;

    this.fetchBalance(name);
  }

  // Component Functions

  fetchBalance = (username) => {
    const { navigation } = this.props;
    const fundType = navigation.getParam('fundType', '');

    getAccount(username)
      .then((account) => {
        let balance;
        switch (fundType) {
          case 'STEEM':
            balance = account[0].balance.replace(fundType, '');
            break;
          case 'SBD':
            balance = account[0].sbd_balance.replace(fundType, '');
            break;
          default:
            break;
        }

        this.setState({ balance: Number(balance) });
      });
  }

  _getAccountsWithUsername = async (username) => {
    const validUsers = await lookupAccounts(username);
    return validUsers;
  };

  _transferToAccount = (from, destination, amount, memo) => {
    const {
      currentAccount, pinCode, navigation, dispatch,
    } = this.props;

    const transferType = navigation.getParam('transferType', '');
    const fundType = navigation.getParam('fundType', '');
    let func;

    const data = {
      from,
      destination,
      amount,
      memo,
    };
    data.amount = `${data.amount} ${fundType}`;

    switch (transferType) {
      case 'transferToken':
        func = transferToken;
        break;
      case 'transferToSaving':
        func = transferToSavings;
        break;
      case 'powerUp':
        func = transferToVesting;
        break;
      case 'withdrawToSaving':
        func = transferFromSavings;
        data.requestId = new Date().getTime() >>> 0;
        break;

      default:
        break;
    }

    return func(currentAccount, pinCode, data)
      .then(() => {
        dispatch(toastNotification('Successfull'));
        navigation.goBack();
      })
      .catch((err) => {
        dispatch(toastNotification(err.message));
      });
  };

  _handleOnModalClose = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    const {
      accounts, currentAccount, navigation,
    } = this.props;
    const { balance } = this.state;

    const fundType = navigation.getParam('fundType', '');
    const transferType = navigation.getParam('transferType', '');

    return (
      <TransferView
        accounts={accounts}
        fetchBalance={this.fetchBalance}
        getAccountsWithUsername={this._getAccountsWithUsername}
        transferToAccount={this._transferToAccount}
        handleOnModalClose={this._handleOnModalClose}
        accountType={currentAccount.local.authType}
        currentAccountName={currentAccount.name}
        balance={balance}
        fundType={fundType}
        transferType={transferType}
      />
    );
  }
}

const mapStateToProps = state => ({
  accounts: state.account.otherAccounts,
  currentAccount: state.account.currentAccount,
  pinCode: state.account.pin,
});

export default connect(mapStateToProps)(TransferContainer);
