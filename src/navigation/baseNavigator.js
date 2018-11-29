import React from 'react';
import { createBottomTabNavigator } from 'react-navigation';

// Constants
import ROUTES from '../constants/routeNames';

// Components
import { Icon, IconContainer } from '../components/icon';
import {
  Home, Notification, Profile, RootComponent, Messages,
} from '../screens';
import { PostButton } from '../components/postButton';
import { BottomTabBar } from '../components/bottomTabBar';

const BaseNavigator = createBottomTabNavigator(
  {
    [ROUTES.TABBAR.HOME]: {
      screen: RootComponent()(Home),
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon
            iconType="FontAwesome"
            style={{ padding: 20 }}
            name="list"
            color={tintColor}
            size={20}
          />
        ),
      }),
    },
    [ROUTES.TABBAR.NOTIFICATION]: {
      screen: RootComponent()(Notification),
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <IconContainer
            isBadge
            badgeType="notification"
            iconType="FontAwesome"
            name="bell-o"
            color={tintColor}
            size={20}
            style={{ padding: 20 }}
          />
        ),
      }),
    },
    [ROUTES.TABBAR.POSTBUTTON]: {
      screen: () => null,
      navigationOptions: () => ({
        tabBarIcon: <PostButton />,
      }),
    },
    [ROUTES.TABBAR.MESSAGES]: {
      screen: RootComponent()(Messages),
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon
            iconType="FontAwesome"
            style={{ padding: 20 }}
            name="envelope-o"
            color={tintColor}
            size={20}
          />
        ),
      }),
    },
    [ROUTES.TABBAR.PROFILE]: {
      screen: RootComponent()(Profile),
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (
          <Icon
            iconType="FontAwesome"
            style={{ padding: 20 }}
            name="credit-card"
            color={tintColor}
            size={20}
          />
        ),
      }),
    },
  },
  {
    tabBarComponent: props => <BottomTabBar {...props} />,
    tabBarOptions: {
      showLabel: false,
      activeTintColor: '#357ce6',
      inactiveTintColor: '#c1c5c7',
      style: {},
      tabStyle: {},
    },
  },
);

export { BaseNavigator };
