/* eslint-disable radix */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { View, Dimensions } from 'react-native';
import Placeholder from 'rn-placeholder';
import times from 'lodash/times';

import styles from './walletDetailsPlaceHolderStyles';

const HEIGHT = Dimensions.get('window').height;

const listPlaceHolderView = color => {
  const ratio = (HEIGHT - 300) / 50;
  const listElements = [];

  times(parseInt(ratio), i => {
    listElements.push(
      <View key={i} style={styles.textWrapper}>
        <Placeholder.Box animate="fade" height={30} width="100%" radius={5} color={color} />
      </View>,
    );
  });

  return <Fragment>{listElements}</Fragment>;
};

const WalletDetailsPlaceHolder = ({ isDarkTheme }) => {
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <Placeholder.Paragraph lineNumber={1} color={color} />
      </View>
      {listPlaceHolderView(color)}
    </View>
  );
};

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(WalletDetailsPlaceHolder);
