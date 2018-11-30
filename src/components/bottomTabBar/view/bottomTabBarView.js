import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import ViewOverflow from 'react-native-view-overflow';

// Services and Actions
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';

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
  componentWillUpdate(nextProps) {
    const {
      navigation: {
        state: { index, routes },
      },
      dispatch,
    } = nextProps;

    dispatch(updateActiveBottomTab(routes[index].routeName));
  }

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

export default connect()(BottomTabBarView);
