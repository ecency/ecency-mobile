import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import 'react-native-gesture-handler';
import { Provider, connect } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { IntlProvider } from 'react-intl';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Host } from 'react-native-portalize';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { flattenMessages } from './utils/flattenMessages';
import messages from './config/locales';

import Application from './screens/application';
import { persistor, store } from './redux/store/store';
import { initQueryClient } from './providers/queries';
import { Icon } from './components';

const queryClientProviderProps = initQueryClient();

const Dummy = () => {

  return (
    <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'yellow',
    }}
  >
    <Icon iconType="MaterialIcons" name="info" size={28} color='blue'/>
    {/* <NoInternetConnection/> */}
    <Text style={{ color: 'green' }}>App is Working!</Text>
  </View>
  )
}

const _renderApp = ({ locale }) => (
  <PersistQueryClientProvider {...queryClientProviderProps}>
    <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
    <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
      <SafeAreaProvider>
        <Host>
          {/* <Application /> */}
          <Dummy/>
        </Host>
      </SafeAreaProvider>
    </IntlProvider>
    </PersistGate>
  </PersistQueryClientProvider>
);

const mapStateToProps = (state) => ({
  locale: state.application.language,
});

const App = connect(mapStateToProps)(_renderApp);

export default () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};
