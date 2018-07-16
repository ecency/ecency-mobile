import React from 'react';
import { Platform, ScrollView } from 'react-native';
import { createDrawerNavigator } from 'react-navigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Tabs from '../components/Tabs';
import ProfilePage from './profile/profile';

const Drawer = createDrawerNavigator({
  Tabs: {
    screen: Tabs,
    navigationOptions: {
      drawer: () => ({
        label: 'Home',
        icon: ({ tintColor }) => (
          <MaterialIcons
            name="Home"
            size={24}
            style={{ color: tintColor }}
          />
        ),
      }),
    },
  },
  Profile: {
    screen: Tabs,
    navigationOptions: {
      drawer: () => ({
        label: 'Profile',
        icon: ({ tintColor }) => (
          <MaterialIcons
            name="user"
            size={24}
            style={{ color: tintColor }}
          />
        ),
      }),
    },
  },
});

export default Drawer;
