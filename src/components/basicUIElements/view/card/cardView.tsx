import React from 'react';
import { View } from 'react-native';
import styles from './cardStyles';

const Card = ({ children }) => <View style={styles.wrapper}>{children}</View>;

export default Card;
