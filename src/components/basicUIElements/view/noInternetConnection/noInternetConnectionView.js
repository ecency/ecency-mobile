import React from 'react';
import { View, Text } from 'react-native';
import styles from './noInternetConnectionStyle';

const NoInternetConnection = () => (
  <View style={styles.container}>
    <Text style={styles.text}> No internet conenction</Text>
  </View>
);

export default NoInternetConnection;
