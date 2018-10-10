import React, { Component } from 'react';
import {
  View, Dimensions, Text, TouchableOpacity,
} from 'react-native';

// Constants

// Components

// Styles
import styles from './percentBarStyles';

class PercentBarView extends Component {
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
    this.state = {
      isVisibleText: true,
    };
  }

  // Component Life Cycles

  // Component Functions
  _calculateWidth = (percent, margin = null) => {
    if (percent) {
      const per = 100 / percent;

      return Dimensions.get('window').width / per - margin;
    }
    return null;
  };

  _getText = (textColor, text, isTop, isRender) => {
    const { isVisibleText } = this.state;

    if (isTop === isRender && text) {
      return (
        <View style={styles.percentTitleWrapper}>
          <Text style={[styles.percentTitle, textColor && { color: textColor }]}>
            {isVisibleText && text}
          </Text>
        </View>
      );
    }
  };

  render() {
    const {
      percent, margin, text, barColor, barPercentColor, textColor, isTop,
    } = this.props;
    const { isVisibleText } = this.state;

    return (
      <View>
        <TouchableOpacity onPress={() => this.setState({ isVisibleText: !isVisibleText })}>
          {this._getText(textColor, text, isTop, true)}
        </TouchableOpacity>
        <View style={[styles.container, barColor && { backgroundColor: barColor }]}>
          <View
            style={[
              styles.powerBar,
              barPercentColor && { backgroundColor: barPercentColor },
              { width: this._calculateWidth(percent, margin) },
            ]}
          />
        </View>
        <TouchableOpacity onPress={() => this.setState({ isVisibleText: !isVisibleText })}>
          {this._getText(textColor, text, isTop, false)}
        </TouchableOpacity>
      </View>
    );
  }
}

export default PercentBarView;
