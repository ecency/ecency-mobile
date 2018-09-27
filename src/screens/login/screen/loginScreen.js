import React, { Component } from "react";
import { View, BackHandler, Linking, StatusBar } from "react-native";

import ScrollableTabView from "@esteemapp/react-native-scrollable-tab-view";
import { FormInput } from "../../../components/formInput";
import { GreetingHeaderButton } from "../../../components/buttons";
import { InformationArea } from "../../../components/informationArea";
import { Login } from "../../../providers/steem/auth";
import { LoginHeader } from "../../../components/loginHeader";
import { MainButton } from "../../../components/mainButton";
import { Navigation } from "react-native-navigation";
import { TabBar } from "../../../components/tabBar";
import { addNewAccount } from "../../../redux/actions/accountAction";
import { goToAuthScreens } from "../../../navigation";
import { lookupAccounts } from "../../../providers/steem/dsteem";
import STEEM_CONNECT_LOGO from "../../../assets/steem_connect.png";

// Styles
import styles from "./loginStyles";

class LoginScreen extends Component {
  static get options() {
    return {
      _statusBar: {
        visible: true,
        drawBehind: false,
      },
      topBar: {
        animate: true,
        hideOnScroll: false,
        drawBehind: false,
        noBorder: true,
        visible: true,
        elevation: 0,
        leftButtons: {},
        rightButtons: [
          {
            id: "signup",
            text: "Sign Up",
            color: "#a7adaf",
            marginRight: 50,
          },
        ],
      },
      layout: {
        backgroundColor: "#f5fcff",
      },
      bottomTabs: {
        visible: false,
        drawBehind: true,
      },
    };
  }
  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.handleUsername = this.handleUsername.bind(this);
    this.state = {
      username: "",
      password: "",
      isLoading: false,
      isUsernameValid: true,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", () => {
      Navigation.pop(this.props.componentId);
      return true;
    });
    Linking.getInitialURL().then(url => {
      console.log(url);
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress");
  }

  _handleOnPressLogin = () => {
    const { componentId, dispatch } = this.props;
    const { password, username } = this.state;

    this.setState({ isLoading: true });

    Login(username, password)
      .then(result => {
        if (result) {
          dispatch(addNewAccount(result));
          Navigation.setStackRoot(componentId, {
            component: {
              name: "navigation.eSteem.PinCode",
              options: {
                topBar: {
                  visible: false,
                },
              },
            },
          });
        }
      })
      .catch(err => {
        alert(err);
        this.setState({ isLoading: false });
      });
  };

  handleUsername = async username => {
    await this.setState({ username });
    const validUsers = await lookupAccounts(username);
    await this.setState({ isUsernameValid: validUsers.includes(username) });
  };

  _handleOnPasswordChange = value => {
    this.setState({ password: value });
  };

  _handleSignUp = () => {
    Linking.openURL("https://signup.steemit.com/?ref=esteem").catch(err =>
      console.error("An error occurred", err)
    );
  };

  _loginwithSc2 = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: "navigation.eSteem.SteemConnect",
        passProps: {},
        options: {
          topBar: {
            title: {
              text: "Login via SC2",
            },
          },
        },
      },
    });
  };

  render() {
    const { isLoading, username, isUsernameValid } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <StatusBar hidden translucent />
        <LoginHeader
          isKeyboardOpen={false}
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
              activeColor={"#357ce6"}
              inactiveColor={"#222"}
            />
          )}
        >
          <View tabLabel="Sign in" style={styles.tabbarItem}>
            <FormInput
              rightIconName="md-at"
              leftIconName="md-close-circle"
              isValid={isUsernameValid}
              onChange={value => this.handleUsername(value)}
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
            {/* It will remove */}
            <GreetingHeaderButton onPress={goToAuthScreens} text="cancel" />
            <MainButton
              wrapperStyle={styles.mainButtonWrapper}
              onPress={this._handleOnPressLogin}
              iconName="md-person"
              iconColor="white"
              text="LOGIN"
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
              onPress={this._loginwithSc2}
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
