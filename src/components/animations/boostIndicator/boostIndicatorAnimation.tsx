import React from 'react';
import { View, Image } from 'react-native';

import { SpinIndicator } from '../spinIndicator/spinIndicator';

// Styles
import styles from './boostIndicatorStyles';

const BoostIndicatorAnimation = ({ isSpinning }) => {
  return (
    <View style={styles.spinIndicatorContainer}>
      <SpinIndicator
        size={230}
        animationDuration={2400}
        color={!isSpinning ? '#f2f2f2' : '#1a509a'}
        breadth={12}
        animating={isSpinning}
        initStart={0}
      />
      <SpinIndicator
        size={180}
        animationDuration={2000}
        color={!isSpinning ? '#f2f2f2' : '#357ce6'}
        breadth={12}
        animating={isSpinning}
        initStart={20}
      />
      <SpinIndicator
        size={130}
        animationDuration={1700}
        color={!isSpinning ? '#f2f2f2' : '#4da1f1'}
        breadth={12}
        animating={isSpinning}
        initStart={40}
      />
      <Image
        style={{ width: 80, height: 80 }}
        source={require('../../../assets/ecency-logo-round.png')}
      />
    </View>
  );
};

export { BoostIndicatorAnimation };
