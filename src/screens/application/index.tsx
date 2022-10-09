import React from 'react';

import { useDeviceOrientationChange, useOrientationChange } from 'react-native-orientation-locker';
import { useDispatch } from 'react-redux';
import ApplicationContainer from './container/applicationContainer';
import ApplicationScreen from './children/applicationScreen';
import ErrorBoundary from './children/errorBoundary';
import { setDeviceOrientation } from '../../redux/actions/uiAction';

const Application = () => {
  const dispatch = useDispatch();

  useOrientationChange((o) => {
    // Handle orientation change
    console.log('UI orientation changed : ', o);
  });

  useDeviceOrientationChange((o) => {
    // Handle device orientation change
    console.log('device orientation changed : ', o);
    dispatch(setDeviceOrientation(o));
  });

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
