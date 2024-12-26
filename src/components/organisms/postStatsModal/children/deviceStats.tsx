import React, { useMemo } from 'react';
import { View, Text, ViewStyle, useWindowDimensions } from 'react-native';
import { usePostStatsByDevice } from '../../../../providers/queries';
import styles from '../styles/deviceStats.styles';
import { Bar as ProgressBar } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';

export const DeviceStats = ({ urlPath }: { urlPath: string }) => {
  const statsByDevice = usePostStatsByDevice(urlPath);

  const dims = useWindowDimensions();


  const _barStyle = {
    borderRadius: 12,
    alignSelf: 'stretch',
    marginHorizontal: 8,
    borderWidth:0
  } as ViewStyle


  const _barWidth = dims.width - 96;


  const total = useMemo(() =>
    statsByDevice.data?.reduce((prevVal, item) => prevVal + item.stats.pageviews, 0) || 1, [statsByDevice.data])

return (
  <View style={styles.container}>
    {statsByDevice.data?.map((stat) => (
      <View key={stat.device} style={styles.statWrapper}>
        <Text style={styles.statLabel}>{stat.device !== '(not set)' ? stat.device : 'Other'}</Text>
        <ProgressBar
          progress={stat.stats.pageviews / total}
          width={_barWidth}
          height={10}
          style={_barStyle}
          unfilledColor={EStyleSheet.value('$primaryLightBackground')}
          color={EStyleSheet.value('$iconColor')}
          indeterminate={statsByDevice.isLoading}
          useNativeDriver={true}
        />
      </View>
    ))}
  </View>
);
};
