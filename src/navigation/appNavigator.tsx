import React, { useEffect, useMemo, useState } from 'react';
import VersionNumber from 'react-native-version-number';
import { NavigationContainer } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import { Linking } from 'react-native';
import { useAppSelector, useLinkProcessor } from '../hooks';

// Screens
import { StackNavigator } from './stackNavigator';
import { navigationRef } from './rootNavigation';
import ROUTES from '../constants/routeNames';
import parseVersionNumber from '../utils/parseVersionNumber';

export const AppNavigator = () => {
  const lastAppVersion = useAppSelector((state) => state.application.lastAppVersion);
  const linkProcessor = useLinkProcessor();

  const [appVersion] = useState(VersionNumber.appVersion);
  const [isNavReady, setIsNavReady] = useState(false);

  const _isNewVersion = useMemo(
    () => !lastAppVersion || parseVersionNumber(lastAppVersion) < parseVersionNumber(appVersion),
    [lastAppVersion],
  );

  useEffect(() => {
    if (isNavReady && !_isNewVersion) {
      // read initial URL
      Linking.getInitialURL().then((url) => {
        if (url) {
          linkProcessor.handleLink(url);
        }
      });
    }
  }, [isNavReady, _isNewVersion]);

  const _onReady = () => {
    RNBootSplash.hide({ fade: true });
    setIsNavReady(true);
  };

  const _initRoute = _isNewVersion ? ROUTES.SCREENS.WELCOME : ROUTES.SCREENS.FEED;

  return (
    <NavigationContainer ref={navigationRef} onReady={_onReady}>
      <StackNavigator initRoute={_initRoute} />
    </NavigationContainer>
  );
};
