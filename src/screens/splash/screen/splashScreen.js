import React, { Component } from 'react';
import { Text } from 'react-native';
import { Container } from 'native-base';

class SplashScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <Text>Splash Screen</Text>
      </Container>
    );
  }
}

export default SplashScreen;
