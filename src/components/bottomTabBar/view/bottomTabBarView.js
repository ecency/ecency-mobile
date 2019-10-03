import React, { PureComponent } from 'react';
import { TouchableOpacity, SafeAreaView, View, Dimensions } from 'react-native';
import { connect } from 'react-redux';

// Services and Actions
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Components
import TabBar from './tabbar';

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
  UNSAFE_componentWillUpdate(nextProps) {
    const {
      navigation: {
        state: { index, routes },
      },
      dispatch,
    } = nextProps;

    dispatch(updateActiveBottomTab(routes[index].routeName));
  }

  // Component Functions
  _jumpTo = route => {
    const {
      jumpTo,
      navigation: {
        state: { index, routes },
      },
    } = this.props;

    const _routeName = routes[index].routeName;

    if (
      !!route &&
      !!route.params &&
      !!route.params.scrollToTop &&
      _routeName === ROUTES.TABBAR.HOME
    ) {
      route.params.scrollToTop();
    }

    jumpTo(route.key);
  };

  render() {
    const {
      navigation: {
        state: { index, routes },
      },
      activeTintColor,
      inactiveTintColor,
      renderIcon,
    } = this.props;

    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          zIndex: 99999,
          width: Dimensions.get('window').width,
        }}
      >
        <TabBar
          itemList={routes}
          renderIcon={renderIcon}
          onPress={this._jumpTo}
          activeTintColor={activeTintColor}
          inactiveTintColor={inactiveTintColor}
        />
      </View>
    );
  }
}

export default connect()(BottomTabBarView);
