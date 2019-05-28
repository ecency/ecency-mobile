import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';

import styles from './walletDetailsPlaceHolderStyles';

const WalletDetailsPlaceHolder = ({ isDarkTheme }) => {
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <Placeholder.Paragraph lineNumber={1} color={color} />
      </View>
      <View style={styles.textWrapper}>
        <Placeholder.Box animate="fade" height={30} width="100%" radius={5} color={color} />
      </View>
      <View style={styles.textWrapper}>
        <Placeholder.Box animate="fade" height={30} width="100%" radius={5} color={color} />
      </View>
      <View style={styles.textWrapper}>
        <Placeholder.Box animate="fade" height={30} width="100%" radius={5} color={color} />
      </View>
      <View style={styles.textWrapper}>
        <Placeholder.Box animate="fade" height={30} width="100%" radius={5} color={color} />
      </View>
    </View>
  );
};

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(WalletDetailsPlaceHolder);
