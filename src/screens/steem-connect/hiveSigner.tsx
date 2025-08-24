import React, { PureComponent } from 'react';
import { View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { injectIntl } from 'react-intl';
import { loginWithSC2 } from '../../providers/hive/auth';
import { hsOptions } from '../../constants/hsOptions';

// Actions
import {
  addOtherAccount,
  setPrevLoggedInUsers,
  updateCurrentAccount,
} from '../../redux/actions/accountAction';
import { login as loginAction } from '../../redux/actions/applicationActions';

// Constants
import { default as ROUTES } from '../../constants/routeNames';
import persistAccountGenerator from '../../utils/persistAccountGenerator';
import { fetchSubscribedCommunities } from '../../redux/actions/communitiesAction';

class HiveSigner extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  // update previously loggedin users list,
  _updatePrevLoggedInUsersList = (username) => {
    const { dispatch, prevLoggedInUsers } = this.props;
    if (prevLoggedInUsers && prevLoggedInUsers.length > 0) {
      const userIndex = prevLoggedInUsers.findIndex((el) => el?.username === username);
      if (userIndex > -1) {
        const updatedPrevLoggedInUsers = [...prevLoggedInUsers];
        updatedPrevLoggedInUsers[userIndex] = { username, isLoggedOut: false };
        dispatch(setPrevLoggedInUsers(updatedPrevLoggedInUsers));
      } else {
        const u = { username, isLoggedOut: false };
        dispatch(setPrevLoggedInUsers([...prevLoggedInUsers, u]));
      }
    } else {
      const u = { username, isLoggedOut: false };
      dispatch(setPrevLoggedInUsers([u]));
    }
  };

  _onNavigationStateChange = (event) => {
    let code;
    const { intl, dispatch, handleOnModalClose, isPinCodeOpen, navigation } = this.props;
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
        loginWithSC2(code[1])
          .then((result) => {
            if (result) {
              const persistAccountData = persistAccountGenerator(result);

              dispatch(updateCurrentAccount({ ...result }));
              dispatch(fetchSubscribedCommunities(result.username));
              dispatch(addOtherAccount({ ...persistAccountData }));
              dispatch(loginAction(true));
              this._updatePrevLoggedInUsersList(result.username);

              if (isPinCodeOpen) {
                navigation.navigate({
                  name: ROUTES.SCREENS.PINCODE,
                  params: {
                    accessToken: result.accessToken,
                    navigateTo: ROUTES.DRAWER.MAIN,
                  },
                });
              } else {
                navigation.navigate({
                  name: ROUTES.DRAWER.MAIN,
                  params: { accessToken: result.accessToken },
                });
              }
            } else {
              throw new Error('alert.unknow_error');
            }
          })
          .catch((error) => {
            Alert.alert(
              intl.formatMessage({ id: 'alert.fail' }),
              intl.formatMessage({
                id: error.message,
              }),
            );
          });
      }
    }
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
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
  prevLoggedInUsers: state.account.prevLoggedInUsers,
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  return <HiveSigner {...props} navigation={navigation} />;
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
