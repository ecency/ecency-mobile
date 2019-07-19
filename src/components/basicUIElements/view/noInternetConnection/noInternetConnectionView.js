import React from 'react';
import { injectIntl } from 'react-intl';
import { Text, SafeAreaView, View } from 'react-native';

import { Icon } from '../../../icon';

import styles from './noInternetConnectionStyle';

const NoInternetConnection = ({ intl }) => (
  <SafeAreaView style={styles.grayBackground}>
    <View style={styles.container}>
      <Icon style={styles.icon} iconType="MaterialIcons" name="info" size={16} />
      <Text style={styles.text}>
        {intl.formatMessage({
          id: 'alert.no_internet',
        })}
      </Text>
    </View>
  </SafeAreaView>
);

export default injectIntl(NoInternetConnection);
