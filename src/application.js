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

// EStyleSheet.build(lightTheme);

// initially use light theme

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

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   return this.props.isDarkTheme !== nextProps.isDarkTheme;
  // }

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
    // if (!shouldRender) {
    //   return null;
    // }
    // const locale = 'en-US';

    return (
      <IntlProvider
        locale={selectedLanguage}
        messages={flattenMessages(messages[selectedLanguage])}
      >
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
