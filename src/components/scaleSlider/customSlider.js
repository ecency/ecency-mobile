import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Item } from './item';

import styles from './scaleSliderStyles';

export class CustomSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      multiSliderValue: [props.min, props.max],
      first: props.min,
      second: props.max,
    };
  }

  _renderMarker = () => (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'white',
        borderColor: '#5CCDFF',
        borderWidth: 1,
        position: 'absolute',
      }}
    />
  );

  _multiSliderValuesChange = values => {
    const { single, callback } = this.props;

    if (single) {
      this.setState({
        second: values[0],
      });
    } else {
      this.setState({
        multiSliderValue: values,
        first: values[0],
        second: values[1],
      });

      if (callback) callback(values);
    }
  };

  _renderScale = () => {
    const { min, max, values } = this.props;
    const { first, second } = this.state;

    const items = [];

    if (values) {
      for (let i = min; i <= values.length; i++) {
        items.push(<Item value={values[i - 1]} first={first} second={second} />);
      }
    } else {
      for (let i = min; i <= max; i++) {
        items.push(<Item value={i} first={first} second={second} />);
      }
    }
    return items;
  };

  render() {
    const { multiSliderValue } = this.state;
    const { min, max, single, LRpadding } = this.props;

    return (
      <View>
        <View style={[styles.column, { marginLeft: LRpadding, marginRight: LRpadding }]}>
          {this._renderScale()}
        </View>
        <View style={styles.container}>
          <MultiSlider
            trackStyle={{ backgroundColor: '#bdc3c7' }}
            selectedStyle={{ backgroundColor: '#357ce6' }}
            values={single ? [multiSliderValue[1]] : [multiSliderValue[0], multiSliderValue[1]]}
            sliderLength={Dimensions.get('window').width - LRpadding * 2}
            onValuesChange={this._multiSliderValuesChange}
            min={min}
            max={max}
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
