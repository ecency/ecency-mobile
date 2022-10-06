import React, { useEffect } from 'react';

import Orientation, {
  useDeviceOrientationChange,
  useOrientationChange,
} from 'react-native-orientation-locker';
import { useDispatch } from 'react-redux';
import { useWindowDimensions } from 'react-native';
import ApplicationContainer from './container/applicationContainer';
import ApplicationScreen from './children/applicationScreen';
import ErrorBoundary from './children/errorBoundary';
import {
  setDeviceHeight,
  setDeviceOrientation,
  setDeviceWidth,
  setUiOrientation,
} from '../../redux/actions/uiAction';

const Application = () => {
  const dispatch = useDispatch();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  useEffect(() => {
    dispatch(setDeviceWidth(width));
    dispatch(setDeviceHeight(height));
  }, [width, height]);
  useOrientationChange((o) => {
    // Handle orientation change
    console.log('orientation changed : ', o);
    dispatch(setUiOrientation(o));
  });

  useDeviceOrientationChange((o) => {
    // Handle device orientation change
    console.log('device orientation changed at index : ', o);
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
