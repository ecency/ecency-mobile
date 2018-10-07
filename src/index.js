import React from 'react';
import { Dimensions } from 'react-native';
import { Provider } from 'react-redux';

import EStyleSheet from 'react-native-extended-stylesheet';
import store from './redux/store/store';
import { ReduxNavigation } from './config/reduxNavigation';

// STYLE

EStyleSheet.build({
  // Primary Colors
  $white: '#FFFFFF',
  $black: '#000000',
  $primaryBlue: '#357ce6',
  $primaryLightBlue: '#eaf2fc',
  $primaryGray: '#788187',
  $primaryLightGray: '#f6f6f6',
  $primaryRed: '#e63535',
  $primaryBlack: '#3c4449',

  // General Colors
  $borderColor: '#ffff',
  $bubblesBlue: '#5CCDFF',
  $iconColor: '#c1c5c7',
  $dangerColor: '#fff',
  $warningColor: '#fff',
  $successColor: '#fff',
  $disableButton: '#fff',
  $shadowColor: '#fff',
  $disableGray: '#fff',

  // Devices Sizes
  $deviceHeight: Dimensions.get('window').height,
  $deviceWidth: Dimensions.get('window').width,

  // Fonts Properties
  $primaryFont: 'Roboto',
  $primaryLatterSpacing: 0,
});

export default () => (
  <Provider store={store}>
    <ReduxNavigation />
  </Provider>
);
