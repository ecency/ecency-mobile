import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './children.styles';

interface RangeOption {
  label: string;
  value: number;
}

interface RangeSelectorProps {
  range: number;
  minRange: number;
  onRangeChange: (range: number) => void;
}

export const RangeSelector = ({ range, minRange, onRangeChange }: RangeSelectorProps) => {

  const _onSelection = (range: number) => {
    console.log('selection', range);
    onRangeChange(range);
  };

  const _renderRangeButtons = FILTERS.filter((item) => item.value >= minRange).map((item: RangeOption) => (
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
    value: 30,
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
