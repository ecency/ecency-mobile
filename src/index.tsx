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
import { selectLanguage } from './redux/selectors';
import './navigation/sheets';

const queryClientProviderProps = initQueryClient();

// sets up contexts
const AnyIntlProvider = IntlProvider as any;

const _renderApp = ({ locale }: { locale: string }) => (
  <PersistQueryClientProvider {...queryClientProviderProps}>
    <PersistGate loading={null} persistor={persistor}>
      {/* react-intl's props type rejects the merged any-record; runtime accepts it */}
      <AnyIntlProvider
        locale={locale}
        // en-US underlay: keys not yet translated for the active locale render
        // in English instead of as raw message ids (flat merge, so partially
        // translated namespaces keep their translated keys)
        messages={
          { ...flattenMessages(messages['en-US']), ...flattenMessages(messages[locale]) } as any
        }
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <SheetProvider>
              <Host>
                <Application />
              </Host>
            </SheetProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </AnyIntlProvider>
    </PersistGate>
  </PersistQueryClientProvider>
);

const mapStateToProps = (state: any) => ({
  locale: selectLanguage(state),
});

const App = connect(mapStateToProps)(_renderApp);

export default () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};
