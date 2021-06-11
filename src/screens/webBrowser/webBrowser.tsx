import React, { PureComponent } from 'react';
import { View, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

import { injectIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BasicHeader } from '../../components';

class WebBrowser extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  _onNavigationStateChange = (event) => {

  };

  render() {
    const url = this.props.navigation.getParam('url');
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar />
        <BasicHeader
          title="Ecency"
        />
        <WebView
          source={{
            uri: url,
          }}
          onNavigationStateChange={this._onNavigationStateChange}
          ref={(ref) => {
            this.webview = ref;
          }}
        />
      </SafeAreaView>
    );
  }
}



export default injectIntl(withNavigation(WebBrowser));
