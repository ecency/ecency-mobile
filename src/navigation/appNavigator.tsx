import React, { useState } from 'react';
import VersionNumber from 'react-native-version-number';
import { NavigationContainer } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import { useAppSelector } from '../hooks';

// Screens
import { StackNavigator } from './stackNavigator';
import { navigationRef } from './rootNavigation';
import ROUTES from '../constants/routeNames';
import parseVersionNumber from '../utils/parseVersionNumber';

export const AppNavigator = () => {
  const lastAppVersion = useAppSelector((state) => state.application.lastAppVersion);

  const [appVersion] = useState(VersionNumber.appVersion);

  const _onReady = () => {
    RNBootSplash.hide({ fade: true });
  };

  const _initRoute =
    !lastAppVersion || parseVersionNumber(lastAppVersion) < parseVersionNumber(appVersion)
      ? ROUTES.SCREENS.WELCOME
      : ROUTES.SCREENS.FEED;

  return (
    <NavigationContainer ref={navigationRef} onReady={_onReady}>
      <StackNavigator initRoute={_initRoute} />
    </NavigationContainer>
  );
};
