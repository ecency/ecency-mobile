import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'intl';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import tr from 'react-intl/locale-data/tr';
import { ApplicationScreen } from '..';

addLocaleData([...en, ...tr]);
// symbol polyfills
global.Symbol = require('core-js/es6/symbol');
require('core-js/fn/symbol/iterator');

// collection fn polyfills
require('core-js/fn/map');
require('core-js/fn/set');
require('core-js/fn/array/find');

class ApplicationContainer extends Component {
  constructor() {
    super();
    this.state = {
      isRenderRequire: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { isDarkTheme, selectedLanguage } = this.props;

    if (isDarkTheme !== nextProps.isDarkTheme || selectedLanguage !== nextProps.selectedLanguage) {
      this.setState({ isRenderRequire: false }, () => this.setState({ isRenderRequire: true }));
    }
  }

  render() {
    const { selectedLanguage } = this.props;
    const { isRenderRequire } = this.state;

    const locale = (navigator.languages && navigator.languages[0])
      || navigator.language
      || navigator.userLanguage
      || selectedLanguage;

    if (isRenderRequire) {
      return <ApplicationScreen locale={locale} {...this.props} />;
    }
    return null;
  }
}

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
  selectedLanguage: state.application.language,
});

export default connect(mapStateToProps)(ApplicationContainer);
