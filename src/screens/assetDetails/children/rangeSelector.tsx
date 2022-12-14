import React, { useState } from 'react';
import { View, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TouchableOpacity } from 'react-native-gesture-handler';
import styles from './children.styles';

interface RangeOption {
  label: string;
  value: number;
}

interface RangeSelectorProps {
  range: number;
  onRangeChange: (range: number) => void;
}

export const RangeSelector = ({ range, onRangeChange }: RangeSelectorProps) => {
  const _onSelection = (range: number) => {
    console.log('selection', range);
    onRangeChange(range);
    //TODO: implement on range change prop
  };

  const _renderRangeButtons = FILTERS.map((item: RangeOption) => (
    <TouchableOpacity key={`range option-${item.value}`} onPress={() => _onSelection(item.value)}>
      <View
        style={{
          ...styles.rangeOptionWrapper,
          backgroundColor: EStyleSheet.value(
            item.value === range ? '$darkGrayBackground' : '$primaryLightBackground',
          ),
        }}
      >
        <Text
          style={{
            ...styles.textRange,
            color: EStyleSheet.value(item.value === range ? '$white' : '$primaryDarkText'),
          }}
        >
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  ));

  return <View style={[styles.card, styles.rangeContainer]}>{_renderRangeButtons}</View>;
};

const FILTERS = [
  {
    label: '24H',
    value: 1,
  },
  {
    label: '1W',
    value: 7,
  },
  {
    label: '1M',
    value: 20,
  },
  {
    label: '1Y',
    value: 365,
  },
  {
    label: '5Y',
    value: 365 * 5,
  },
] as RangeOption[];
