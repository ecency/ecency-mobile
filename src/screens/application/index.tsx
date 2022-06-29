import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';

import { OrientationLocker, PORTRAIT } from 'react-native-orientation-locker';
import { useDispatch } from 'react-redux';
import ApplicationContainer from './container/applicationContainer';
import WelcomeScreen from './screen/welcomeScreen';
import ApplicationScreen from './screen/applicationScreen';
import { Modal } from '../../components';
import { PinCode } from '../pinCode';
import ErrorBoundary from './screen/errorBoundary';
import { setDeviceOrientation } from '../../redux/actions/uiAction';

const Application = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

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
        showWelcomeModal,
        handleWelcomeModalButtonPress,
        foregroundNotificationData,
      }) => {

        return (
          <ErrorBoundary>
            <OrientationLocker
              orientation={PORTRAIT}
              onChange={(orientation) => console.log('orientation changed : ', orientation)}
              onDeviceChange={_handleDeviceOrientationChange}
            />
            <Modal
              isOpen={showWelcomeModal}
              isFullScreen
              swipeToClose={false}
              backButtonClose={false}
              style={{ margin: 0 }}
            >
              <WelcomeScreen handleButtonPress={handleWelcomeModalButtonPress} />
            </Modal>

            <Modal
              isOpen={isPinCodeRequire && !showWelcomeModal}
              isFullScreen
              swipeToClose={false}
              backButtonClose={false}
              style={{ margin: 0 }}
            >
              <PinCode />
            </Modal>

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
