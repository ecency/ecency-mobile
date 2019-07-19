import React from 'react';

import ApplicationScreen from './screen/applicationScreen';
import ApplicationContainer from './container/applicationContainer';

import Launch from '../launch';

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
        <ApplicationScreen
          isConnected={isConnected}
          locale={locale}
          toastNotification={toastNotification}
          isReady={isReady}
          isDarkTheme={isDarkTheme}
          isPinCodeReqiure={isPinCodeReqiure}
        />
      );
    }}
  </ApplicationContainer>
);

export default Application;

export { ApplicationContainer, ApplicationScreen };
