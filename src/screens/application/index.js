import React, { Fragment } from 'react';

import ApplicationScreen from './screen/applicationScreen';
import ApplicationContainer from './container/applicationContainer';

import Launch from '../launch';
import { Modal } from '../../components';
import { PinCode } from '../pinCode';

const Application = () => (
  <ApplicationContainer>
    {({
      isConnected,
      locale,
      toastNotification,
      isReady,
      isDarkTheme,
      isRenderRequire,
      isThemeReady,
      isPinCodeReqiure,
    }) => {
      if (!isReady || !isRenderRequire || !isThemeReady) {
        return <Launch />;
      }
      return (
        <Fragment>
          <Modal
            isOpen={isPinCodeReqiure}
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

export default Application;

export { ApplicationContainer, ApplicationScreen };
