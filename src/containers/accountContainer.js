/* eslint-disable no-unused-vars */
import React from 'react';
import { connect } from 'react-redux';

const AccountContainer = ({
  accounts,
  children,
  currentAccount,
  isLoggedIn,
  isLoginDone,
  username,
}) => {
  return (
    children &&
    children({
      accounts,
      currentAccount,
      isLoggedIn,
      isLoginDone,
      username,
    })
  );
};

const mapStateToProps = (state) => ({
  accounts: state.account.otherAccounts,
  currentAccount: state.account.currentAccount,
  isLoggedIn: state.application.isLoggedIn,
  isLoginDone: state.application.isLoginDone,
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(AccountContainer);
/* eslint-enable */
