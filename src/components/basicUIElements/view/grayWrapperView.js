import React from 'react';
import { View } from 'react-native';
import styles from './grayWrapperStyles';

const GrayWrapper = ({ children }) => <View style={styles.wrapper}>{children}</View>;

export default GrayWrapper;
