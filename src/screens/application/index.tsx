import React from 'react';

import ApplicationContainer from './container/applicationContainer';
import ApplicationScreen from './children/applicationScreen';
import ErrorBoundary from './children/errorBoundary';
import { useInitApplication } from './hook/useInitApplication';

const Application = () => {
  // New hook to handle all custom app initializations
  // it will help clean index.tsx stay clean and completely discard ApplicationContainer moving forward
  useInitApplication();

  return (
    <ApplicationContainer>
      {({
        isConnected,
        isDarkTheme,
        isRenderRequire,
        locale,
        rcOffer,
        toastNotification,
        foregroundNotificationData,
      }) => {
        return (
          <ErrorBoundary>
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
