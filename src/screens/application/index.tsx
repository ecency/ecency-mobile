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
      {({ isRenderRequire, foregroundNotificationData }) => {
        return (
          <ErrorBoundary>
            {isRenderRequire && (
              <ApplicationScreen foregroundNotificationData={foregroundNotificationData} />
            )}
          </ErrorBoundary>
        );
      }}
    </ApplicationContainer>
  );
};

export default Application;

export { ApplicationContainer, ApplicationScreen };
