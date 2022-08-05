import React, { Component, Fragment } from 'react';
import { StatusBar, Platform, View, Alert, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';



import { injectIntl } from 'react-intl';

import {initAppNavigation} from '../../../navigation/navigation';
import { setTopLevelNavigator, navigate } from '../../../navigation/service';

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
import { NavigationContainer } from '@react-navigation/native';
import FeedScreen from '../../feed/screen/feedScreen';

import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();


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

    //TODO: display action modal instead
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



  render() {
    const { isConnected, isDarkTheme, toastNotification, foregroundNotificationData } = this.props;
    const { isShowToastNotification } = this.state;
    const barStyle = isDarkTheme ? 'light-content' : 'dark-content';
    const barColor = isDarkTheme ? '#1e2835' : '#fff';

    return (
      <View style={{ flex: 1 }}>

        {Platform.os === 'ios' ? (
          <StatusBar barStyle={barStyle} />
        ) : (
          <StatusBar barStyle={barStyle} backgroundColor={barColor} />
        )}


        <Fragment>
          {!isConnected && <NoInternetConnection />}

          {initAppNavigation()}
      
        </Fragment>



        <ForegroundNotification remoteMessage={foregroundNotificationData} />
        <QuickProfileModal navigation={{ navigate }} />
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

      </View>
    );
  }
}

export default injectIntl(connect()(ApplicationScreen));
