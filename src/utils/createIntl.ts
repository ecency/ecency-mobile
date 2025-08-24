import { createIntl as baseCreateIntl, createIntlCache, IntlShape } from 'react-intl';
import { flattenMessages } from './flattenMessages';
import messages from '../config/locales';
import type { RootState } from '../redux/store/store';

const _createIntl = (): IntlShape => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const store = require('../redux/store/store');

  const state: RootState = store.store.getState();
  const cache = createIntlCache();
  const locale = state.application.language;

  const intl = baseCreateIntl(
    {
      locale,
      messages: flattenMessages(messages[locale]),
    },
    cache,
  );
  return intl;
};

export default _createIntl;
