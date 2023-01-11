import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useIntl } from 'react-intl';
import styles from '../styles/manageAssets.styles';
import { Icon } from '../../../components';

export interface Props {
  onPress: () => void;
}

export const ManageAssetsBtn = ({ onPress }: Props) => {
  const intl = useIntl();

  return (
    <View>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.headerWrapper}>
          <Icon
            style={styles.rightIcon}
            iconType="MaterialCommunityIcons"
            size={16}
            name="pencil"
          />
          <Text style={styles.title}>{intl.formatMessage({ id: 'wallet.manage_assets' })}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
