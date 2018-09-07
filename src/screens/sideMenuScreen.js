import React, { Component } from "react";
import { View, Text } from "react-native";

import { Navigation } from "react-native-navigation";
import LoggedInMenu from "./side-menu/loggedInMenu";
import LoggedOutMenu from "./side-menu/loggedOutMenu";

import { getAuthStatus, getUserData } from "../realm/realm";
import { getUser } from "../providers/steem/dsteem";

class SideMenuScreen extends Component {
    constructor() {
        super();

        this.state = {
            isLoggedIn: false,
            username: "",
        };
    }

    async componentDidMount() {
        let user;
        let userData;
        let isLoggedIn;

        await getAuthStatus().then(res => {
            isLoggedIn = res;
        });

        if (isLoggedIn == true) {
            await getUserData().then(res => {
                user = Array.from(res);
            });

            this.setState({
                username: user[0].username,
                isLoggedIn: isLoggedIn,
                isLoading: false,
            });
        } else {
            await this.setState({
                isLoggedIn: false,
            });
        }
    }

    render() {
        return (
            <View style={styles.root}>
                {this.state.isLoggedIn ? (
                    <LoggedInMenu user={this.state.username} />
                ) : (
                    <LoggedOutMenu />
                )}
            </View>
        );
    }
}
module.exports = SideMenuScreen;

const styles = {
    root: {
        flexGrow: 1,
        backgroundColor: "#f5fcff",
    },
};
