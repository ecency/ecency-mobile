import React, { useState } from 'react';

import { OrientationLocker, PORTRAIT } from 'react-native-orientation-locker';
import { useDispatch } from 'react-redux';
import ApplicationContainer from './container/applicationContainer';
import ApplicationScreen from './children/applicationScreen';
import ErrorBoundary from './children/errorBoundary';
import { setDeviceOrientation } from '../../redux/actions/uiAction';
import PinCodeModal from './children/pinCodeModal';

const Application = () => {
  const dispatch = useDispatch();

  const _handleDeviceOrientationChange = (orientation) => {
    console.log('device orientation changed at index : ', orientation);
    dispatch(setDeviceOrientation(orientation));
  };

  return (
    <ApplicationContainer>
      {({
        isConnected,
        isDarkTheme,
        isPinCodeRequire,
        isRenderRequire,
        locale,
        rcOffer,
        toastNotification,
        foregroundNotificationData,
      }) => {

        return (
          <ErrorBoundary>
            <OrientationLocker
              orientation={PORTRAIT}
              onChange={(orientation) => console.log('orientation changed : ', orientation)}
              onDeviceChange={_handleDeviceOrientationChange}
            />

            <PinCodeModal />
            

            {isRenderRequire && (
              <ApplicationScreen
                isConnected={isConnected}
                locale={locale}
                toastNotification={toastNotification}
                isDarkTheme={isDarkTheme}
                rcOffer={rcOffer}
                foregroundNotificationData={foregroundNotificationData}
              />
            )}
          </ErrorBoundary>
        );
      }}
    </ApplicationContainer>
  );
};

export default Application;

export { ApplicationContainer, ApplicationScreen };
