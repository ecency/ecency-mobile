import React, { PureComponent } from 'react';
import { View, Alert, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';

import { loginWithSC2 } from '../../providers/hive/auth';
import { hsOptions } from '../../constants/hsOptions';

// Actions
import { addOtherAccount, updateCurrentAccount } from '../../redux/actions/accountAction';
import { login as loginAction, openPinCodeModal } from '../../redux/actions/applicationActions';

// Constants
import { default as ROUTES } from '../../constants/routeNames';
import persistAccountGenerator from '../../utils/persistAccountGenerator';

class HiveSigner extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  _onNavigationStateChange = (event) => {
    let code;
    const { dispatch, handleOnModalClose, intl, isPinCodeOpen, navigation } = this.props;
    const { isLoading } = this.state;
    if (event.url.indexOf('?code=') > -1) {
      this.webview.stopLoading();
      try {
        code = event.url.match(/code=([^&]*)/);
      } catch (error) {
        // TODO: return
      }

      if (!isLoading) {
        this.setState({ isLoading: true });
        handleOnModalClose();
        loginWithSC2(code[1], isPinCodeOpen)
          .then((result) => {
            if (result) {
              const persistAccountData = persistAccountGenerator(result);

              dispatch(updateCurrentAccount({ ...result }));
              dispatch(addOtherAccount({ ...persistAccountData }));
              dispatch(loginAction(true));

              if (isPinCodeOpen) {
                dispatch(
                  openPinCodeModal({
                    accessToken: result.accessToken,
                    navigateTo: ROUTES.DRAWER.MAIN,
                  }),
                );
              } else {
                navigation.navigate({
                  routeName: ROUTES.DRAWER.MAIN,
                  params: { accessToken: result.accessToken },
                });
              }
            } else {
              // TODO: Error alert (Toast Message)
            }
          })
          .catch((error) => {
            Alert.alert(
              'Error',
              //intl.formatMessage({ id:
              error,
              //}),
            );
            // TODO: return
          });
      }
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden translucent />
        <WebView
          source={{
            uri: `${hsOptions.base_url}oauth2/authorize?client_id=${
              hsOptions.client_id
            }&redirect_uri=${encodeURIComponent(
              hsOptions.redirect_uri,
            )}&response_type=code&scope=${encodeURIComponent(hsOptions.scope)}`,
          }}
          onNavigationStateChange={this._onNavigationStateChange}
          ref={(ref) => {
            this.webview = ref;
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default injectIntl(connect(mapStateToProps)(withNavigation(HiveSigner)));
