import React, { Component, Fragment } from 'react';
import { StatusBar, Platform, View, Alert, Text, Modal, TouchableHighlight } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import { createAppContainer } from 'react-navigation';
import { injectIntl } from 'react-intl';
import VersionNumber from 'react-native-version-number';

import AppNavitation from '../../../navigation/routes';
import { setTopLevelNavigator, navigate } from '../../../navigation/service';

// Services
import {
  toastNotification as toastNotificationAction,
  setRcOffer,
} from '../../../redux/actions/uiAction';
import { getVersionForWelcomeModal } from '../../../realm/realm';

import ROUTES from '../../../constants/routeNames';

// Components
import { ToastNotification, NoInternetConnection, AccountsBottomSheet } from '../../../components';

// Themes (Styles)
import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';

const Navigation = createAppContainer(AppNavitation);

class ApplicationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowToastNotification: false,
      showWelcomeModal: false,
    };
  }

  componentDidMount() {
    const { appVersion } = VersionNumber;

    getVersionForWelcomeModal().then((version) => {
      if (version < parseFloat(appVersion)) {
        this.setState({ showWelcomeModal: true });
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { rcOffer, dispatch, intl } = this.props;
    const { rcOffer: rcOfferPrev } = prevProps;

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
                navigate({
                  routeName: ROUTES.SCREENS.ACCOUNT_BOOST,
                });
                dispatch(setRcOffer(true));
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

  render() {
    const { isConnected, isDarkTheme, toastNotification, isReady } = this.props;
    const { isShowToastNotification, showWelcomeModal } = this.state;
    const barStyle = isDarkTheme ? 'light-content' : 'dark-content';
    const barColor = isDarkTheme ? '#1e2835' : '#fff';

    return (
      <View pointerEvents={isReady ? 'auto' : 'none'} style={{ flex: 1 }}>
        {Platform.os === 'ios' ? (
          <StatusBar barStyle={barStyle} />
        ) : (
          <StatusBar barStyle={barStyle} backgroundColor={barColor} />
        )}
        <Fragment>
          {!isConnected && <NoInternetConnection />}
          <Navigation
            ref={(navigatorRef) => {
              setTopLevelNavigator(navigatorRef);
            }}
          />
          <Modal
            animationType="slide"
            visible={false}
            presentationStyle="pageSheet"
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>Hello World!</Text>
              <TouchableHighlight
                onPress={() => {
                  this.setState({ showWelcomeModal: !showWelcomeModal });
                }}
              >
                <Text>Hide Modal</Text>
              </TouchableHighlight>
            </View>
          </Modal>
        </Fragment>

        {isShowToastNotification && (
          <ToastNotification
            text={toastNotification}
            duration={3000}
            onHide={this._handleOnHideToastNotification}
          />
        )}
        <AccountsBottomSheet />
      </View>
    );
  }
}

export default injectIntl(connect()(ApplicationScreen));
