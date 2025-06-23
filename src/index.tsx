import React from 'react';
import { Provider, connect } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { IntlProvider } from 'react-intl';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Host } from 'react-native-portalize';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SheetProvider } from 'react-native-actions-sheet';
import { flattenMessages } from './utils/flattenMessages';
import messages from './config/locales';

import Application from './screens/application';
import { persistor, store } from './redux/store/store';
import { initQueryClient } from './providers/queries';
import './navigation/sheets';

const queryClientProviderProps = initQueryClient();

// sets up contexts
const _renderApp = ({ locale }) => (
  <PersistQueryClientProvider {...queryClientProviderProps}>
    <PersistGate loading={null} persistor={persistor}>
      <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <SheetProvider>
              <Host>
                <Application />
              </Host>
            </SheetProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
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
