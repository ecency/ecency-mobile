import React from 'react';

// Constants
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ROUTES from '../constants/routeNames';

// Screens
import {
  Bookmarks,
  Boost,
  Drafts,
  Editor,
  Follows,
  Login,
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
  AccountBoost,
  TagResult,
  Community,
  Communities,
  WebBrowser,
  ReferScreen,
  AssetDetails,
  EditHistoryScreen,
  WelcomeScreen,
  PinCode,
  AssetsSelect
} from '../screens';
import { DrawerNavigator } from './drawerNavigator';

const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <MainStack.Screen name={ROUTES.DRAWER.MAIN} component={DrawerNavigator} />
      <MainStack.Screen name={ROUTES.SCREENS.PROFILE} component={Profile} />
      <MainStack.Screen name={ROUTES.SCREENS.PROFILE_EDIT} component={ProfileEdit} />
      <MainStack.Screen name={ROUTES.SCREENS.SETTINGS} component={Settings} />
      <MainStack.Screen name={ROUTES.SCREENS.DRAFTS} component={Drafts} />
      <MainStack.Screen name={ROUTES.SCREENS.BOOKMARKS} component={Bookmarks} />
      <MainStack.Screen name={ROUTES.SCREENS.SEARCH_RESULT} component={SearchResult} />
      <MainStack.Screen name={ROUTES.SCREENS.TAG_RESULT} component={TagResult} />
      <MainStack.Screen name={ROUTES.SCREENS.BOOST} component={Boost} />
      <MainStack.Screen name={ROUTES.SCREENS.REDEEM} component={Redeem} />
      <MainStack.Screen name={ROUTES.SCREENS.SPIN_GAME} component={SpinGame} />
      <MainStack.Screen name={ROUTES.SCREENS.ACCOUNT_BOOST} component={AccountBoost} />
      <MainStack.Screen name={ROUTES.SCREENS.COMMUNITY} component={Community} />
      <MainStack.Screen name={ROUTES.SCREENS.COMMUNITIES} component={Communities} />
      <MainStack.Screen name={ROUTES.SCREENS.REFER} component={ReferScreen} />
      <MainStack.Screen name={ROUTES.SCREENS.ASSET_DETAILS} component={AssetDetails} />
      <MainStack.Screen name={ROUTES.SCREENS.EDIT_HISTORY} component={EditHistoryScreen} />
      <MainStack.Screen name={ROUTES.SCREENS.POST} component={Post} />
      <MainStack.Group screenOptions={{ animation: 'slide_from_bottom' }}>
        <MainStack.Screen name={ROUTES.SCREENS.REBLOGS} component={Reblogs} />
        <MainStack.Screen name={ROUTES.SCREENS.VOTERS} component={Voters} />
        <MainStack.Screen name={ROUTES.SCREENS.FOLLOWS} component={Follows} />
        <MainStack.Screen name={ROUTES.SCREENS.TRANSFER} component={Transfer} />
        <MainStack.Screen name={ROUTES.SCREENS.EDITOR} component={Editor} />
        <MainStack.Screen 
          name={ROUTES.MODALS.ASSETS_SELECT} 
          component={AssetsSelect} 
          options={{presentation:'modal'}} 
        /> 
      </MainStack.Group>
    </MainStack.Navigator>
  );
};

export const StackNavigator = ({ initRoute }) => {
  return (
    <RootStack.Navigator
      initialRouteName={initRoute}
      screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}
    >
      <RootStack.Screen name={ROUTES.STACK.MAIN} component={MainStackNavigator} />

      <RootStack.Screen name={ROUTES.SCREENS.REGISTER} component={Register} />
      <RootStack.Screen name={ROUTES.SCREENS.LOGIN} component={Login} />
      <RootStack.Screen name={ROUTES.SCREENS.WELCOME} component={WelcomeScreen} />
      <MainStack.Screen name={ROUTES.SCREENS.WEB_BROWSER} component={WebBrowser} />
      <RootStack.Screen
        name={ROUTES.SCREENS.PINCODE}
        options={{ gestureEnabled: false }}
        component={PinCode}
      />
    </RootStack.Navigator>
  );
};
