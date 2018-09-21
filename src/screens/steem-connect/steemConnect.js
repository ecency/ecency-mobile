import React, { Component } from "react";
import { View, WebView } from "react-native";
import { loginWithSC2 } from "../../providers/steem/auth";
import { steemConnectOptions } from "./config";
import RNRestart from "react-native-restart";
import { Navigation } from "react-native-navigation";

export default class SteemConnect extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onNavigationStateChange(event) {
        if (event.url && event.url.indexOf("access_token") > -1) {
            let access_token = event.url.match(
                /\?(?:access_token)\=([\S\s]*?)\&/
            )[1];
            if (access_token) {
                loginWithSC2(access_token, "pinCode").then(result => {
                    if (result === true) {
                        // TODO: Handle pinCode and navigate to home page
                    } else {
                        Navigation.dismissModal(this.props.componentId);
                    }
                });
            }
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <WebView
                    onNavigationStateChange={state =>
                        this.onNavigationStateChange(state)
                    }
                    source={{
                        uri: `${steemConnectOptions.base_url}?client_id=${
                            steemConnectOptions.client_id
                        }&redirect_uri=${steemConnectOptions.redirect_uri}&${
                            steemConnectOptions.scope
                        }`,
                    }}
                />
            </View>
        );
    }
}
