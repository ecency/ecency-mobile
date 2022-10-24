import { useEffect, useRef } from 'react';
import Orientation, { useDeviceOrientationChange } from 'react-native-orientation-locker';
import { isLandscape } from 'react-native-device-info';
import EStyleSheet from 'react-native-extended-stylesheet';
import { AppState, NativeEventSubscription } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setDeviceOrientation, setLockedOrientation } from '../../../redux/actions/uiAction';
import { orientations } from '../../../redux/constants/orientationsConstants';
import isAndroidTablet from '../../../utils/isAndroidTablet';
import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';
import { useUserActivityMutation } from '../../../providers/queries';

export const useInitApplication = () => {
  const dispatch = useAppDispatch();
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

  const appState = useRef(AppState.currentState);
  const appStateSubRef = useRef<NativeEventSubscription|null>(null);

  const userActivityMutation = useUserActivityMutation();

  useDeviceOrientationChange((o) => {
    // Handle device orientation change
    console.log('device orientation changed : ', o);
    dispatch(setDeviceOrientation(o));
  });

  useEffect(() => {
    appStateSubRef.current = AppState.addEventListener('change', _handleAppStateChange);

    // check for device landscape status and lcok orientation accordingly. Fix for orientation bug on android tablet devices
    isLandscape().then((isLandscape) => {
      if (isLandscape && isAndroidTablet()) {
        Orientation.lockToLandscape();
        dispatch(setLockedOrientation(orientations.LANDSCAPE));
      } else {
        Orientation.lockToPortrait();
        dispatch(setLockedOrientation(orientations.PORTRAIT));
      }
    });
    EStyleSheet.build(isDarkTheme ? darkTheme : lightTheme);

    userActivityMutation.lazyMutatePendingActivities();

    return _cleanup;
  }, []);

  const _cleanup = () => {
    if(appStateSubRef.current){
      appStateSubRef.current.remove();
    }
  };

  const _handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      userActivityMutation.lazyMutatePendingActivities();
    }

    appState.current = nextAppState;
  };
};
