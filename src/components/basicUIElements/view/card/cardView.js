import React from 'react';
import { View } from 'react-native';
import styles from './cardStyles';

export const Card = ({ children }) => <View style={styles.wrapper}>{children}</View>;
