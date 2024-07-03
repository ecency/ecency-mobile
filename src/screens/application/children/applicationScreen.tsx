import React, { Fragment, useEffect, useRef, useState } from 'react';
import { StatusBar, Platform, View } from 'react-native';

import { useIntl } from 'react-intl';

import EStyleSheet from 'react-native-extended-stylesheet';
import RootNavigation from '../../../navigation/rootNavigation';
import { AppNavigator } from '../../../navigation';

// Services
import {
  toastNotification as toastNotificationAction,
  setRcOffer,
  showActionModal,
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
  WebViewModal,
  PostTranslationModal,
} from '../../../components/index';

// Themes (Styles)

import { useAppDispatch, useAppSelector } from '../../../hooks';
// import EStyleSheet from 'react-native-extended-stylesheet';

const ApplicationScreen = ({ foregroundNotificationData }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const isConnected = useAppSelector((state) => state.application.isConnected);
  const toastNotification = useAppSelector((state) => state.ui.toastNotification);
  const rcOffer = useAppSelector((state) => state.ui.rcOffer);

  const rcOfferRef = useRef(rcOffer);
  const toastNotificationRef = useRef(toastNotification);

  const [isShowToastNotification, setIsShowToastNotification] = useState(false);

  useEffect(() => {
    if (!rcOfferRef.current && rcOffer) {
      setTimeout(() => {
        dispatch(
          showActionModal({
            title: intl.formatMessage({
              id: 'alert.fail',
            }),
            body: intl.formatMessage({
              id: 'alert.rc_down',
            }),
            buttons: [
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
          }),
        );
      }, 300);
    }

    rcOfferRef.current = rcOffer;
  }, [rcOffer]);

  useEffect(() => {
    if (toastNotification && toastNotification !== toastNotificationRef.current) {
      setIsShowToastNotification(true);
    }
    toastNotificationRef.current = toastNotification;
  }, [toastNotification]);

  const _handleOnHideToastNotification = () => {
    dispatch(toastNotificationAction(''));
    setIsShowToastNotification(false);
  };

  const _renderStatusBar = () => {
    const barStyle = isDarkTheme ? 'light-content' : 'dark-content';
    return (
      <>
        {Platform.OS === 'ios' ? (
          <StatusBar barStyle={barStyle} />
        ) : (
          <StatusBar
            barStyle={barStyle}
            backgroundColor={EStyleSheet.value('$primaryBackgroundColor')}
          />
        )}
      </>
    );
  };

  const _renderAppNavigator = () => {
    return (
      <Fragment>
        {!isConnected && <NoInternetConnection />}

        <AppNavigator />
      </Fragment>
    );
  };

  const _renderAppModals = () => {
    return (
      <>
        <ForegroundNotification remoteMessage={foregroundNotificationData} />
        <QuickProfileModal />
        <AccountsBottomSheet />
        <ActionModal />
        <QuickReplyModal />
        <QRModal />
        <WebViewModal />
        <PostTranslationModal />
        {isShowToastNotification && (
          <ToastNotification
            text={toastNotification}
            duration={4000}
            onHide={_handleOnHideToastNotification}
          />
        )}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {_renderStatusBar()}
      {_renderAppNavigator()}
      {_renderAppModals()}
    </View>
  );
};

export default ApplicationScreen;
