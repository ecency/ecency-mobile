import React from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';

export class AuthLoadingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.checkAuth();
    }

    // Fetch the login state from storage then navigate to our appropriate place
    checkAuth = async () => {
        isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        this.props.navigation.navigate(isLoggedIn ? 'LoggedIn' : 'LoggedOut');
    };

    // Render any loading content that you like here
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
            </View>
        );
    }
}
