import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ROUTES from '../constants/routeNames';
import { BottomTabBar } from '../components';
import { Chats, Feed, Notification, Wallet } from '../screens';
import Waves from '../screens/waves';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      backBehavior="initialRoute"
      initialRouteName={ROUTES.TABBAR.FEED}
      screenOptions={{
        tabBarStyle: {
          overflow: 'visible',
          position: 'absolute',
        },
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
          iconName: 'home-outline', // read in bottomTabBarView (MaterialCommunityIcons)
        }}
      />

      <Tab.Screen
        name={ROUTES.TABBAR.WAVES}
        component={Waves}
        initialParams={{
          // WAVES renders a custom wavy-dash (〰️) SVG in bottomTabBarView; this
          // name is only a MaterialCommunityIcons fallback if that override is removed.
          iconName: 'waves', // read in bottomTabBarView
        }}
      />

      <Tab.Screen
        name={ROUTES.TABBAR.CHATS}
        component={Chats}
        initialParams={{
          iconName: 'chat-outline', // read in bottomTabBarView (MaterialCommunityIcons)
        }}
      />

      <Tab.Screen
        name={ROUTES.TABBAR.WALLET}
        component={Wallet as any}
        initialParams={{
          iconName: 'wallet-outline', // read in bottomTabBarView (MaterialCommunityIcons)
        }}
      />

      <Tab.Screen
        name={ROUTES.TABBAR.NOTIFICATION}
        component={Notification as any}
        initialParams={{
          iconName: 'bell-outline', // read in bottomTabBarView (MaterialCommunityIcons)
        }}
      />
    </Tab.Navigator>
  );
};
