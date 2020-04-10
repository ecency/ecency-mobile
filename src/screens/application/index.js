import React, { Fragment, useEffect, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import ApplicationScreen from './screen/applicationScreen';
import ApplicationContainer from './container/applicationContainer';

import Launch from '../launch';
import { Modal } from '../../components';
import { PinCode } from '../pinCode';

const Application = () => {
  const [showAnimation, setShowAnimation] = useState(process.env.NODE_ENV !== 'development');

  useEffect(() => {
    SplashScreen.hide();
    if (showAnimation) {
      setTimeout(() => {
        setShowAnimation(false);
      }, 2833);
    }
  }, [showAnimation]);

  return (
    <ApplicationContainer>
      {({
        isConnected,
        isDarkTheme,
        isPinCodeRequire,
        isReady,
        isRenderRequire,
        isThemeReady,
        locale,
        rcOffer,
        toastNotification,
      }) => {
        return (
          <Fragment>
            <Modal
              isOpen={isPinCodeRequire}
              isFullScreen
              swipeToClose={false}
              backButtonClose={false}
            >
              <PinCode />
            </Modal>
            {isThemeReady && isRenderRequire && (
              <ApplicationScreen
                isConnected={isConnected}
                locale={locale}
                toastNotification={toastNotification}
                isReady={isReady}
                isDarkTheme={isDarkTheme}
                rcOffer={rcOffer}
              />
            )}
            {(showAnimation || !isReady || !isRenderRequire || !isThemeReady) && <Launch />}
          </Fragment>
        );
      }}
    </ApplicationContainer>
  );
};

export default Application;

export { ApplicationContainer, ApplicationScreen };
