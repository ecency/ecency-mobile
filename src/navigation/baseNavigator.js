import React from 'react';
import { createBottomTabNavigator } from 'react-navigation-tabs';

// Constants
import ROUTES from '../constants/routeNames';

// Components
import { Icon, IconContainer } from '../components/icon';
import { Feed, Notification, Profile, Wallet } from '../screens';
import { PostButton, BottomTabBar } from '../components';

const BaseNavigator = createBottomTabNavigator(
  {
    [ROUTES.TABBAR.FEED]: {
      screen: Feed,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon iconType="MaterialIcons" name="view-day" color={tintColor} size={26} />
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
            size={26}
          />
        ),
      }),
    },
    [ROUTES.TABBAR.POST_BUTTON]: {
      screen: () => null,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => <PostButton />,
      },
    },
    [ROUTES.TABBAR.WALLET]: {
      screen: Wallet,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon iconType="MaterialIcons" name="account-balance-wallet" color={tintColor} size={26} />
        ),
      }),
    },
    [ROUTES.TABBAR.PROFILE]: {
      screen: Profile,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon iconType="MaterialIcons" name="person-outline" color={tintColor} size={26} />
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
      style: {},
      tabStyle: {},
    },
  },
);

export { BaseNavigator };
