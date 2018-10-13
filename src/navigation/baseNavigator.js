import React from 'react';
import { createBottomTabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Home, Notification, Profile } from '../screens';

import { PostButton } from '../components/postButton';

const BaseNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => <Icon name="list" color={tintColor} size={18} />,
      }),
    },
    Notification: {
      screen: Notification,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => <Icon name="bell-o" color={tintColor} size={18} />,
      }),
    },
    PostButton: {
      screen: () => null,
      navigationOptions: () => ({
        tabBarIcon: <PostButton />,
      }),
    },
    AuthorProfile: {
      screen: Profile,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => <Icon name="envelope-o" color={tintColor} size={18} />,
      }),
    },
    Profile: {
      screen: Profile,
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
