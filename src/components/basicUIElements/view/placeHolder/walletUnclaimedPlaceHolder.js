import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import styles from './walletUnclaimedPlaceHolderStyles';

const WalletUnclaimedPlaceHolder = () => (
  <View style={styles.container}>
    <View style={styles.textWrapper}>
      <Placeholder.Paragraph lineNumber={1} />
    </View>
    <Placeholder.Box animate="fade" height={30} width="100%" radius={5} />
  </View>
);

export default WalletUnclaimedPlaceHolder;
