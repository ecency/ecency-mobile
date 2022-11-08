import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import PinCodeContainer from '../container/pinCodeContainer';

const PinCodeScreen = ({ route, navigation }) => {
  const hideCloseButton = route.params ? route.params.hideCloseButton ?? false : true;

  useEffect(() => {
    const backEventSub = BackHandler.addEventListener('hardwareBackPress', _handleBackPress);

    return () => {
      if (backEventSub) {
        backEventSub.remove();
      }
    };
  }, [navigation]);

  const _handleBackPress = () => !!hideCloseButton;

  return <PinCodeContainer hideCloseButton={hideCloseButton} pinCodeParams={route.params ?? {}} />;
};

export default gestureHandlerRootHOC(PinCodeScreen);
