import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import styles from '../styles/assetIcon.styles';
import HIVE_ENGINE_ICON from '../../../../assets/hive_engine.png';
import HIVE_CHAIN_ICON from '../../../../assets/chain-icon.png';

interface AssetIconProps {
  iconUrl?: string;
  isEngine?: boolean;
  isChain?: boolean;
  iconSize?: number;
  containerStyle?: ViewStyle;
}

export const AssetIcon = ({
  iconUrl,
  isEngine,
  isChain,
  containerStyle,
  iconSize,
}: AssetIconProps) => {
  const _logoStyle = iconSize ? { ...styles.logo, width: iconSize, height: iconSize } : styles.logo;
  let _tintColor;

  const _iconSource = iconUrl && { uri: iconUrl };

  return (
    <View style={containerStyle}>
      <ExpoImage
        style={_logoStyle}
        tintColor={_tintColor}
        contentFit="contain"
        source={_iconSource}
      />
      {isEngine && (
        <View style={styles.hiveEngineWrapper}>
          <ExpoImage style={styles.hiveEngineLogo} contentFit="contain" source={HIVE_ENGINE_ICON} />
        </View>
      )}
      {isChain && (
        <View style={styles.hiveEngineWrapper}>
          <ExpoImage style={styles.hiveEngineLogo} contentFit="contain" source={HIVE_CHAIN_ICON} />
        </View>
      )}
    </View>
  );
};
