import React from 'react';
import { SideMenu } from "../components"
import { BottomTabNavigator } from "./botomTabNavigator"

// Constants
import ROUTES from '../constants/routeNames';
import { createDrawerNavigator } from "@react-navigation/drawer";


const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {

    return (
        <Drawer.Navigator drawerContent={(props) => <SideMenu {...props}/>} >
            <Drawer.Screen name={ROUTES.SCREENS.FEED} component={BottomTabNavigator} />
        </Drawer.Navigator>
    )
}