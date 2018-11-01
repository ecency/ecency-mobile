import React, { Component } from 'react';
import { Text, Animated } from 'react-native';
// Components
import { Logo } from '../../../components';

import styles from './splashStyles';

class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0),
    };
  }

  componentDidMount = () => {
    const { fadeAnim } = this.state;
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 6000,
    }).start();
  };

  render() {
    const { fadeAnim } = this.state;

    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>eSteem</Text>
        <Text style={styles.subTitle}>mobile</Text>
      </Animated.View>
    );
  }
}

export default SplashScreen;
