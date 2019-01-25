import React from 'react';
import { injectIntl } from 'react-intl';
import { Text, SafeAreaView } from 'react-native';
import styles from './noInternetConnectionStyle';

const NoInternetConnection = props => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.text}>
      {props.intl.formatMessage({
        id: 'alert.no_internet',
      })}
    </Text>
  </SafeAreaView>
);

export default injectIntl(NoInternetConnection);
