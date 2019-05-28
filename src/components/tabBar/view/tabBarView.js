import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  Text,
  View,
  Animated,
  TouchableNativeFeedback,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';

// Styles
import styles from './tabBarStyles';

class TabBar extends PureComponent {
  /* Props
   * ------------------------------------------------ TODO: Fill fallowlines
   *   @prop { type }    name            - Description.
   *   @prop { type }    name            - Description.
   *
   */

  constructor(props) {
    super(props);

    this.state = {
      activeColor: !props.isDarkTheme ? '#357ce6' : '#96c0ff',
      inactiveColor: !props.isDarkTheme ? '#788187' : '#526d91',
    };
  }

  _renderTab = (name, page, isTabActive, onPressHandler) => {
    const { activeColor, inactiveColor } = this.state;
    const textColor = isTabActive ? activeColor : inactiveColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';
    const Button = Platform.OS === 'ios' ? ButtonIos : ButtonAndroid;
    // TODO: make generic component!!

    return (
      <Button
        style={styles.tabButton}
        key={name}
        accessible
        accessibilityLabel={name}
        accessibilityTraits="button"
        onPress={() => onPressHandler(page)}
      >
        <View style={styles.tab}>
          <Text style={[{ color: textColor, fontWeight }, styles.text]}>{name}</Text>
        </View>
      </Button>
    );
  };

  _renderUnderline = () => {
    const {
      tabs,
      tabUnderlineDefaultWidth,
      tabUnderlineScaleX,
      scrollValue,
      underlineStyle,
    } = this.props;
    const { activeColor } = this.state;

    const containerWidth = Dimensions.get('window').width;
    const numberOfTabs = tabs.length;
    const underlineWidth = tabUnderlineDefaultWidth || containerWidth / (numberOfTabs * 2);
    const scale = tabUnderlineScaleX || 2;
    const deLen = (containerWidth / numberOfTabs - underlineWidth) / 2;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: underlineWidth,
      height: 2,
      borderRadius: 2,
      backgroundColor: activeColor,
      bottom: 0,
      left: deLen,
    };

    const translateX = scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, containerWidth / numberOfTabs],
    });

    const scaleValue = defaultScale => {
      const number = 4;
      const arr = new Array(number * 2);

      return arr.fill(0).reduce(
        (pre, cur, idx) => {
          idx == 0 ? pre.inputRange.push(cur) : pre.inputRange.push(pre.inputRange[idx - 1] + 0.5);
          idx % 2 ? pre.outputRange.push(defaultScale) : pre.outputRange.push(1);
          return pre;
        },
        { inputRange: [], outputRange: [] },
      );
    };

    const scaleX = scrollValue.interpolate(scaleValue(scale));

    return (
      <Animated.View
        style={[
          tabUnderlineStyle,
          {
            transform: [{ translateX }, { scaleX }],
          },
          underlineStyle,
        ]}
      />
    );
  };

  render() {
    const { activeTab, backgroundColor, style, goToPage, tabs } = this.props;

    return (
      <View style={[styles.tabs, { backgroundColor }, style]}>
        {tabs.map((name, page) => {
          const isTabActive = activeTab === page;
          return this._renderTab(name, page, isTabActive, goToPage);
        })}
        {this._renderUnderline()}
      </View>
    );
  }
}

const ButtonAndroid = props => (
  <TouchableNativeFeedback
    delayPressIn={0}
    background={TouchableNativeFeedback.SelectableBackground()}
    {...props}
  >
    {props.children}
  </TouchableNativeFeedback>
);

const ButtonIos = props => <TouchableOpacity {...props}>{props.children}</TouchableOpacity>;

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(TabBar);
