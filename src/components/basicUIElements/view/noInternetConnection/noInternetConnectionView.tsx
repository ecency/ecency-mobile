import React from 'react';
import { injectIntl } from 'react-intl';
import { Text, View } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../../icon';

import styles from './noInternetConnectionStyle';

const NoInternetConnection = ({ intl }) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{ ...styles.grayBackground, marginTop: -insets.bottom }}
      edges={['bottom']}
    >
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
};

export default injectIntl(NoInternetConnection);
