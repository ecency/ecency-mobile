import React from 'react';
import { View, Text } from 'react-native';
import * as Animated from 'react-native-animatable';
import styles from './quickProfileStyles';

export interface StatsData {
  label: string;
  value: number | string;
  suffix?: string;
}

interface Props {
  data: StatsData[];
  horizontalMargin?: number;
  intermediate: boolean;
}

export const ProfileStats = ({ data, horizontalMargin, intermediate }: Props) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 40,
        marginHorizontal: horizontalMargin,
      }}
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
      <Animated.Text animation="bounceIn" style={styles.statValue}>
        {props.value}
      </Animated.Text>
    ) : (
      <Text style={styles.statValue}>--</Text>
    )}

    <Text style={styles.statLabel}>{props.label}</Text>
  </View>
);
