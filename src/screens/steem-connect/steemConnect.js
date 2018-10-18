import React, { Component } from 'react';
import { View, WebView } from 'react-native';
import { loginWithSC2 } from '../../providers/steem/auth';
import { steemConnectOptions } from './config';

// Constants
import { default as ROUTES } from '../../constants/routeNames';

export default class SteemConnect extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onNavigationStateChange(event) {
    let accessToken;
    const { navigation } = this.props;

    if (event.url.indexOf('?access_token=') > -1) {
      this.webview.stopLoading();
      try {
        accessToken = event.url.match(/\?(?:access_token)\=([\S\s]*?)\&/)[1];
      } catch (error) {
        console.log(error);
      }
      console.log(accessToken);
      loginWithSC2(accessToken, 'pinCode')
        .then((result) => {
          console.log(result);
          if (result) {
            navigation.navigate(ROUTES.SCREENS.PINCODE);
          } else {
            // TODO: Error alert (Toast Message)
            console.log('loginWithSC2 error');
          }
        })
        .catch((error) => {
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
              steemConnectOptions.redirect_uri,
            )}&${encodeURIComponent(steemConnectOptions.scope)}`,
          }}
          onNavigationStateChange={this.onNavigationStateChange.bind(this)}
          ref={(ref) => {
            this.webview = ref;
          }}
        />
      </View>
    );
  }
}
