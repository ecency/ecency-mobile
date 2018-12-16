import React, { Component, Fragment } from 'react';
import { AppState, Platform } from 'react-native';
import { connect } from 'react-redux';
import Push from 'appcenter-push';

// Actions & Services
import { openPinCodeModal } from '../../../redux/actions/applicationActions';
import { getExistUser } from '../../../realm/realm';

// Components
import { Modal } from '../../../components';
import { PinCode } from '../..';
import PostButtonForAndroid from '../../../components/postButton/view/postButtonsForAndroid';

// Constants
import ROUTES from '../../../constants/routeNames';

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

    componentDidMount() {
      AppState.addEventListener('change', this._handleAppStateChange);
      this._createPushListener();
    }

    componentWillUnmount() {
      AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
      const { appState } = this.state;

      getExistUser().then((isExistUser) => {
        if (isExistUser) {
          if (appState.match(/active|forground/) && nextAppState === 'inactive') {
            this._startPinCodeTimer();
          }

          if (appState.match(/inactive|background/) && nextAppState === 'active') {
            clearTimeout(this._pinCodeTimer);
          }
        }
      });

      this.setState({ appState: nextAppState });
    };

    _startPinCodeTimer = () => {
      const { dispatch } = this.props;
      this._pinCodeTimer = setTimeout(() => {
        dispatch(openPinCodeModal());
      }, 1 * 60 * 1000);
    };

    _setPinCodeState = (data) => {
      this.setState({ pinCodeStates: { ...data } });
    };

    _setWrappedComponentState = (data) => {
      this.setState({ wrappedComponentStates: { ...data } });
    };

    _createPushListener = () => {
      const { navigation } = this.props;
      Push.setListener({
        onPushNotificationReceived(pushNotification) {
          if (AppState.currentState === 'background') {
            if (pushNotification.customProperties.routeName) {
              navigation.navigate({
                routeName: pushNotification.customProperties.routeName,
              });
            } else {
              navigation.navigate({
                routeName: ROUTES.TABBAR.NOTIFICATION,
              });
            }
          }
        },
      });
    };

    render() {
      const { isPinCodeReqiure, navigation } = this.props;
      const { pinCodeStates, wrappedComponentStates } = this.state;
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
          {Platform.OS === 'android' && <PostButtonForAndroid />}
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
