import React from 'react';
import { Dimensions } from 'react-native';
import { Provider } from 'react-redux';
import 'intl';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';

import EStyleSheet from 'react-native-extended-stylesheet';
import store from './redux/store/store';
import { ReduxNavigation } from './config/reduxNavigation';
import { flattenMessages } from './utils/flattenMessages';
import messages from './config/locales';

// STYLE

EStyleSheet.build({
  // Primary Colors
  $white: '#FFFFFF',
  $black: '#000000',
  $primaryBlue: '#357ce6',
  $primaryDarkBlue: '#1a509a',
  $primaryLightBlue: '#eaf2fc',
  $primaryGray: '#f5f5f5',
  $primaryDarkGray: '#788187',
  $primaryLightGray: '#f6f6f6',
  $primaryRed: '#e63535',
  $primaryBlack: '#3c4449',

  // General Colors
  $borderColor: '#c5c5c5',
  $bubblesBlue: '#5CCDFF',
  $iconColor: '#c1c5c7',
  $dangerColor: '#fff',
  $warningColor: '#fff',
  $successColor: '#fff',
  $disableButton: '#fff',
  $shadowColor: '#b0b0b0',
  $disableGray: '#fff',

  // Devices Sizes
  $deviceHeight: Dimensions.get('window').height,
  $deviceWidth: Dimensions.get('window').width,

  // Fonts Properties
  $primaryFont: 'Roboto',
  $primaryLatterSpacing: 0,
});

addLocaleData([...en, ...tr]);

const locale = (navigator.languages && navigator.languages[0])
  || navigator.language
  || navigator.userLanguage
  || 'en-US';

export default () => (

  <Provider store={store}>
    <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
      <ReduxNavigation />
    </IntlProvider>
  </Provider>
);

