import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

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
  Register,
  SearchResult,
  Settings,
  SpinGame,
  Transfer,
  Voters,
  Wallet,
  AccountBoost,
  TagResult,
  Community,
  Communities,
  WebBrowser,
  ReferScreen,
  CoinDetails,
  EditHistoryScreen,
} from '../screens';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const _tabBarIcon = (name, color) => (
  <Icon
    iconType="MaterialIcons"
    style={{ padding: 15 }}
    name={name}
    color={color}
    size={scalePx(26)}
  />
);

const bottomTabNavigator = (
  <Tab.Navigator
    tabBar={BottomTabBar}
    tabBarOptions={{
      showLabel: false,
      activeTintColor: '#357ce6',
      inactiveTintColor: '#c1c5c7',
    }}
  >
    <Tab.Screen
      name={ROUTES.TABBAR.FEED}
      component={Feed}
      options={{
        tabBarIcon: ({ color }) => _tabBarIcon('view-day', color),
      }}
    />

    <Tab.Screen
      name={ROUTES.TABBAR.NOTIFICATION}
      component={Notification}
      options={{
        tabBarIcon: ({ color }) => (
          <IconContainer
            isBadge
            badgeType="notification"
            iconType="MaterialIcons"
            style={{ padding: 15 }}
            name="notifications"
            color={color}
            size={scalePx(26)}
          />
        ),
      }}
    />

    <Tab.Screen
      name={ROUTES.TABBAR.POST_BUTTON}
      options={{
        tabBarIcon: () => <PostButton />,
      }}
    />

    <Tab.Screen
      name={ROUTES.TABBAR.WALLET}
      component={Wallet}
      options={{
        tabBarIcon: ({ color }) => _tabBarIcon('account-balance-wallet', color),
      }}
    />

    <Tab.Screen
      name={ROUTES.TABBAR.PROFILE}
      component={Profile}
      options={{
        tabBarIcon: ({ color }) => _tabBarIcon('person', color),
      }}
    />
  </Tab.Navigator>
);

const mainNavigation = (
  <Drawer.Navigator>
    <Drawer.Screen name={ROUTES.SCREENS.FEED} component={bottomTabNavigator} />

    <Drawer.Screen name="contentComponent" component={SideMenu} />
  </Drawer.Navigator>
);

const AppNavigator = (
  <Stack.Navigator headerMode="none">
    <Stack.Screen name={ROUTES.DRAWER.MAIN} component={mainNavigation} />
    <Stack.Screen name={ROUTES.DRAWER.PROFILE} component={Profile} />
    <Stack.Screen name={ROUTES.DRAWER.PROFILE_EDIT} component={ProfileEdit} />
    <Stack.Screen
      name={ROUTES.DRAWER.POST}
      component={Post}
      options={{
        gestureEnabled: true,
        gestureResponseDistance: { horizontal: 70 },
      }}
    />
    <Stack.Screen name={ROUTES.SCREENS.EDITOR} component={Editor} />
    <Stack.Screen name={ROUTES.SCREENS.VOTERS} component={Voters} />
    <Stack.Screen name={ROUTES.SCREENS.FOLLOWS} component={Follows} />
    <Stack.Screen name={ROUTES.SCREENS.SETTINGS} component={Settings} />
    <Stack.Screen name={ROUTES.SCREENS.DRAFTS} component={Drafts} />
    <Stack.Screen name={ROUTES.SCREENS.BOOKMARKS} component={Bookmarks} />
    <Stack.Screen name={ROUTES.SCREENS.SEARCH_RESULT} component={SearchResult} />
    <Stack.Screen name={ROUTES.SCREENS.TAG_RESULT} component={TagResult} />
    <Stack.Screen name={ROUTES.SCREENS.TRANSFER} component={Transfer} />
    <Stack.Screen name={ROUTES.SCREENS.BOOST} component={Boost} />
    <Stack.Screen name={ROUTES.SCREENS.REDEEM} component={Redeem} />
    <Stack.Screen name={ROUTES.SCREENS.REBLOGS} component={Reblogs} />
    <Stack.Screen name={ROUTES.SCREENS.SPIN_GAME} component={SpinGame} />
    <Stack.Screen name={ROUTES.SCREENS.ACCOUNT_BOOST} component={AccountBoost} />
    <Stack.Screen name={ROUTES.SCREENS.COMMUNITY} component={Community} />
    <Stack.Screen name={ROUTES.SCREENS.COMMUNITIES} component={Communities} />
    <Stack.Screen name={ROUTES.SCREENS.WEB_BROWSER} component={WebBrowser} />
    <Stack.Screen name={ROUTES.SCREENS.REFER} component={ReferScreen} />
    <Stack.Screen name={ROUTES.SCREENS.COIN_DETAILS} component={CoinDetails} />
    <Stack.Screen name={ROUTES.SCREENS.EDIT_HISTORY} component={EditHistoryScreen} />

    <Stack.Screen name={ROUTES.SCREENS.REGISTER} component={Register} />
    <Stack.Screen name={ROUTES.SCREENS.LOGIN} component={Login} />
  </Stack.Navigator>
);

export default AppNavigator; //TODO: create separation of main, register and login perspectives
