import React, { useEffect } from 'react'
import PinCodeContainer from '../container/pinCodeContainer';


const PinCodeScreen = ({ route, navigation }) => {

  const hideCloseButton = route.params ?
    (route.params.hideCloseButton ?? false) :
    true;

  useEffect(() => {
    navigation.addListener('beforeRemove', _handleBeforeRemove);
    return _unmount();
  }, [navigation])


  const _unmount = () => {
    navigation.removeListener('beforeRemove', _handleBeforeRemove)
  }

  const _handleBeforeRemove = (e) => {
    if (hideCloseButton) {
      e.preventDefault();
    }
  }

  return (

    <PinCodeContainer
      hideCloseButton={hideCloseButton}
      pinCodeParams={route.params ?? {}}
    />


  )
}

export default PinCodeScreen