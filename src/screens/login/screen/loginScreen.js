import React, { Component } from 'react';
import { View, Linking, StatusBar } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';

// Actions
import { addPassiveAccount } from '../../../redux/actions/accountAction';
import { login as loginAction, logout as logoutAction } from '../../../redux/actions/applicationActions';

// Internal Components
import { FormInput } from '../../../components/formInput';
import { TextButton } from '../../../components/buttons';
import { InformationArea } from '../../../components/informationArea';
import { Login } from '../../../providers/steem/auth';
import { LoginHeader } from '../../../components/loginHeader';
import { MainButton } from '../../../components/mainButton';
import { TabBar } from '../../../components/tabBar';
import { lookupAccounts } from '../../../providers/steem/dsteem';
import STEEM_CONNECT_LOGO from '../../../assets/steem_connect.png';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './loginStyles';

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    // Navigation.events().bindComponent(this);
    this.state = {
      username: '',
      password: '',
      isLoading: false,
      isUsernameValid: true,
      keyboardIsOpen: false,
    };
  }

  _handleOnPressLogin = () => {
    const { dispatch, navigation } = this.props;
    const { password, username } = this.state;

    this.setState({ isLoading: true });

    Login(username, password)
      .then((result) => {
        if (result) {
          dispatch(addPassiveAccount(result));
          dispatch(loginAction());
          navigation.navigate(ROUTES.SCREENS.PINCODE);
        }
      })
      .catch(() => {
        dispatch(logoutAction());
        this.setState({ isLoading: false });
      });
  };

  _handleUsernameChange = async (username) => {
    await this.setState({ username });
    const validUsers = await lookupAccounts(username);
    const isValid = validUsers.includes(username);

    this.setState({ isUsernameValid: isValid });
  };

  _handleOnPasswordChange = (value) => {
    this.setState({ password: value });
  };

  _handleSignUp = () => {
    Linking.openURL('https://signup.steemit.com/?ref=esteem').catch(err => console.error('An error occurred', err));
  };

  _loginwithSc2 = () => {
    // Navigation.push(this.props.componentId, {
    //   component: {
    //     name: 'navigation.eSteem.SteemConnect',
    //     passProps: {},
    //     options: {
    //       topBar: {
    //         title: {
    //           text: 'Login via SC2',
    //         },
    //       },
    //     },
    //   },
    // });
  };

  render() {
    const { navigation } = this.props;
    const {
      isLoading, username, isUsernameValid, keyboardIsOpen, password,
    } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden translucent />
        <LoginHeader
          isKeyboardOpen={keyboardIsOpen}
          title="Sign in"
          description="To get all the benefits using eSteem"
          onPress={() => this._handleSignUp()}
        />
        <ScrollableTabView
          locked={isLoading}
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={100} // default containerWidth / (numberOfTabs * 4)
              tabUnderlineScaleX={2} // default 3
              activeColor="#357ce6"
              inactiveColor="#222"
            />
          )}
        >
          <View tabLabel="Sign in" style={styles.tabbarItem}>
            <FormInput
              rightIconName="md-at"
              leftIconName="md-close-circle"
              isValid={isUsernameValid}
              onChange={value => this._handleUsernameChange(value)}
              placeholder="Username"
              isEditable
              type="username"
              isFirstImage
              value={username}
            />
            <FormInput
              rightIconName="md-lock"
              leftIconName="md-close-circle"
              isValid={isUsernameValid}
              onChange={value => this._handleOnPasswordChange(value)}
              placeholder="Password or WIF"
              isEditable
              secureTextEntry
              type="password"
            />
            <InformationArea
              description="User credentials are kept locally on the device. Credentials are
                removed upon logout!"
              iconName="ios-information-circle-outline"
            />
            <View style={styles.footerButtons}>
              <TextButton onPress={() => navigation.navigate(ROUTES.DRAWER.MAIN)} text="cancel" />
            </View>
            <MainButton
              wrapperStyle={styles.mainButtonWrapper}
              onPress={this._handleOnPressLogin}
              iconName="md-person"
              iconColor="white"
              text="LOGIN"
              isDisable={!isUsernameValid || password.length < 2 || username.length < 2}
              isLoading={isLoading}
            />
          </View>
          <View tabLabel="SteemConnect" style={styles.steemConnectTab}>
            <InformationArea
              description="If you don't want to keep your password encrypted and saved on your device, you can use Steemconnect."
              iconName="ios-information-circle-outline"
            />
            <MainButton
              wrapperStyle={styles.mainButtonWrapper}
              onPress={() => this._loginwithSc2()}
              iconName="md-person"
              source={STEEM_CONNECT_LOGO}
              text="steem"
              secondText="connect"
            />
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}

export default LoginScreen;
