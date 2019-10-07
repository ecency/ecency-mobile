import { View, TouchableHighlight, Animated } from 'react-native';
import React, { Component } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

import styles from './bottomTabBarStyles';

export default class TabBar extends Component {
  constructor(props) {
    super(props);

    const { selectedIndex, children } = props;

    let value;
    switch (children.length) {
      case 2:
        value = 480;
        break;
      case 3:
        value = 240;
        break;
      case 4:
        value = 160;
        break;
      case 5:
        value = 120;
        break;
      default:
        break;
    }

    this.state = {
      selectedIndex: selectedIndex,
      circleRadius: new Animated.Value(91 + selectedIndex * value),
      pathD: new Animated.Value(selectedIndex * value),
      pathX: selectedIndex * value,
      showIcon: true,
      animateConstant: value,
    };

    this.state.circleRadius.addListener(circleRadius => {
      this._myCircle.setNativeProps({ cx: parseInt(circleRadius.value, 10) });
    });

    this.state.pathD.addListener(a => {
      this.setState({
        pathX: parseInt(a.value, 10),
      });
    });
  }

  componentDidUpdate(prevProps) {
    const { selectedIndex } = this.props;

    if (prevProps.selectedIndex !== selectedIndex) {
      this._onPress(selectedIndex);
    }
  }

  _onPress = (i, disabled) => {
    const { onChange } = this.props;
    if (!disabled) {
      this._move(i);
      if (onChange) {
        onChange(i);
      }
    }
  };

  _move = index => {
    const { animateConstant, pathD, circleRadius } = this.state;

    this.setState({
      selectedIndex: index,
      showIcon: false,
    });

    Animated.timing(pathD, {
      toValue: 0 + index * animateConstant,
      duration: 450,
    }).start(() => this.setState({ showIcon: true }));
    Animated.timing(circleRadius, {
      toValue: 91 + index * animateConstant,
    }).start();
  };

  render() {
    const { children, backgroundColor, circleBackgroundColor, style } = this.props;
    const { selectedIndex, showIcon, pathX, circleRadius } = this.state;

    return (
      <View style={[styles.container, style]}>
        <View style={styles.subContent}>
          {children.map((route, i) => {
            let element = React.cloneElement(route, {
              selected: selectedIndex === i,
              onPress: this._onPress,
              key: i,
              index: i,
              showIcon,
            });
            return element;
          })}
        </View>

        <Svg
          version="1.1"
          id="bottom-bar"
          x="0px"
          y="0px"
          width="100%"
          height="100"
          viewBox="0 0 661 136"
          space="preserve"
        >
          <AnimatedPath
            fill={backgroundColor}
            d={`M${31 + pathX}.454074,80.6628108 C${42 + pathX}.339255,102.895752 ${64 +
              pathX}.692432,118.142857 ${90 + pathX}.5,118.142857 C${116 +
              pathX}.658561,118.142857 ${139 + pathX}.26813,102.478199 ${149 +
              pathX}.983671,79.7518248 C${154 + pathX}.222383,70.7620241 ${170 +
              pathX}.571658,50 ${197 + pathX}.357095,50 C${247 +
              pathX}.055518,50 561.603153,50 661,50 L661,156 L0,156 L0,50 C99.6668047,50 ${-66 +
              pathX}.416908,50 ${-16 + pathX}.250311,50 C${11 + pathX}.065333,50 ${26 +
              pathX}.941653,71.4462087 ${31 + pathX}.454074,80.6628108 Z`}
          />
          <AnimatedCircle
            ref={ref => (this._myCircle = ref)}
            fill={circleBackgroundColor}
            cx={circleRadius}
            cy="50.5"
            r="50"
          />
        </Svg>
      </View>
    );
  }
}

const TabBarItem = ({ icon, selectedIcon, index, selected, onPress, showIcon, disabled }) => {
  if (selected) {
    if (showIcon) {
      return (
        <TouchableHighlight underlayColor={'transparent'} style={styles.navItem}>
          <View style={styles.circle}>{selectedIcon || icon}</View>
        </TouchableHighlight>
      );
    }
    return <View style={styles.navItem} />;
  }
  return (
    <TouchableHighlight
      underlayColor={'transparent'}
      style={styles.navItem}
      onPress={() => onPress(index, disabled)}
    >
      {icon}
    </TouchableHighlight>
  );
};

TabBar.Item = TabBarItem;
