import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';
import { ReduxNavigation } from './config/reduxNavigation';
import { flattenMessages } from './utils/flattenMessages';
import messages from './config/locales';
// themes
import darkTheme from './themes/darkTheme';
import lightTheme from './themes/lightTheme';

addLocaleData([...en, ...tr]);
// symbol polyfills
global.Symbol = require('core-js/es6/symbol');
require('core-js/fn/symbol/iterator');

// collection fn polyfills
require('core-js/fn/map');
require('core-js/fn/set');
require('core-js/fn/array/find');

class Application extends Component {
  constructor() {
    super();
    this.state = {
      shouldRender: true,
    };
  }

  componentDidMount() {
    const { isDarkTheme } = this.props;
    EStyleSheet.build(isDarkTheme ? darkTheme : lightTheme);
  }

  componentWillReceiveProps(nextProps) {
    const { isDarkTheme } = this.props;

    if (isDarkTheme !== nextProps.isDarkTheme) {
      const theme = nextProps.isDarkTheme ? darkTheme : lightTheme;
      EStyleSheet.build(theme);
      this.setState({ shouldRender: false }, () => this.setState({ shouldRender: true }));
    }
  }

  render() {
    const { children, shouldRender, selectedLanguage } = this.props;

    const locale = (navigator.languages && navigator.languages[0])
      || navigator.language
      || navigator.userLanguage
      || selectedLanguage;

    return (
      <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
        <ReduxNavigation />
      </IntlProvider>
    );
  }
}

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
  selectedLanguage: state.application.language,
});

export default connect(mapStateToProps)(Application);
