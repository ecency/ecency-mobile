import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native';

import ViewOverflow from 'react-native-view-overflow';

// Constants

// Components

// Styles
import styles from './bottomTabBarStyles';

class BottomTabBarView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      navigation: {
        state: { index, routes },
      },
      activeTintColor,
      inactiveTintColor,
      renderIcon,
      jumpTo,
    } = this.props;

    return (
      <ViewOverflow style={styles.wrapper}>
        {routes.map((route, idx) => (
          <ViewOverflow
            key={route.key}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TouchableWithoutFeedback onPress={() => jumpTo(route.key)}>
              {renderIcon({
                route,
                focused: index === idx,
                tintColor: index === idx ? activeTintColor : inactiveTintColor,
              })}
            </TouchableWithoutFeedback>
          </ViewOverflow>
        ))}
      </ViewOverflow>
    );
  }
}

export default BottomTabBarView;
