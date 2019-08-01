/* eslint-disable radix */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Dimensions, View } from 'react-native';
import times from 'lodash/times';
import Placeholder from 'rn-placeholder';

import styles from './boostPlaceHolderStyles';

const HEIGHT = Dimensions.get('window').height;

const BoostPlaceHolder = ({ isDarkTheme }) => {
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';
  const ratio = (HEIGHT - 300) / 50;
  const listElements = [];

  times(parseInt(ratio), i => {
    listElements.push(
      <View key={i}>
        <Placeholder.Box width={90} height={40} />
        <View style={styles.paragraphWrapper}>
          <Placeholder.Box width={120} radius={20} height={40} />
        </View>
      </View>,
    );
  });

  return <View style={styles.container}>{listElements}</View>;
};

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(BoostPlaceHolder);
