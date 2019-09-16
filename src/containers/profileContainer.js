import { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';

import { default as ROUTES } from '../constants/routeNames';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    const isReverseHeader = get(props, 'navigation.state.username', false);

    this.state = {
      isReverseHeader,
    };
  }

  // Component Life Cycles

  componentDidMount = () => {
    const { navigation, isLoggedIn, currentAccount } = this.props;
    const selectedUser = get(navigation.state, 'params');

    if (!isLoggedIn && !selectedUser) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (get(selectedUser, 'username', false) && selectedUser.username !== currentAccount.name) {
      this._loadProfile(selectedUser.username);

      if (selectedUser.username) {
        const selectedQuickProfile = {
          reputation: selectedUser.reputation,
          name: selectedUser.username,
        };

        this.setState({ selectedQuickProfile });
      }

      this.setState({ isReverseHeader: true });
    } else {
      this._loadProfile(currentAccount.name);
    }
  };

  // Component Functions

  render() {
    const { isReverseHeader } = this.state;
    const { children } = this.props;

    return (
      children &&
      children({
        isReverseHeader,
      })
    );
  }
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(injectIntl(withNavigation(ProfileContainer)));
