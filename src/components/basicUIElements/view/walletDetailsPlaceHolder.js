import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import styles from './walletDetailsPlaceHolderStyles';

const WalletDetailsPlaceHolder = () => (
  <View style={styles.container}>
    <View style={styles.textWrapper}>
      <Placeholder.Paragraph lineNumber={1} />
    </View>
    <View style={styles.textWrapper}>
      <Placeholder.Box animate="fade" height={30} width="100%" radius={5} />
    </View>
    <View style={styles.textWrapper}>
      <Placeholder.Box animate="fade" height={30} width="100%" radius={5} />
    </View>
    <View style={styles.textWrapper}>
      <Placeholder.Box animate="fade" height={30} width="100%" radius={5} />
    </View>
    <View style={styles.textWrapper}>
      <Placeholder.Box animate="fade" height={30} width="100%" radius={5} />
    </View>
  </View>
);

export default WalletDetailsPlaceHolder;
