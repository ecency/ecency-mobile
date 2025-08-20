import React from 'react';
import { View } from 'react-native';

import styles from './separatorStyles';

const Separator = ({ style }) => <View style={[styles.separator, style]} />;

export default Separator;
