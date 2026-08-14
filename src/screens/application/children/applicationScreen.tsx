import React, { Fragment, useEffect, useRef, useState } from 'react';
import { StatusBar, Platform, View } from 'react-native';

import { useIntl } from 'react-intl';

import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetManager } from 'react-native-actions-sheet';
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
  ForegroundNotification,
} from '../../../components/index';

// Themes (Styles)

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { SheetNames } from '../../../navigation/sheets';
import { ButtonTypes } from '../../../components/actionModal/container/actionModalContainer';
import { selectIsDarkTheme, selectIsConnected } from '../../../redux/selectors';
// import EStyleSheet from 'react-native-extended-stylesheet';

const ApplicationScreen = ({ foregroundNotificationData }: any) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const isConnected = useAppSelector(selectIsConnected);
  const toastNotification = useAppSelector((state) => state.ui.toastNotification);
  const rcOffer = useAppSelector((state) => state.ui.rcOffer);

  const rcOfferRef = useRef(rcOffer);
  const toastNotificationRef = useRef(toastNotification);

  const [isShowToastNotification, setIsShowToastNotification] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!rcOfferRef.current && rcOffer) {
      timer = setTimeout(async () => {
        // Two ways out of an empty RC bar, offered together because they solve
        // different problems: a top-up spends Points on a short delegation that
        // unblocks the action being attempted right now, while a boost raises
        // the account's own RC ceiling for good. Offering only the boost, as
        // this did, sent people to the slower and more expensive one.
        const action = await SheetManager.show(SheetNames.ACTION_MODAL, {
          payload: {
            title: intl.formatMessage({ id: 'alert.rc_down_title' }),
            body: intl.formatMessage({ id: 'alert.rc_down' }),
            buttons: [
              {
                text: intl.formatMessage({ id: 'alert.rc_down_topup' }),
                returnValue: 'topup',
              },
              {
                text: intl.formatMessage({ id: 'alert.rc_down_boost' }),
                returnValue: 'boost',
              },
              {
                text: intl.formatMessage({ id: 'alert.cancel' }),
                returnValue: 'cancel',
                style: 'cancel',
                type: ButtonTypes.CANCEL,
              },
            ],
          },
        });

        // Explicit values only. The sheet resolves undefined when it is
        // dismissed by gesture or backdrop, and treating that as a choice
        // would navigate someone who just swiped the sheet away.
        if (action === 'topup') {
          RootNavigation.navigate({
            name: ROUTES.SCREENS.REDEEM,
            params: { redeemType: 'rc_topup' },
          });
        } else if (action === 'boost') {
          RootNavigation.navigate({
            name: ROUTES.SCREENS.ACCOUNT_BOOST,
          });
        }
        dispatch(setRcOffer(false));
      }, 300);
    }

    rcOfferRef.current = rcOffer;
    return () => {
      if (timer) clearTimeout(timer);
    };
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
        <AppNavigator />
        {!isConnected && <NoInternetConnection />}
      </Fragment>
    );
  };

  const _renderNotifiers = () => {
    return (
      <>
        <ForegroundNotification remoteMessage={foregroundNotificationData} />
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
      {_renderNotifiers()}
    </View>
  );
};

export default ApplicationScreen;
