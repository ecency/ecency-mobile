import React, { Fragment } from 'react';
import { Text, View, TouchableHighlight } from 'react-native';
import { injectIntl } from 'react-intl';
import RNRestart from 'react-native-restart';

import { Icon } from '../../../components';

import bugsnag from '../../../config/bugsnag';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    bugsnag.notify(error, (report) => {
      report.metadata = {
        errorBoundary: true,
        errorInfo,
      };
    });
  }

  render() {
    const { children, intl } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Icon iconType="MaterialIcons" name="error-outline" size={45} />
          <Text style={{ fontSize: 20 }}>
            {intl.formatMessage({
              id: 'alert.something_wrong',
            })}
          </Text>
          <Text style={{ fontSize: 15 }}>
            {intl.formatMessage({
              id: 'alert.something_wrong_alt',
            })}
          </Text>
          <TouchableHighlight onPress={() => RNRestart.Restart()}>
            <Fragment>
              <Text style={{ fontSize: 30, textDecorationLine: 'underline', paddingTop: 20 }}>
                {intl.formatMessage({
                  id: 'alert.something_wrong_reload',
                })}
              </Text>
            </Fragment>
          </TouchableHighlight>
        </View>
      );
    }

    return children;
  }
}

export default injectIntl(ErrorBoundary);
