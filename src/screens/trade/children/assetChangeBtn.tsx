import React from 'react';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../styles/assetChangeBtn.styles';
import { IconButton } from '../../../components';

interface Props {
  onPress: () => void;
}

// Reusable component for label, text input, and bottom text
export const AssetChangeBtn = ({ onPress }: Props) => {
  return (
    <View style={styles.changeBtnContainer} pointerEvents="box-none">
      <View style={styles.changeBtn}>
        <IconButton
          style={styles.changeBtnSize}
          color={EStyleSheet.value('$primaryBlue')}
          iconType="MaterialIcons"
          name="swap-vert"
          onPress={onPress}
          size={44}
        />
      </View>
    </View>
  );
};
