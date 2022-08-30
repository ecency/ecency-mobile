import React, { useEffect, useRef } from 'react'
import { Alert, AppState, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../../hooks'
import { getExistUser } from '../../../realm/realm';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';
import { BasicHeader } from '../../../components';

import PinCodeContainer from '../container/pinCodeContainer';
import ROUTE from '../../../constants/routeNames';
import { navigate } from '../../../navigation/service';
import routeNames from '../../../constants/routeNames';


const PinCodeScreen = ({ route, navigation }) => {


  const dispatch = useAppDispatch();

  const pinCodeTimer = useRef<any>(null);
  const appState = useRef(AppState.currentState);

  const isPinCodeRequire = useAppSelector(state => state.application.isPinCodeRequire);
  const isPinCodeOpen = useAppSelector(state => state.application.isPinCodeOpen);


  useEffect(() => {
      AppState.addEventListener('change', _handleAppStateChange);
      return _unmount
  }, [])


  const _unmount = () => {
      AppState.removeEventListener('change', _handleAppStateChange);
  }


  const _handleAppStateChange = (nextAppState) => {
      getExistUser().then((isExistUser) => {
          if (isExistUser) {
              if (appState.current.match(/active|forground/) && nextAppState === 'inactive') {
                  _startPinCodeTimer();
              }

              if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                  if (isPinCodeOpen && pinCodeTimer.current) {
                      clearTimeout(pinCodeTimer.current);
                  }
              }
          }
      });

      appState.current = nextAppState;
  };



  const _startPinCodeTimer = () => {
      if (isPinCodeOpen) {
          pinCodeTimer.current = setTimeout(() => {
            navigate(routeNames.SCREENS.PINCODE)
          }, 5000);
      }
  };


  const hideCloseButton = route.params ?
    (route.params.hideCloseButton ?? false) :
    true;

  return (
    <PinCodeContainer
      hideCloseButton={hideCloseButton}
      pinCodeParams={route.params ?? { }}
    />
  )
}

export default PinCodeScreen