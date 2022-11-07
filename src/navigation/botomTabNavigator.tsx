import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ROUTES from '../constants/routeNames';
import { BottomTabBar } from '../components';
import { Feed, Notification, Profile, Wallet } from '../screens';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#357ce6',
        tabBarInactiveTintColor: '#c1c5c7',
      }}
    >
      <Tab.Screen
        name={ROUTES.TABBAR.FEED}
        component={Feed}
        initialParams={{
          iconName: 'view-day', // read in bottomTabBarView
        }}
      />

      <Tab.Screen
        name={ROUTES.TABBAR.NOTIFICATION}
        component={Notification}
        initialParams={{
          iconName: 'notifications', // read in bottomTabBarView
        }}
      />

      <Tab.Screen
        name={ROUTES.TABBAR.POST_BUTTON}
        component={EmptyScreen}
        initialParams={{
          iconName: 'pencil', // read in bottomTabBarView
        }}
      />

      <Tab.Screen
        name={ROUTES.TABBAR.WALLET}
        component={Wallet}
        initialParams={{
          iconName: 'account-balance-wallet', // read in bottomTabBarView
        }}
      />

      <Tab.Screen
        name={ROUTES.TABBAR.PROFILE}
        component={Profile}
        initialParams={{
          iconName: 'person', // read in bottomTabBarView
        }}
      />
    </Tab.Navigator>
  );
};

const EmptyScreen = () => null;
