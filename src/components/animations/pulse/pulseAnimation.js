import React, { Component } from 'react';
import {
  View, Text, Image, StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    flex: 1,
  },
});

export default class PulseAnimation extends Component {
  static defaultProps = {
    color: 'blue',
    diameter: 400,
    duration: 1000,
    image: null,
    initialDiameter: 0,
    numPulses: 3,
    pulseStyle: {},
    speed: 10,
    style: {
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      color: this.props.color,
      duration: this.props.duration,
      image: this.props.image,
      maxDiameter: this.props.diameter,
      numPulses: this.props.numPulses,
      pulses: [],
      pulseStyle: this.props.pulseStyle,
      speed: this.props.speed,
      started: false,
      style: this.props.style,
    };
  }

  mounted = true;

  componentDidMount() {
    const { numPulses, duration, speed } = this.state;

    this.setState({ started: true });

    let a = 0;
    while (a < numPulses) {
      this.createPulseTimer = setTimeout(() => {
        this.createPulse(a);
      }, a * duration);

      a++;
    }

    this.timer = setInterval(() => {
      this.updatePulse();
    }, speed);
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.createPulseTimer);
    clearInterval(this.timer);
  }

  createPulse = (pKey) => {
    if (this.mounted) {
      const pulses = this.state.pulses;

      const pulse = {
        pulseKey: pulses.length + 1,
        diameter: this.props.initialDiameter,
        opacity: 0.5,
        centerOffset: (this.state.maxDiameter - this.props.initialDiameter) / 2,
      };

      pulses.push(pulse);

      this.setState({ pulses });
    }
  };

  updatePulse = () => {
    if (this.mounted) {
      const pulses = this.state.pulses.map((p, i) => {
        const maxDiameter = this.state.maxDiameter;
        const newDiameter = p.diameter > maxDiameter ? 0 : p.diameter + 2;
        const centerOffset = (maxDiameter - newDiameter) / 2;
        const opacity = Math.abs(newDiameter / this.state.maxDiameter - 1);

        const pulse = {
          pulseKey: i + 1,
          diameter: newDiameter,
          opacity: opacity > 0.5 ? 0.5 : opacity,
          centerOffset,
        };

        return pulse;
      });

      this.setState({ pulses });
    }
  };

  render() {
    const {
      color, image, maxDiameter, pulses, pulseStyle, started, style,
    } = this.state;
    const containerStyle = [styles.container, style];
    const pulseWrapperStyle = { width: maxDiameter, height: maxDiameter };

    return (
      <View style={containerStyle}>
        {started && (
          <View style={pulseWrapperStyle}>
            {pulses.map(pulse => (
              <View
                key={pulse.pulseKey}
                style={[
                  styles.pulse,
                  {
                    backgroundColor: color,
                    width: pulse.diameter,
                    height: pulse.diameter,
                    opacity: pulse.opacity,
                    borderRadius: pulse.diameter / 2,
                    top: pulse.centerOffset,
                    left: pulse.centerOffset,
                  },
                  pulseStyle,
                ]}
              />
            ))}
            {image && <Image style={image.style} source={image.source} />}
          </View>
        )}
      </View>
    );
  }
}
