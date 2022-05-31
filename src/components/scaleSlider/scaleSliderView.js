/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MultiSlider from '@esteemapp/react-native-multi-slider';
import get from 'lodash/get';

import styles from './scaleSliderStyles';
import getWindowDimensions from '../../utils/getWindowDimensions';

export default class ScaleSliderView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeValue: get(props, 'activeValue') || props.values[0],
      activeIndex: get(props, 'values', '').indexOf(get(props, 'activeValue')) || 0,
    };
  }

  _renderMarker = () => <View style={styles.marker} />;

  _valueChange = (_values) => {
    const { handleOnValueChange, values } = this.props;
    const index = _values[0] - 1;

    this.setState({
      activeValue: values && values[index],
      activeIndex: index,
    });

    if (handleOnValueChange) {
      handleOnValueChange(values[index]);
    }
  };

  _renderItem = (value, index, activeIndex) => {
    const isActive = index <= activeIndex || index === 0;

    return (
      <View>
        <Text style={[isActive ? styles.active : styles.inactive]}>{value}</Text>
        <View style={[isActive ? styles.line : {}]} />
      </View>
    );
  };

  _renderScale = () => {
    const { values } = this.props;
    const { activeIndex } = this.state;

    const items = [];

    for (let i = 1; i <= values.length; i++) {
      items.push(this._renderItem(values[i - 1], i - 1, activeIndex));
    }

    return items;
  };

  render() {
    const { LRpadding, values } = this.props;
    const { activeIndex } = this.state;

    return (
      <View>
        <View style={[styles.column, { marginLeft: LRpadding - 10, marginRight: LRpadding - 10 }]}>
          {this._renderScale()}
        </View>
        <View style={styles.container}>
          <MultiSlider
            trackStyle={styles.track}
            selectedStyle={styles.selected}
            sliderLength={getWindowDimensions().width - LRpadding * 2}
            onValuesChange={this._valueChange}
            values={[activeIndex + 1]}
            min={1}
            max={values && values.length}
            step={1}
            allowOverlap={false}
            customMarker={this._renderMarker}
            snapped
          />
        </View>
      </View>
    );
  }
}
/* eslint-enable */
