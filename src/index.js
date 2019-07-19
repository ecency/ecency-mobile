import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import Application from './screens/application';
import { store, persistor } from './redux/store/store';

export default () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Application />
    </PersistGate>
  </Provider>
);
