import React, { Fragment, useEffect, useState } from 'react';

import ApplicationScreen from './screen/applicationScreen';
import ApplicationContainer from './container/applicationContainer';

import Launch from '../launch';
import { Modal } from '../../components';
import { PinCode } from '../pinCode';

const Application = () => {
  const [showAnimation, setShowAnimation] = useState(process.env.NODE_ENV !== 'development');

  useEffect(() => {
    if (showAnimation) {
      setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
    }
  }, [showAnimation]);

  return (
    <ApplicationContainer>
      {({
        isConnected,
        locale,
        toastNotification,
        isReady,
        isDarkTheme,
        isRenderRequire,
        isThemeReady,
        isPinCodeRequire,
      }) => {
        if (showAnimation || !isReady || !isRenderRequire || !isThemeReady) {
          return <Launch />;
        }

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
            <ApplicationScreen
              isConnected={isConnected}
              locale={locale}
              toastNotification={toastNotification}
              isReady={isReady}
              isDarkTheme={isDarkTheme}
            />
          </Fragment>
        );
      }}
    </ApplicationContainer>
  );
};

export default Application;

export { ApplicationContainer, ApplicationScreen };
