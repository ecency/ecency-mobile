import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';
import { useDispatch } from 'react-redux';
import get from 'lodash/get';

// Services and Actions
import { TouchableOpacity } from 'react-native-gesture-handler';
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Container
import { ThemeContainer } from '../../../containers';

// Components
// import TabBar from './tabbar';

// Styles
import styles from './bottomTabBarStyles';

const _jumpTo = (route, index, routes, jumpTo) => {
  const _routeName = routes[index].routeName;

  if (!!get(route, 'params.scrollToTop') && _routeName === ROUTES.TABBAR.FEED) {
    route.params.scrollToTop();
  }

  jumpTo(route.key);
};

const BottomTabBarView = ({
  navigation: {
    state: { index, routes },
  },
  activeTintColor,
  inactiveTintColor,
  renderIcon,
  jumpTo,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateActiveBottomTab(routes[index].routeName));
  }, [dispatch, index, routes]);

  return (
    <ThemeContainer>
      {({ isDarkTheme }) => (
        <SafeAreaView style={styles.wrapper}>
          {routes.map((route, idx) => (
            <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => _jumpTo(route, idx, routes, jumpTo)}>
                {renderIcon({
                  route,
                  focused: index === idx,
                  tintColor: index === idx ? activeTintColor : inactiveTintColor,
                })}
              </TouchableOpacity>
            </View>
          ))}
        </SafeAreaView>
      )}
    </ThemeContainer>
  );
};

export default BottomTabBarView;
