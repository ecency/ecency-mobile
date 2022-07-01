import React, { useEffect, useState } from 'react';

import { OrientationLocker, PORTRAIT } from 'react-native-orientation-locker';
import { useDispatch } from 'react-redux';
import ApplicationContainer from './container/applicationContainer';
import WelcomeModal from './screen/welcomeModal';
import ApplicationScreen from './screen/applicationScreen';
import ErrorBoundary from './screen/errorBoundary';
import { setDeviceOrientation } from '../../redux/actions/uiAction';
import PinCodeModal from './screen/pinCodeModal';

const Application = () => {
  const dispatch = useDispatch();

  const [welcomeModalVisible, setWelcomeModalVisible] = useState(false);

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

            <WelcomeModal onModalVisibilityChange={setWelcomeModalVisible} />

            <PinCodeModal welcomeModalVisible={welcomeModalVisible} />
            
            

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
