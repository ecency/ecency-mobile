import React from 'react';
import { View, ViewStyle } from 'react-native';
import FastImage from 'react-native-fast-image';
import styles from '../styles/assetIcon.styles';
import HIVE_ENGINE_ICON from '../../../../assets/hive_engine.png';
import { ASSET_IDS } from '../../../../constants/defaultCoins';

interface AssetIconProps {
  id:ASSET_IDS
  iconUrl: string;
  isEngine?: boolean;
  iconSize?: number;
  containerStyle?: ViewStyle;
}

export const AssetIcon = ({ iconUrl, isEngine, containerStyle, iconSize }: AssetIconProps) => {
  if (iconSize) {
  }

  const _logoStyle = iconSize
    ? { ...styles.logo, width: iconSize, height: iconSize, borderRadius: iconSize / 2 }
    : styles.logo;

  return (
    <View style={containerStyle}>
      <FastImage style={_logoStyle} resizeMode="cover" source={{ uri: iconUrl }} />
      {isEngine && (
        <View style={styles.hiveEngineWrapper}>
          <FastImage style={styles.hiveEngineLogo} resizeMode="contain" source={HIVE_ENGINE_ICON} />
        </View>
      )}
    </View>
  );
};
