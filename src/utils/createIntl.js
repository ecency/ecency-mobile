import { createIntl, createIntlCache } from 'react-intl';
import { flattenMessages } from './flattenMessages';
import messages from '../config/locales';

const _createIntl = () => {
  const store = require('../redux/store/store');

  const state = store.store.getState();
  const cache = createIntlCache();
  const locale = state.application.language;

  const intl = createIntl(
    {
      locale,
      messages: flattenMessages(messages[locale]),
    },
    cache,
  );
  return intl;
};

export default _createIntl;
