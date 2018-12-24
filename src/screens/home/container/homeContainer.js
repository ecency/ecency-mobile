import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Component
import HomeScreen from '../screen/homeScreen';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class HomeContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isScrollToTop: false,
    };
  }

  // Component Life Cycle Functions
  componentWillReceiveProps(nextProps) {
    const { activeBottomTab } = this.props;
    if (
      activeBottomTab === nextProps.activeBottomTab
      && nextProps.activeBottomTab === ROUTES.TABBAR.HOME
    ) {
      this.setState({ isScrollToTop: true }, () => this.setState({ isScrollToTop: false }));
    }
  }

  // Component Functions

  render() {
    const { isLoggedIn, isLoginDone, currentAccount } = this.props;
    const { isScrollToTop } = this.state;

    return (
      <HomeScreen
        isLoggedIn={isLoggedIn}
        isLoginDone={isLoginDone}
        currentAccount={currentAccount}
        isScrollToTop={isScrollToTop}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  isLoginDone: state.application.isLoginDone,
  nav: state.nav,

  currentAccount: state.account.currentAccount,
  activeBottomTab: state.ui.activeBottomTab,
});

export default connect(mapStateToProps)(HomeContainer);
