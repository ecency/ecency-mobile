import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

class RouletteItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coordX: props.radius,
      coordY: props.radius,
    };
  }

  getCoordinates({ width, height }) {
    const { radius, index, step, distance } = this.props;

    const coordX = Math.round(
      radius / 2 + distance * -Math.sin(index * step - Math.PI) - width / 2,
    );
    const coordY = Math.round(
      radius / 2 + distance * Math.cos(index * step - Math.PI) - height / 2,
    );

    this.setState({ coordX, coordY });
  }

  render() {
    const { item, rouletteRotate } = this.props;
    const { coordX, coordY } = this.state;

    return (
      <View
        style={{
          position: 'absolute',
          left: coordX,
          top: coordY,
          transform: [{ rotate: `${-rouletteRotate}deg` }],
        }}
        onLayout={event => this.getCoordinates(event.nativeEvent.layout)}
      >
        {item}
      </View>
    );
  }
}

RouletteItem.propTypes = {
  step: PropTypes.number,
  index: PropTypes.number,
  radius: PropTypes.number,
  distance: PropTypes.number,
  rouletteRotate: PropTypes.number,
  item: PropTypes.element.isRequired,
};

export default RouletteItem;
