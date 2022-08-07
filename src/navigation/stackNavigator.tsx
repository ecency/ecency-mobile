import React from 'react';

// Constants
import ROUTES from '../constants/routeNames';

import { createStackNavigator } from '@react-navigation/stack';

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
    CoinDetails,
    EditHistoryScreen,
  } from '../screens';
import { DrawerNavigator } from './drawerNavigator';



const Stack = createStackNavigator();


export const StackNavigator = () => {

    return (
        <Stack.Navigator headerMode="none">
            <Stack.Screen name={ROUTES.DRAWER.MAIN} component={DrawerNavigator} />
            {/* <Stack.Screen name={ROUTES.SCREENS.PROFILE} component={Profile} /> 
            <Stack.Screen name={ROUTES.SCREENS.PROFILE_EDIT} component={ProfileEdit} />
            <Stack.Screen
                name={ROUTES.SCREENS.POST}
                component={Post}
                options={{
                    gestureEnabled: true,
                    gestureResponseDistance: { horizontal: 70 },
                }}
            />
            <Stack.Screen name={ROUTES.SCREENS.EDITOR} component={Editor} /> */}
             <Stack.Screen name={ROUTES.SCREENS.VOTERS} component={Voters} />
             {/* <Stack.Screen name={ROUTES.SCREENS.FOLLOWS} component={Follows} /> */}
            <Stack.Screen name={ROUTES.SCREENS.SETTINGS} component={Settings} />
            <Stack.Screen name={ROUTES.SCREENS.DRAFTS} component={Drafts} />
            {/* <Stack.Screen name={ROUTES.SCREENS.BOOKMARKS} component={Bookmarks} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.SEARCH_RESULT} component={SearchResult} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.TAG_RESULT} component={TagResult} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.TRANSFER} component={Transfer} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.BOOST} component={Boost} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.REDEEM} component={Redeem} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.REBLOGS} component={Reblogs} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.SPIN_GAME} component={SpinGame} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.ACCOUNT_BOOST} component={AccountBoost} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.COMMUNITY} component={Community} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.COMMUNITIES} component={Communities} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.WEB_BROWSER} component={WebBrowser} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.REFER} component={ReferScreen} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.COIN_DETAILS} component={CoinDetails} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.EDIT_HISTORY} component={EditHistoryScreen} /> */}

            {/* <Stack.Screen name={ROUTES.SCREENS.REGISTER} component={Register} /> */}
            {/* <Stack.Screen name={ROUTES.SCREENS.LOGIN} component={Login} /> */}
        </Stack.Navigator>
    )
}

