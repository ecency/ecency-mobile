import React, { Component } from 'react';
import { IntlProvider } from 'react-intl';
import { StatusBar, Platform, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ReduxNavigation } from '../../../navigation/reduxNavigation';
import { flattenMessages } from '../../../utils/flattenMessages';
import messages from '../../../config/locales';

// Components
import { NoInternetConnection } from '../../../components/basicUIElements';
import { ToastNotification } from '../../../components/toastNotification';
import { toastNotification as toastNotificationAction } from '../../../redux/actions/uiAction';

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
    if (nextProps.toastNotification && nextProps.toastNotification !== toastNotification) {
      this.setState({ isShowToastNotification: true });
    }
  }

  _handleOnHideToastNotification = () => {
    const { dispatch } = this.props;
    dispatch(toastNotificationAction(''));
    this.setState({ isShowToastNotification: false });
  };

  render() {
    const { isConnected, isDarkTheme, locale, toastNotification, isReady } = this.props;
    const { isShowToastNotification } = this.state;
    const barStyle = isDarkTheme ? 'light-content' : 'dark-content';
    const barColor = isDarkTheme ? '#1e2835' : '#fff';

    return (
      <View pointerEvents={isReady ? 'auto' : 'none'} style={{ flex: 1 }}>
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
          <ReduxNavigation />
        </IntlProvider>

        {isShowToastNotification && (
          <ToastNotification
            text={toastNotification}
            duration={2000}
            onHide={this._handleOnHideToastNotification}
          />
        )}
      </View>
    );
  }
}

export default ApplicationScreen;
