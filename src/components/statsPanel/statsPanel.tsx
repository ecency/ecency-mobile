import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { BounceIn, BounceOut } from 'react-native-reanimated';
import styles from './statsPanel.styles';

export interface StatsItem {
  label: string;
  value: number | string;
  suffix?: string;
}

interface Props {
  data: StatsItem[];
  intermediate: boolean;
  style?:ViewStyle
}

export const StatsPanel = ({ data, intermediate, style }: Props) => {
  return (
    <View
      style={{...styles.container, ...style}}
    >
      {data.map((item) => (
        <StatItem
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
        {formatIfNumber(props.value)}
      </Animated.Text>
    ) : (
      <Text style={styles.statValue}>--</Text>
    )}

    <Text style={styles.statLabel}>{props.label}</Text>
  </View>
);


const formatIfNumber = (input:string|number) => {
  const num = parseFloat(input); // Convert the string to a number

  // Check if the input is not a valid number
  if (isNaN(num)) {
    return input; // Return the original string if it's not a number
  }

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"; // Format in millions
  } else if (num >= 100_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"; // Convert 100K to 0.1M
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"; // Format in thousands
  } else {
    return num.toString(); // Return smaller numbers as-is
  }
}

