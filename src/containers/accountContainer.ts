import { connect } from 'react-redux';
import {
  selectCurrentAccount,
  selectIsLoggedIn,
  selectOtherAccounts,
  selectIsLoginDone,
} from '../redux/selectors';

const AccountContainer = ({
  accounts,
  children,
  currentAccount,
  isLoggedIn,
  isLoginDone,
  username,
}: any) => {
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

const mapStateToProps = (state: any) => ({
  accounts: selectOtherAccounts(state),
  currentAccount: selectCurrentAccount(state),
  isLoggedIn: selectIsLoggedIn(state),
  isLoginDone: selectIsLoginDone(state),
  username: selectCurrentAccount(state).name,
});

export default connect(mapStateToProps)(AccountContainer);
