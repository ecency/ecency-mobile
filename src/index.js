import React from 'react';
import { Provider, connect } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { IntlProvider, addLocaleData } from 'react-intl';

import en from 'react-intl/locale-data/en';
import id from 'react-intl/locale-data/id';
import ru from 'react-intl/locale-data/ru';
import de from 'react-intl/locale-data/de';
import it from 'react-intl/locale-data/it';
import hu from 'react-intl/locale-data/hu';
import tr from 'react-intl/locale-data/tr';
import ko from 'react-intl/locale-data/ko';
import lt from 'react-intl/locale-data/lt';
import pt from 'react-intl/locale-data/pt';
import fa from 'react-intl/locale-data/fa';

import { flattenMessages } from './utils/flattenMessages';
import messages from './config/locales';

import Application from './screens/application';
import { store, persistor } from './redux/store/store';

addLocaleData([...en, ...ru, ...de, ...id, ...it, ...hu, ...tr, ...ko, ...pt, ...lt, ...fa]);

const _renderApp = ({ locale }) => (
  <PersistGate loading={null} persistor={persistor}>
    <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
      <Application />
    </IntlProvider>
  </PersistGate>
);

const mapStateToProps = state => ({
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
