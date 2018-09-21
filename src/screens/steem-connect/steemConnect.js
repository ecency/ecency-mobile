import React, { Component } from "react";
import { View, WebView } from "react-native";
import { loginWithSC2 } from "../../providers/steem/auth";
import { steemConnectOptions } from "./config";
import RNRestart from "react-native-restart";
import { Navigation } from "react-native-navigation";
import { goToAuthScreens } from "../../navigation";

export default class SteemConnect extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onNavigationStateChange(event) {
        let access_token;
        if (event.url.indexOf("?access_token=") > -1) {
            this.webview.stopLoading();
            try {
                access_token = event.url.match(
                    /\?(?:access_token)\=([\S\s]*?)\&/
                )[1];
            } catch (error) {
                console.log(error);
            }

            loginWithSC2(access_token, "pinCode")
                .then(result => {
                    if (result === true) {
                        // TODO: Handle pinCode and navigate to home page
                        goToAuthScreens();
                    } else {
                        // TODO: Error alert (Toast Message)
                        console.log("loginWithSC2 error");
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <WebView
                    source={{
                        uri: `${steemConnectOptions.base_url}?client_id=${
                            steemConnectOptions.client_id
                        }&redirect_uri=${encodeURIComponent(
                            steemConnectOptions.redirect_uri
                        )}&${encodeURIComponent(steemConnectOptions.scope)}`,
                    }}
                    onNavigationStateChange={this.onNavigationStateChange.bind(
                        this
                    )}
                    ref={ref => {
                        this.webview = ref;
                    }}
                />
            </View>
        );
    }
}
