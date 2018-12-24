import React, { PureComponent } from 'react';
import { TouchableOpacity, SafeAreaView } from 'react-native';
import { connect } from 'react-redux';
import ViewOverflow from 'react-native-view-overflow';

// Services and Actions
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';

// Constants

// Components

// Styles
import styles from './bottomTabBarStyles';

class BottomTabBarView extends PureComponent {
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
      <SafeAreaView style={styles.safeArea}>
        <ViewOverflow style={styles.wrapper}>
          {routes.map((route, idx) => (
            <ViewOverflow
              key={route.key}
              style={{
                flex: 1,
                alignItems: 'center',
              }}
            >
              <TouchableOpacity onPress={() => jumpTo(route.key)}>
                {renderIcon({
                  route,
                  focused: index === idx,
                  tintColor: index === idx ? activeTintColor : inactiveTintColor,
                })}
              </TouchableOpacity>
            </ViewOverflow>
          ))}
        </ViewOverflow>
      </SafeAreaView>
    );
  }
}

export default connect()(BottomTabBarView);
