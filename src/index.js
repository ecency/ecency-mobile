import React from 'react';
import 'react-native-gesture-handler';
import { Provider, connect } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { IntlProvider } from 'react-intl';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Host } from 'react-native-portalize';
import { QueryClientProvider } from '@tanstack/react-query';
import { flattenMessages } from './utils/flattenMessages';
import messages from './config/locales';

import Application from './screens/application';
import { store, persistor } from './redux/store/store';
import { initQueryClient } from './providers/queries';

const queryClient = initQueryClient();

const _renderApp = ({ locale }) => (
  <QueryClientProvider client={queryClient}>
    <PersistGate loading={null} persistor={persistor}>
      <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
        <SafeAreaProvider>
          <Host>
            <Application />
          </Host>
        </SafeAreaProvider>
      </IntlProvider>
    </PersistGate>
  </QueryClientProvider>
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
