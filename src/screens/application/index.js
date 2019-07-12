import React from 'react';

import ApplicationScreen from './screen/applicationScreen';
import ApplicationContainer from './container/applicationContainer';

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
      if (!isRenderRequire || !isThemeReady) {
        return null;
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
