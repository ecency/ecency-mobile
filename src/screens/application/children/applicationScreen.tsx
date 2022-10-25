import React, { Component, Fragment } from 'react';
import { StatusBar, Platform, View, Alert } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';

import { injectIntl } from 'react-intl';

import RootNavigation from '../../../navigation/rootNavigation';
import { AppNavigator } from '../../../navigation';

// Services
import {
  toastNotification as toastNotificationAction,
  setRcOffer,
} from '../../../redux/actions/uiAction';

import ROUTES from '../../../constants/routeNames';

// Components
import {
  ToastNotification,
  NoInternetConnection,
  AccountsBottomSheet,
  ActionModal,
  ForegroundNotification,
  QuickProfileModal,
  QRModal,
  QuickReplyModal,
} from '../../../components';

// Themes (Styles)
import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';

class ApplicationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowToastNotification: false,
    };
  }

  componentDidUpdate(prevProps) {
    const { rcOffer, dispatch, intl } = this.props;
    const { rcOffer: rcOfferPrev } = prevProps;

    // TODO: display action modal instead
    if (!rcOfferPrev && rcOffer) {
      setTimeout(() => {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.fail',
          }),
          intl.formatMessage({
            id: 'alert.rc_down',
          }),
          [
            {
              text: 'Cancel',
              onPress: () => dispatch(setRcOffer(false)),
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: () => {
                RootNavigation.navigate({
                  name: ROUTES.SCREENS.ACCOUNT_BOOST,
                });
                dispatch(setRcOffer(false));
              },
            },
          ],
          { cancelable: false },
        );
      }, 300);
    }
  }

  _handleOnHideToastNotification = () => {
    const { dispatch } = this.props;
    dispatch(toastNotificationAction(''));
    this.setState({ isShowToastNotification: false });
  };

  UNSAFE_componentWillMount() {
    const { isDarkTheme } = this.props;
    EStyleSheet.build(isDarkTheme ? darkTheme : lightTheme);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { toastNotification } = this.props;
    if (nextProps.toastNotification && nextProps.toastNotification !== toastNotification) {
      this.setState({ isShowToastNotification: true });
    }
  }

  _renderStatusBar() {
    const { isDarkTheme } = this.props;
    const barStyle = isDarkTheme ? 'light-content' : 'dark-content';
    const barColor = isDarkTheme ? '#1e2835' : '#fff';
    return (
      <>
        {Platform.OS === 'ios' ? (
          <StatusBar barStyle={barStyle} />
        ) : (
          <StatusBar barStyle={barStyle} backgroundColor={barColor} />
        )}
      </>
    );
  }

  _renderAppNavigator() {
    const { isConnected } = this.props;
    return (
      <Fragment>
        {!isConnected && <NoInternetConnection />}

        <AppNavigator />
      </Fragment>
    );
  }

  _renderAppModals() {
    const { toastNotification, foregroundNotificationData } = this.props;
    const { isShowToastNotification } = this.state;

    return (
      <>
        <ForegroundNotification remoteMessage={foregroundNotificationData} />
        <QuickProfileModal />
        <AccountsBottomSheet />
        <ActionModal />
        <QuickReplyModal />
        <QRModal />
        {isShowToastNotification && (
          <ToastNotification
            text={toastNotification}
            duration={4000}
            onHide={this._handleOnHideToastNotification}
          />
        )}
      </>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this._renderStatusBar()}
        {this._renderAppNavigator()}
        {this._renderAppModals()}
      </View>
    );
  }
}

export default injectIntl(connect()(ApplicationScreen));
