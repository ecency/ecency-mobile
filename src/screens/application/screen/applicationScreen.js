import React, { Component, Fragment } from 'react';
import { IntlProvider } from 'react-intl';
import { StatusBar, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ReduxNavigation } from '../../../navigation/reduxNavigation';
import { flattenMessages } from '../../../utils/flattenMessages';
import messages from '../../../config/locales';

// Components
import { NoInternetConnection } from '../../../components/basicUIElements';
import { ErrorBoundary } from '../../../components/errorBoundary';
import { ToastNotificaiton } from '../../../components/toastNotification';

// Themes (Styles)
import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';

class ApplicationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowToastNotification: false,
    };
  }

  componentWillMount() {
    const { isDarkTheme } = this.props;
    EStyleSheet.build(isDarkTheme ? darkTheme : lightTheme);
  }

  componentWillReceiveProps(nextProps) {
    const { toastNotification } = this.props;
    if (nextProps.toastNotification !== toastNotification) {
      this.setState({ isShowToastNotification: true });
    } else {
      this.setState({ isShowToastNotification: false });
    }
  }

  render() {
    const {
      isConnected, isDarkTheme, locale, toastNotification,
    } = this.props;
    const { isShowToastNotification } = this.state;
    const barStyle = isDarkTheme ? 'light-content' : 'dark-content';
    const barColor = isDarkTheme ? '#1e2835' : '#fff';

    return (
      <Fragment>
        {Platform.os === 'ios' ? (
          <StatusBar barStyle={barStyle} />
        ) : (
          <StatusBar barStyle={barStyle} backgroundColor={barColor} />
        )}

        {!isConnected && (
          <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
            <NoInternetConnection />
          </IntlProvider>
        )}

        <IntlProvider locale={locale} messages={flattenMessages(messages[locale])}>
          <ErrorBoundary>
            <ReduxNavigation />
            {isShowToastNotification && <ToastNotificaiton text={toastNotification} />}
          </ErrorBoundary>
        </IntlProvider>
      </Fragment>
    );
  }
}

export default ApplicationScreen;
