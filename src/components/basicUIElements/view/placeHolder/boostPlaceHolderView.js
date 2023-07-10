/* eslint-disable radix */
import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import times from 'lodash/times';
import Placeholder from 'rn-placeholder';
// import { useSelector } from 'react-redux'; //NEW LINE ADDED
import styles from './boostPlaceHolderStyles';
import getWindowDimensions from '../../../../utils/getWindowDimensions';

const HEIGHT = getWindowDimensions().height;

const BoostPlaceHolder = () => {
  const ratio = (HEIGHT - 300) / 50 / 1.3;
  const listElements = [];
  const isDarkTheme = useSelector((state) => state.application.isDarkTeme);
  const color = isDarkTheme ? '#2e3d51' : '#f5f5f5';
  times(parseInt(ratio), (i) => {
    listElements.push(<View style={styles.container} key={`key-${i.toString()}`}>
      <View style={styles.line}>
        <Placeholder.Box color={color} width={90} height={40} animate="fade" />
        <View style={styles.paragraphWrapper}>
          <Placeholder.Box
            color={color}
            width={140}
            radius={25}
            height={50}
            animate="fade"
          />
        </View>
        <Placeholder.Box
          style={styles.rightBox}
          color={color}
          width={20}
          height={10}
          animate="fade"
        />
      </View>
    </View>

    );
  });

  return <View style={styles.container}>{listElements}</View>;
};

export default BoostPlaceHolder;
/* eslint-enable */
