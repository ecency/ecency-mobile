import React from 'react';
import {
    AsyncStorage,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    View,
    Dimensions,
} from 'react-native';
import { createDrawerNavigator, createSwitchNavigator } from 'react-navigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Tabs from '../../components/Tabs';
import { LoggedInSideBar } from './LoggedInMenu';
import { LoggedOutSideBar } from './LoggedOutMenu';
import LoginPage from '../login/Login';

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
            navigationOptions: ({ navigation }) => ({}),
        },
    },
    {
        contentComponent: LoggedOutSideBar,
        drawerWidth: Dimensions.get('window').width / 1.2,
    }
);

class AuthLoadingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.checkAuth();
    }

    // Fetch the login state from storage then navigate to our appropriate place
    checkAuth = async () => {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        this.props.navigation.navigate(
            isLoggedIn === null ? 'LoggedOut' : 'LoggedIn'
        );
    };

    // Render any loading content that you like here
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
                <StatusBar barStyle="default" />
            </View>
        );
    }
}
export default createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        LoggedIn: LoggedInMenu,
        LoggedOut: LoggedOutMenu,
    },
    {
        initialRouteName: 'AuthLoading',
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 32,
    },
});
