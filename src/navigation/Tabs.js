import {
    createStackNavigator,
    createBottomTabNavigator,
} from "react-navigation";

import React from "react";
import { StyleSheet } from "react-native";

// ICONS
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// PAGES
import EditorPage from "../screens/editor/editor";
import ProfilePage from "../screens/profile/profile";
import HomePage from "../screens/home/home";
import WalletPage from "../screens/wallet/wallet";
import NotificationPage from "../screens/notifications/notification";
import SinglePostPage from "../screens/single-post/Post";
import LoginPage from "../screens/login/Login";
import AuthorPage from "../screens/author-profile/Author";
import DiscoverPage from "../screens/discover/Discover";
import ReplyPage from "../components/reply/Reply";

const HomeScreen = ({ navigation }) => <HomePage navigation={navigation} />;

HomeScreen.navigationOptions = {
    tabBarLabel: "Home",
    title: "Home",
    tabBarIcon: ({ tintColor, focused }) => (
        <MaterialCommunityIcons
            name={focused ? "home" : "home"}
            size={26}
            style={{ color: tintColor }}
        />
    ),
};

const ProfileScreen = ({ navigation }) => (
    <ProfilePage navigation={navigation} />
);

ProfileScreen.navigationOptions = {
    tabBarLabel: "Profile",
    tabBarIcon: ({ tintColor, focused }) => (
        <Ionicons
            name={focused ? "md-contact" : "md-contact"}
            size={26}
            style={{ color: tintColor }}
        />
    ),
};

const EditorScreen = ({ navigation }) => <EditorPage navigation={navigation} />;

EditorScreen.navigationOptions = {
    tabBarLabel: "Editor",
    tabBarIcon: ({ tintColor, focused }) => (
        <Entypo
            name={focused ? "pencil" : "pencil"}
            size={26}
            style={styles.post}
            style={{ color: tintColor }}
        />
    ),
};

const WalletScreen = ({ navigation }) => <WalletPage navigation={navigation} />;

WalletScreen.navigationOptions = {
    tabBarLabel: "Settings",
    tabBarIcon: ({ tintColor, focused }) => (
        <Entypo
            name={focused ? "wallet" : "wallet"}
            size={26}
            style={{ color: tintColor }}
        />
    ),
};

const NotificationScreen = ({ navigation }) => (
    <NotificationPage navigation={navigation} />
);

NotificationScreen.navigationOptions = {
    tabBarLabel: "Notifications",
    tabBarIcon: ({ tintColor, focused }) => (
        <Ionicons
            name={focused ? "ios-notifications" : "ios-notifications"}
            size={26}
            style={{ color: tintColor, alignSelf: "center" }}
        />
    ),
};

const SinglePostScreen = ({ navigation }) => (
    <SinglePostPage navigation={navigation} />
);

const LoginScreen = ({ navigation }) => <LoginPage navigation={navigation} />;

const AuthorScreen = ({ navigation }) => <AuthorPage navigation={navigation} />;

const DiscoverScreen = ({ navigation }) => (
    <DiscoverPage navigation={navigation} />
);

const ReplyScreen = ({ navigation }) => <ReplyPage navigation={navigation} />;

const BottomTabs = createBottomTabNavigator(
    {
        Home: {
            screen: HomeScreen,
            path: "",
        },
        Profile: {
            screen: ProfileScreen,
            path: "profile",
        },
        Editor: {
            screen: EditorScreen,
            path: "editor",
        },
        Wallet: {
            screen: WalletScreen,
            path: "wallet",
        },
        Notifications: {
            screen: NotificationScreen,
            path: "settings",
        },
    },
    {
        lazy: false,
        tabBarOptions: {
            activeTintColor: "#373c3f",
            inactiveTintColor: "#AFB1B3",
            style: {
                backgroundColor: "white",
                borderTopColor: "#dedede",
                borderWidth: 0,
            },
            showLabel: false,
        },
    }
);

BottomTabs.navigationOptions = ({ navigation }) => ({
    header: null,
    style: {
        backgroundColor: "white",
    },
});

const StacksOverTabs = createStackNavigator(
    {
        Root: {
            screen: BottomTabs,
        },
        Post: {
            screen: SinglePostScreen,
            path: "/:category/:user/:permlink",
            navigationOptions: ({ navigation }) => ({
                header: null,
            }),
        },
        Login: {
            screen: LoginScreen,
            path: "/login",
        },
        Author: {
            screen: AuthorScreen,
            path: "/author",
        },
        Discover: {
            screen: DiscoverScreen,
            path: "/discover",
        },
        Reply: {
            screen: ReplyScreen,
            path: "/reply",
        },
    },
    {
        headerMode: "none",
    }
);

class Tabs extends React.Component {
    constructor(props) {
        super(props);
    }
    static router = StacksOverTabs.router;
    _s0;
    _s1;
    _s2;
    _s3;

    componentDidMount() {
        this._s0 = this.props.navigation.addListener(
            "willFocus",
            this._onAction
        );
        this._s1 = this.props.navigation.addListener(
            "didFocus",
            this._onAction
        );
        this._s2 = this.props.navigation.addListener(
            "willBlur",
            this._onAction
        );
        this._s3 = this.props.navigation.addListener("didBlur", this._onAction);
    }
    componentWillUnmount() {
        this._s0.remove();
        this._s1.remove();
        this._s2.remove();
        this._s3.remove();
    }
    _onAction = a => {
        console.log("TABS EVENT", a.type, a);
    };
    render() {
        return <StacksOverTabs navigation={this.props.navigation} />;
    }
}

const styles = StyleSheet.create({
    post: {
        borderWidth: 22,
        borderColor: "blue",
    },
});

export default Tabs;
