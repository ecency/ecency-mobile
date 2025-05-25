import React from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import { WritePostButton } from '../../../components/atoms';
import styles from '../styles/children.styles';
import { SheetNames } from '../../../navigation/sheets';

export const WavesHeader = () => {
  const intl = useIntl();

  const _onPress = () => {
    SheetManager.show(SheetNames.QUICK_POST, {
      payload: { mode: 'wave' },
    });
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'post.ecency_waves' })}</Text>
      <WritePostButton placeholderId="quick_reply.placeholder_wave" onPress={_onPress} />
    </View>
  );
};

export default WavesHeader;
