import { connect } from 'react-redux';
import { selectCurrentAccount, selectIsLoggedIn } from '../redux/selectors';

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
  currentAccount: selectCurrentAccount(state),
  isLoggedIn: selectIsLoggedIn(state),
  isLoginDone: state.application.isLoginDone,
  username: selectCurrentAccount(state).name,
});

export default connect(mapStateToProps)(AccountContainer);
/* eslint-enable */
