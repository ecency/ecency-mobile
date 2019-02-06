import React, { Component, Fragment } from 'react';
import Text from 'react-native';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    if (__DEV__) {
      return;
    }
    this.setState({ hasError: true, info, error });
  }

  render() {
    const { hasError, info, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Fragment>
          <Text>Something went wrong.</Text>
          <Text>{error}</Text>
          <Text>{info}</Text>
        </Fragment>
      );
    }
    return children;
  }
}
