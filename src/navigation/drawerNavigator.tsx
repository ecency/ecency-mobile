import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SideMenu } from '../components';
import { BottomTabNavigator } from './botomTabNavigator';

// Constants
import ROUTES from '../constants/routeNames';

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <SideMenu {...props} />}
    >
      <Drawer.Screen name={ROUTES.SCREENS.FEED} component={BottomTabNavigator} />
    </Drawer.Navigator>
  );
};
