import React, { Component, Fragment } from 'react';
import { AppState, AsyncStorage } from 'react-native';
import { connect } from 'react-redux';

// Actions
import { openPinCodeModal } from '../../../redux/actions/applicationActions';

// Components
import { Modal, Search } from '../../../components';
import { PinCode } from '../..';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
import { default as INITIAL } from '../../../constants/initial';

const RootContainer = () => (WrappedComponent) => {
  class RootComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        pinCodeStates: null,
        wrappedComponentStates: null,
        appState: AppState.currentState,
      };
    }

    componentWillMount() {
      const { isActiveApp, navigation } = this.props;
      if (!isActiveApp) {
        navigation.navigate(ROUTES.SCREENS.SPLASH);
      }
    }

    componentDidMount() {
      AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
      AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
      const { appState } = this.state;
      const { dispatch } = this.props;

      AsyncStorage.getItem(INITIAL.IS_EXIST_USER, (err, result) => {
        if (
          JSON.parse(result)
          && appState.match(/inactive|background/)
          && nextAppState === 'active'
          && __DEV__ === false
        ) {
          dispatch(openPinCodeModal());
        }
      });

      this.setState({ appState: nextAppState });
    };

    _setPinCodeState = (data) => {
      this.setState({ pinCodeStates: { ...data } });
    };

    _setWrappedComponentState = (data) => {
      this.setState({ wrappedComponentStates: { ...data } });
    };

    render() {
      const { isPinCodeReqiure, navigation } = this.props;
      const { pinCodeStates, wrappedComponentStates } = this.state;
      console.log('==========test=========');
      return (
        <Fragment>
          <Modal
            isOpen={isPinCodeReqiure}
            isFullScreen
            swipeToClose={false}
            backButtonClose={false}
          >
            <PinCode
              {...pinCodeStates}
              setWrappedComponentState={this._setWrappedComponentState}
              navigation={navigation}
            />
          </Modal>

          <WrappedComponent
            {...this.props}
            {...wrappedComponentStates}
            setPinCodeState={this._setPinCodeState}
          />
          <Search />
        </Fragment>
      );
    }
  }
  const mapStateToProps = state => ({
    isPinCodeReqiure: state.application.isPinCodeReqiure,
    isActiveApp: state.application.isActive,
  });

  return connect(mapStateToProps)(RootComponent);
};

export default RootContainer;
