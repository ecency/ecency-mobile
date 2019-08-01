/* eslint-disable */
import { StyleSheet, View, TouchableHighlight, Animated, Image } from 'react-native';
import React, { Component } from 'react';

import Svg, { Circle, Path } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default class TabBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: 2,
      circleRadius: new Animated.Value(331),
      pathD: new Animated.Value(240),
      pathX: 240,
      showIcon: true,
    };

    this.state.circleRadius.addListener(circleRadius => {
      this._myCircle.setNativeProps({ cx: parseInt(circleRadius.value) });
    });

    this.state.pathD.addListener(a => {
      console.log(this.state.pathD);
      this.setState({
        pathX: parseInt(a.value),
      });
    });
  }

  _renderButtonContent = (i, selectedIndex, showIcon, route) => {
    const { renderIcon, inactiveTintColor, activeTintColor } = this.props;
    if (selectedIndex == i) {
      if (showIcon) {
        return (
          <View style={styles.circle}>
            {renderIcon({
              route,
              focused: true,
              tintColor: activeTintColor,
            })}
          </View>
        );
      }
      return <View />;
    }
    return (
      <View>
        {renderIcon({
          route,
          focused: false,
          tintColor: inactiveTintColor,
        })}
      </View>
    );
  };

  _onPress = (i, route) => {
    const { onPress } = this.props;
    this.update(i);
    onPress(route);
  };

  render() {
    const { children, itemList } = this.props;
    const { selectedIndex, showIcon, pathX } = this.state;

    return (
      <View style={[styles.container, this.props.style]}>
        <View style={[styles.content]}>
          <View style={styles.subContent}>
            {itemList.map((route, i) => (
              <TouchableHighlight
                key={i}
                underlayColor={'transparent'}
                style={styles.navItem}
                onPress={() => (selectedIndex !== i ? this._onPress(i, route) : null)}
              >
                {this._renderButtonContent(i, selectedIndex, showIcon, route)}
              </TouchableHighlight>
            ))}
          </View>

          <Svg
            version="1.1"
            id="bottom-bar"
            x="0px"
            y="0px"
            width="100%"
            height="100"
            viewBox="0 0 661 156"
            space="preserve"
          >
            <AnimatedPath
              fill="#f0f0f0"
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
              fill="#f0f0f0"
              cx="331"
              cy="50.5"
              r="50"
            />
          </Svg>
        </View>
      </View>
    );
  }
  update(index) {
    const value = 120;
    let that = this;
    that.setState({
      selectedIndex: index,
      showIcon: false,
    });

    Animated.spring(that.state.pathD, {
      toValue: 0 + index * value,
      duration: 10,
      friction: 10,
    }).start();
    setTimeout(function() {
      that.setState({
        showIcon: true,
      });
    }, 100);
    Animated.spring(that.state.circleRadius, {
      toValue: 91 + index * value,
      friction: 10,
    }).start();
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  subContent: {
    flexDirection: 'row',
    marginLeft: 19,
    marginRight: 19,
    marginBottom: 10,
    zIndex: 1,
    position: 'absolute',
    bottom: 5,
  },
  navItem: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 6,
    alignItems: 'center',
    zIndex: 0,
  },
  navImage: {
    width: 45,
    height: 45,
  },
  circle: {
    bottom: 28,
  },
});
