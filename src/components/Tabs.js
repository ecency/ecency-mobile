import {
  createStackNavigator,
  createBottomTabNavigator
} from 'react-navigation';

import React from 'react';
import { StyleSheet, Dimensions, Text } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import EditorPage from '../screens/editor/editor';
import FeedPage from '../screens/home/feed';
import ProfilePage from '../screens/profile/profile';
import WalletPage from '../screens/wallet/wallet';
import NotificationPage from '../screens/notifications/notification';
import SinglePostPage from '../screens/single-post/Post';
import LoginPage from '../screens/login/Login';
import HTML from 'react-native-render-html';

const HomeScreen = ({ navigation }) => (
  <FeedPage navigation={navigation}></FeedPage>
);

HomeScreen.navigationOptions = {
  tabBarLabel: 'Home',
  title: 'Home',
  tabBarIcon: ({ tintColor, focused }) => (
    <MaterialCommunityIcons
      name={focused ? 'home' : 'home'}
      size={26}
      style={{ color: tintColor }}
    />
  ),
};

const ProfileScreen = ({ navigation }) => (
  <ProfilePage navigation={navigation}></ProfilePage>
);

ProfileScreen.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: ({ tintColor, focused }) => (
    <Ionicons
      name={focused ? 'md-contact' : 'md-contact'}
      size={26}
      style={{ color: tintColor }}
    />
  ),
};

const EditorScreen = ({ navigation }) => (
  <EditorPage navigation={navigation}></EditorPage>
);

EditorScreen.navigationOptions = {
  tabBarLabel: 'Editor',
  tabBarIcon: ({ tintColor, focused }) => (
    <Entypo
      name={focused ? 'pencil' : 'pencil'}
      size={26}
      style={styles.post}
      style={{ color: tintColor }}
    />
  ),
};

const WalletScreen = ({ navigation }) => (
  <WalletPage navigation={navigation}></WalletPage>
);

WalletScreen.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ tintColor, focused }) => (
    <Entypo
      name={focused ? 'wallet' : 'wallet'}
      size={26}
      style={{ color: tintColor }}
    />
  ),
};

const NotificationScreen = ({ navigation }) => (
  <NotificationPage  navigation={navigation}></NotificationPage>
);

NotificationScreen.navigationOptions = {
  tabBarLabel: 'Notifications',
  tabBarIcon: ({ tintColor, focused }) => (
    <Ionicons
      name={focused ? 'ios-notifications' : 'ios-notifications'}
      size={26}
      style={{ color: tintColor }}
    />
  ),
};

const SinglePostScreen = ({ navigation }) => (
  <SinglePostPage navigation={navigation}></SinglePostPage>
);

const LoginScreen = ({ navigation }) => (
  <LoginPage navigation={navigation}></LoginPage>
);

const BottomTabs = createBottomTabNavigator(
  {
    Home: {
      screen: HomeScreen,
      path: '',
    },
    Profile: {
      screen: ProfileScreen,
      path: 'profile',
    },
    Editor: {
      screen: EditorScreen,
      path: 'editor',
    },
    Wallet: {
      screen: WalletScreen,
      path: 'wallet',
    },
    Notifications: {
      screen: NotificationScreen,
      path: 'settings',
    }
  },
  {
    tabBarOptions: {
      activeTintColor: '#373c3f',
      inactiveTintColor: '#AFB1B3',
      lazy: false,
      style: {
        backgroundColor: 'white',
        borderTopColor: '#dedede',
        borderWidth: 1
      },
      showLabel: false,
    }
  },
);

BottomTabs.navigationOptions = ({navigation})=> ({
      header: null,
      style: {
      backgroundColor: 'white',
    },
});

const StacksOverTabs = createStackNavigator({
  Root: {
    screen: BottomTabs,
  },
  Post: {
    screen: SinglePostScreen,
    path: '/post',
    navigationOptions: ({ navigation }) => ({
      header: null
    }),
  },
  Login: {
    screen: LoginPage,
    path: '/login',
  }
});


class Tabs extends React.Component {
  static router = StacksOverTabs.router;
  _s0;
  _s1;
  _s2;
  _s3;

  componentDidMount() {
    this._s0 = this.props.navigation.addListener('willFocus', this._onAction);
    this._s1 = this.props.navigation.addListener('didFocus', this._onAction);
    this._s2 = this.props.navigation.addListener('willBlur', this._onAction);
    this._s3 = this.props.navigation.addListener('didBlur', this._onAction);
  }
  componentWillUnmount() {
    this._s0.remove();
    this._s1.remove();
    this._s2.remove();
    this._s3.remove();
  }
  _onAction = a => {
    console.log('TABS EVENT', a.type, a);
  };
  render() {
    return <StacksOverTabs navigation={this.props.navigation} />;
  }
}

const styles = StyleSheet.create({
  post: {
    borderWidth: 22,
    borderColor: 'blue',
  }
});


export default Tabs;
