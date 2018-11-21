import React, { Component } from 'react';
import { IntlProvider } from 'react-intl';

import EStyleSheet from 'react-native-extended-stylesheet';
import { ReduxNavigation } from '../../../config/reduxNavigation';
import { flattenMessages } from '../../../utils/flattenMessages';
import messages from '../../../config/locales';

// Themes (Styles)
import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';

class ApplicationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    const { isDarkTheme } = this.props;
    EStyleSheet.build(isDarkTheme ? darkTheme : lightTheme);
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
