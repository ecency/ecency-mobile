/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from 'react';
import { Dimensions } from 'react-native';
import { createDrawerNavigator, createSwitchNavigator } from 'react-navigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Tabs from './Tabs';
import LoginPage from '../screens/login/Login';

import { LoggedInSideBar } from '../screens/side-menu/LoggedInMenu';
import { LoggedOutSideBar } from '../screens/side-menu/LoggedOutMenu';
import { AuthLoadingScreen } from '../screens/side-menu/AuthLoading';

const LoggedInMenu = createDrawerNavigator(
    {
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
    },
    {
        contentComponent: LoggedInSideBar,
        drawerWidth: Dimensions.get('window').width / 1.2,
    }
);

const LoggedOutMenu = createDrawerNavigator(
    {
        Tabs: {
            screen: Tabs,
        },
        Login: {
            screen: LoginPage,
        },
    },
    {
        contentComponent: LoggedOutSideBar,
        drawerWidth: Dimensions.get('window').width / 1.2,
    }
);

const SwitchNavigator = createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        LoggedIn: LoggedInMenu,
        LoggedOut: LoggedOutMenu,
    },
    {
        initialRouteName: 'AuthLoading',
    }
);

class Navigator extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <SwitchNavigator />;
    }
}

export default Navigator;
