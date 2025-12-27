/* eslint-disable radix */
import React, { Fragment } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Placeholder from 'rn-placeholder';
import times from 'lodash/times';
import { useSelector } from 'react-redux';
import { selectIsDarkTheme } from '../../../../redux/selectors';

import styles from './walletDetailsPlaceHolderStyles';

const listPlaceHolderView = (color) => {
  const dim = useWindowDimensions();

  const ratio = (dim.height - 300) / 50;
  const listElements = [];

  times(parseInt(ratio), (i) => {
    listElements.push(
      <View key={i} style={styles.textWrapper}>
        <Placeholder.Box animate="fade" height={30} width="100%" radius={5} color={color} />
      </View>,
    );
  });

  return <Fragment>{listElements}</Fragment>;
};

const WalletDetailsPlaceHolder = () => {
  const isDarkTheme = useSelector(selectIsDarkTheme);
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

export default WalletDetailsPlaceHolder;
/* eslint-enable */
