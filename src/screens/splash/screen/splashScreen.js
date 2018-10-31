import React, { Component } from 'react';
import { Text } from 'react-native';
import { Container } from 'native-base';

// Components
import { Logo } from '../../../components';

import styles from './splashStyles';

class SplashScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container style={styles.container}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>eSteem</Text>
        <Text style={styles.subTitle}>mobile</Text>
      </Container>
    );
  }
}

export default SplashScreen;
