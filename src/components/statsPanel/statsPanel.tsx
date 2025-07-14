import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { BounceIn, BounceOut } from 'react-native-reanimated';
import styles from './statsPanel.styles';
import { getAbbreviatedNumber } from '../../utils/number';

export interface StatsItem {
  label: string;
  value: number | string;
  suffix?: string;
}

interface Props {
  data: StatsItem[];
  intermediate: boolean;
  style?: ViewStyle;
}

export const StatsPanel = ({ data, intermediate, style }: Props) => {
  return (
    <View style={{ ...styles.container, ...style }}>
      {data.map((item) => (
        <StatItem
          key={item.label}
          label={item.label}
          value={item.value && item.value + (item.suffix || '')}
          intermediate={intermediate}
        />
      ))}
    </View>
  );
};

const StatItem = (props: { label: string; value: number | string; intermediate: boolean }) => (
  <View style={{ alignItems: 'center', flex: 1 }}>
    {!props.intermediate ? (
      <Animated.Text
        entering={BounceIn.delay(300)}
        exiting={BounceOut}
        style={styles.statValue}
        allowFontScaling={false}
      >
        {getAbbreviatedNumber(props.value)}
      </Animated.Text>
    ) : (
      <Text style={styles.statValue}>--</Text>
    )}

    <Text style={styles.statLabel}>{props.label}</Text>
  </View>
);
