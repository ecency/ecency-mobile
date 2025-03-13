/* eslint-disable react/no-unused-state */
import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import MultiSlider from '@esteemapp/react-native-multi-slider';

import styles from './scaleSliderStyles';
import getWindowDimensions from '../../utils/getWindowDimensions';

const ScaleSliderView = ({ values, LRpadding, handleOnValueChange, activeValue }) => {
  const [_activeValue, setActiveValue] = useState(activeValue || values[0]);
  const [activeIndex, setActiveIndex] = useState(
    values?.length > 0 ? values.indexOf(_activeValue) : 0,
  );

  const sliderKey = useMemo(() => JSON.stringify(values), [values]);

  const _renderMarker = () => <View style={styles.marker} />;

  const _valueChange = (_values) => {
    const index = _values[0] - 1;

    setActiveValue(values && values[index]);
    setActiveIndex(index);

    if (handleOnValueChange) {
      handleOnValueChange(values[index]);
    }
  };

  const _renderItem = (value, index, activeIndex) => {
    const isActive = index <= activeIndex || index === 0;

    return (
      <View>
        <Text style={[isActive ? styles.active : styles.inactive]}>{value}</Text>
        <View style={[isActive ? styles.line : {}]} />
      </View>
    );
  };

  const _renderScale = () => {
    const items = [];

    for (let i = 1; i <= values.length; i++) {
      items.push(_renderItem(values[i - 1], i - 1, activeIndex));
    }

    return items;
  };

  return (
    <View>
      <View style={[styles.column, { marginLeft: LRpadding - 10, marginRight: LRpadding - 10 }]}>
        {_renderScale()}
      </View>
      <View style={styles.container}>
        <MultiSlider
          key={sliderKey}
          trackStyle={styles.track}
          selectedStyle={styles.selected}
          sliderLength={getWindowDimensions().width - LRpadding * 2}
          onValuesChange={_valueChange}
          values={[activeIndex + 1]}
          min={1}
          max={values && values.length}
          step={1}
          allowOverlap={false}
          customMarker={_renderMarker}
          snapped
        />
      </View>
    </View>
  );
};

export default ScaleSliderView;
/* eslint-enable */
