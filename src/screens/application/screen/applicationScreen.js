import React, { Component } from 'react';
import { IntlProvider } from 'react-intl';

import { ReduxNavigation } from '../../../config/reduxNavigation';
import { flattenMessages } from '../../../utils/flattenMessages';
import messages from '../../../config/locales';

class ApplicationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { locale } = this.props;

    return (
      <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
        <ReduxNavigation />
      </IntlProvider>
    );
  }
}

export default ApplicationScreen;
