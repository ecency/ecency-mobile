import React from 'react';
import { View, ViewStyle } from 'react-native';
import FastImage from 'react-native-fast-image';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../styles/assetIcon.styles';
import HIVE_ENGINE_ICON from '../../../../assets/hive_engine.png';
import HIVE_SPK_ICON from '../../../../assets/hive_spk.png';
import HBD_ICON from '../../../../assets/hbd_icon.png';
import HIVE_ICON from '../../../../assets/hive_icon.png';
import ECENCY_ICON from '../../../../assets/ecency-logo.png';
import { ASSET_IDS } from '../../../../constants/defaultAssets';

interface AssetIconProps {
  id: string;
  iconUrl?: string;
  isEngine?: boolean;
  isSpk?: boolean;
  iconSize?: number;
  containerStyle?: ViewStyle;
}

export const AssetIcon = ({
  id,
  iconUrl,
  isEngine,
  isSpk,
  containerStyle,
  iconSize,
}: AssetIconProps) => {
  const _logoStyle = iconSize ? { ...styles.logo, width: iconSize, height: iconSize } : styles.logo;
  let _tintColor;

  let _iconSource = iconUrl && { uri: iconUrl };
  if (!_iconSource) {
    switch (id) {
      case ASSET_IDS.HBD:
        _iconSource = HBD_ICON;
        break;
      case ASSET_IDS.HIVE:
      case ASSET_IDS.HP:
        _iconSource = HIVE_ICON;
        break;
      case ASSET_IDS.ECENCY:
        _iconSource = ECENCY_ICON;
        break;
      case ASSET_IDS.SPK:
        _iconSource = HIVE_SPK_ICON;
        _tintColor = EStyleSheet.value('$primaryBlue');
        break;
      case ASSET_IDS.LARYNX:
      case ASSET_IDS.LARYNX_POWER:
        _iconSource = HIVE_SPK_ICON;
        _tintColor = EStyleSheet.value('$darkGrayBackground');
        break;
      default:
        _iconSource = ECENCY_ICON;
        _tintColor = EStyleSheet.value('$darkGrayBackground');
        break;
    }
  }

  return (
    <View style={containerStyle}>
      <FastImage
        style={_logoStyle}
        tintColor={_tintColor}
        resizeMode="contain"
        source={_iconSource}
      />
      {isEngine && (
        <View style={styles.hiveEngineWrapper}>
          <FastImage style={styles.hiveEngineLogo} resizeMode="contain" source={HIVE_ENGINE_ICON} />
        </View>
      )}
      {isSpk && (
        <View style={styles.hiveEngineWrapper}>
          <FastImage style={styles.hiveEngineLogo} resizeMode="contain" source={HIVE_SPK_ICON} />
        </View>
      )}
    </View>
  );
};
