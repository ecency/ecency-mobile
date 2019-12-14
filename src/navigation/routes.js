import React from 'react';
import { createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';

// Constants
import ROUTES from '../constants/routeNames';
import scalePx from '../utils/scalePx';

// Components
import { Icon, IconContainer } from '../components/icon';
import { PostButton, BottomTabBar, SideMenu } from '../components';

// Screens
import {
  Bookmarks,
  Boost,
  Drafts,
  Editor,
  Feed,
  Follows,
  Login,
  Notification,
  Post,
  Profile,
  ProfileEdit,
  Reblogs,
  Redeem,
  SearchResult,
  Settings,
  SpinGame,
  Transfer,
  Voters,
  Wallet,
} from '../screens';

const bottomTabNavigator = createBottomTabNavigator(
  {
    [ROUTES.TABBAR.FEED]: {
      screen: Feed,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon iconType="MaterialIcons" name="view-day" color={tintColor} size={scalePx(26)} />
        ),
      }),
    },
    [ROUTES.TABBAR.NOTIFICATION]: {
      screen: Notification,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <IconContainer
            isBadge
            badgeType="notification"
            iconType="MaterialIcons"
            name="notifications"
            color={tintColor}
            size={scalePx(26)}
          />
        ),
      }),
    },
    [ROUTES.TABBAR.POST_BUTTON]: {
      screen: () => null,
      navigationOptions: {
        tabBarIcon: () => <PostButton />,
      },
    },
    [ROUTES.TABBAR.WALLET]: {
      screen: Wallet,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon
            iconType="MaterialIcons"
            name="account-balance-wallet"
            color={tintColor}
            size={scalePx(26)}
          />
        ),
      }),
    },
    [ROUTES.TABBAR.PROFILE]: {
      screen: Profile,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon iconType="MaterialIcons" name="person" color={tintColor} size={scalePx(26)} />
        ),
      }),
    },
  },
  {
    tabBarComponent: props => <BottomTabBar {...props} />,
    tabBarOptions: {
      showLabel: false,
      activeTintColor: '#f6f6f6',
      inactiveTintColor: '#c1c5c7',
    },
  },
);

const mainNavigation = createDrawerNavigator(
  { [ROUTES.SCREENS.FEED]: { screen: bottomTabNavigator } },
  { contentComponent: SideMenu },
);

const stackNavigator = createStackNavigator(
  {
    [ROUTES.DRAWER.MAIN]: { screen: mainNavigation },
    [ROUTES.SCREENS.PROFILE]: { screen: Profile },
    [ROUTES.SCREENS.PROFILE_EDIT]: { screen: ProfileEdit },
    [ROUTES.SCREENS.POST]: { screen: Post },
    [ROUTES.SCREENS.EDITOR]: { screen: Editor },
    [ROUTES.SCREENS.VOTERS]: { screen: Voters },
    [ROUTES.SCREENS.FOLLOWS]: { screen: Follows },
    [ROUTES.SCREENS.SETTINGS]: { screen: Settings },
    [ROUTES.SCREENS.DRAFTS]: { screen: Drafts },
    [ROUTES.SCREENS.BOOKMARKS]: { screen: Bookmarks },
    [ROUTES.SCREENS.SEARCH_RESULT]: { screen: SearchResult },
    [ROUTES.SCREENS.TRANSFER]: { screen: Transfer },
    [ROUTES.SCREENS.BOOST]: { screen: Boost },
    [ROUTES.SCREENS.REDEEM]: { screen: Redeem },
    [ROUTES.SCREENS.REBLOGS]: { screen: Reblogs },
    [ROUTES.SCREENS.SPIN_GAME]: { screen: SpinGame },
  },
  { headerMode: 'none' },
);

export default createSwitchNavigator({
  stackNavigator,
  [ROUTES.SCREENS.LOGIN]: { screen: Login },
});
