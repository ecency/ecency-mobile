import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import styles from './percentBarStyles';

const PercentBar = ({
  percent, margin, text, barColor, barPercentColor, textColor, isTop,
}) => (
  <View>
    {_getText(textColor, text, isTop, true)}
    <View style={[styles.container, barColor && { backgroundColor: barColor }]}>
      <View
        style={[
          styles.powerBar,
          barPercentColor && { backgroundColor: barPercentColor },
          { width: _calculateWidth(percent, margin) },
        ]}
      />
    </View>
    {_getText(textColor, text, isTop, false)}
  </View>
);

const _calculateWidth = (percent, margin = null) => {
  if (percent) {
    const per = 100 / percent;

    return Dimensions.get('window').width / per - margin;
  }
  return null;
};

const _getText = (textColor, text, isTop, isRender) => {
  if (isTop === isRender && text) {
    return (
      <View style={styles.percentTitleWrapper}>
        <Text style={[styles.percentTitle, textColor && { color: textColor }]}>{text}</Text>
      </View>
    );
  }
};

export default PercentBar;
