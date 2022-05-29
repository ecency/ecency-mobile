/* eslint-disable radix */
import React, { Fragment } from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';
import times from 'lodash/times';

import { ThemeContainer } from '../../../../containers';

import styles from './walletDetailsPlaceHolderStyles';
import getWindowDimensions from '../../../../utils/getWindowDimensions';

const HEIGHT = getWindowDimensions().height;

const listPlaceHolderView = (color) => {
  const ratio = (HEIGHT - 300) / 50;
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

const WalletDetailsPlaceHolder = () => (
  <ThemeContainer>
    {({ isDarkTheme }) => {
      const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';

      return (
        <View style={styles.container}>
          <View style={styles.textWrapper}>
            <Placeholder.Paragraph lineNumber={1} color={color} />
          </View>
          {listPlaceHolderView(color)}
        </View>
      );
    }}
  </ThemeContainer>
);

export default WalletDetailsPlaceHolder;
/* eslint-enable */
