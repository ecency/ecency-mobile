import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import getWindowDimensions from '../../../utils/getWindowDimensions';

// Constants

// Components

// Styles
import styles from './percentBarStyles';

class PercentBarView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { string }    barColor                - Bar color proferties
   *   @prop { string }    barPercentColor         - Bar background color properties
   *   @prop { number }    margin                  - If you use with margin right and left you should declare that if it neccessary
   *   @prop { number }    percent                 - Percent for bar (ex: %32 just send 32)
   *   @prop { string }    text                    - Text string
   *   @prop { string }    textColor               - Text color
   *
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  _calculateWidth = (percent, margin = null) => {
    if (percent) {
      const per = 100 / percent;
      return (getWindowDimensions().width - margin) / per;
    }
    return null;
  };

  _getText = (textColor, text, isTop, isRender) => {
    const { isShowText } = this.props;

    if (!isShowText) {
      return null;
    }

    if (isTop === isRender && text) {
      return (
        <View style={styles.percentTitleWrapper}>
          <Text style={[styles.percentTitle, textColor && { color: textColor }]}>
            {isShowText && text}
          </Text>
        </View>
      );
    }
  };

  render() {
    const { percent, margin, text, barColor, barPercentColor, textColor, isTop } = this.props;

    return (
      <View>
        {this._getText(textColor, text, isTop, true)}
        <View style={[styles.container, barColor && { backgroundColor: barColor }]}>
          <View
            style={[
              styles.powerBar,
              barPercentColor && { backgroundColor: barPercentColor },
              { width: this._calculateWidth(percent, margin) },
            ]}
          />
        </View>
        {this._getText(textColor, text, isTop, false)}
      </View>
    );
  }
}

export default PercentBarView;
