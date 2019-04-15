import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import { lookupAccounts } from '../../../providers/steem/dsteem';

// Middleware

// Constants

// Utilities

// Component
import TransferView from '../screen/transferScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class ExampleContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions
  _getAccountsWithUsername = async (username) => {
    const validUsers = await lookupAccounts(username);
    return validUsers;
  };

  _transferToAccount = (from, destination, amount, memo) => {
    console.log('from, destination, amount, memo, :', from, destination, amount, memo);
  };

  render() {
    const { accounts } = this.props;

    return (
      <TransferView
        accounts={accounts}
        getAccountsWithUsername={this._getAccountsWithUsername}
        transferToAccount={this._transferToAccount}
      />
    );
  }
}

const mapStateToProps = state => ({
  accounts: state.account.otherAccounts,
});

export default connect(mapStateToProps)(ExampleContainer);
