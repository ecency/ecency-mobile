import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import PinCodeContainer from '../container/pinCodeContainer';

const PinCodeScreen = ({ route, navigation }) => {
  const hideCloseButton = route.params ? route.params.hideCloseButton ?? false : true;

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', _handleBackPress);

    return _unmount;
  }, [navigation]);

  const _unmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', _handleBackPress);
  };

  const _handleBackPress = () => (hideCloseButton ? true : false);

  return <PinCodeContainer hideCloseButton={hideCloseButton} pinCodeParams={route.params ?? {}} />;
};

export default PinCodeScreen;
