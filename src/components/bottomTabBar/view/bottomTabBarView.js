import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import get from 'lodash/get';

// Services and Actions
import { updateActiveBottomTab } from '../../../redux/actions/uiAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Container
import { ThemeContainer } from '../../../containers';

// Components
import TabBar from './tabbar';

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
    console.log('updateActiveBottomTab', routes[index].routeName);
    dispatch(updateActiveBottomTab(routes[index].routeName));
  }, [dispatch, index, routes]);

  return (
    <ThemeContainer>
      {({ isDarkTheme }) => (
        <SafeAreaView style={styles.wrapper}>
          <TabBar
            selectedIndex={index}
            circleBackgroundColor="#357ce6"
            backgroundColor={isDarkTheme ? '#2e3d51' : '#f6f6f6'}
            onChange={i => _jumpTo(routes[i], index, routes, jumpTo)}
            activeTintColor={activeTintColor}
            inactiveTintColor={inactiveTintColor}
          >
            {routes.map(route => (
              <TabBar.Item
                icon={renderIcon({
                  route,
                  focused: false,
                  tintColor: inactiveTintColor,
                })}
                selectedIcon={renderIcon({
                  route,
                  focused: true,
                  tintColor: activeTintColor,
                })}
                key={route}
                disabled={route.routeName === ROUTES.TABBAR.POST_BUTTON}
              />
            ))}
          </TabBar>
        </SafeAreaView>
      )}
    </ThemeContainer>
  );
};

export default BottomTabBarView;
