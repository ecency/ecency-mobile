import React from 'react';
import { Text, View } from 'react-native';
import { injectIntl } from 'react-intl';

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
          <Icon iconType="MaterialIcons" name="error-outline" size={56} />
          <Text style={{ fontSize: 25 }}>
            {intl.formatMessage({
              id: 'alert.something_wrong',
            })}
          </Text>
          <Text style={{ fontSize: 15 }}>
            {intl.formatMessage({
              id: 'alert.something_wrong_alt',
            })}
          </Text>
        </View>
      );
    }

    return children;
  }
}

export default injectIntl(ErrorBoundary);
