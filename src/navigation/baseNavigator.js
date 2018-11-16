import React from 'react';
import { createBottomTabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  Home, Notification, Profile, RootComponent, Messages,
} from '../screens';

import { PostButton } from '../components/postButton';
import NotificationButton from '../components/notificationButton';

const BaseNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: RootComponent()(Home),
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => <Icon name="list" color={tintColor} size={18} />,
      }),
    },
    Notification: {
      screen: RootComponent()(Notification),
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => <NotificationButton color={tintColor} />,
      }),
    },
    PostButton: {
      screen: () => null,
      navigationOptions: () => ({
        tabBarIcon: <PostButton />,
      }),
    },
    Messages: {
      screen: RootComponent()(Messages),
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => <Icon name="envelope-o" color={tintColor} size={18} />,
      }),
    },
    Profile: {
      screen: RootComponent()(Profile),
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => <Icon name="credit-card" color={tintColor} size={18} />,
      }),
    },
  },
  {
    tabBarOptions: {
      showLabel: false,
      activeTintColor: '#357ce6',
      inactiveTintColor: '#c1c5c7',
      style: {
        backgroundColor: '#fff',
        height: 56,
        borderWidth: 0.1,
        shadowColor: '#b0b0b0',
        shadowOffset: { height: 0 },
        shadowOpacity: 0.5,
      },
      tabStyle: {},
    },
  },
);

// const defaultGetStateForAction = BaseNavigator.router.getStateForAction;

// BaseNavigator.router.getStateForAction = (action, state) => {
//     if (action.type === NavigationActions.NAVIGATE && action.routeName === 'Adding') {
//         return null;
//     }
//
//     return defaultGetStateForAction(action, state);
// };
export { BaseNavigator };
