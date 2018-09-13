import { Provider } from "react-redux";
import { Navigation } from "react-native-navigation";

import store from "../redux/store/store";

// SCREENS
import Splash from "./splash/splashContainer";
import SideMenu from "./sideMenuScreen";
import Home from "./home/home";
import Hot from "./home/hot";
import Feed from "./home/feed";
import Post from "./single-post/post";
import Profile from "./profile/profile";
import Author from "./author-profile/author";
import Login from "./login/login";
import Wallet from "./wallet/wallet";
import Editor from "./editor/editor";
import Discover from "./discover/discover";
import Settings from "./settings/settings";
import Notifications from "./notifications/notification";
import PinCode from "./pinCode/pinCodeContainer";

// COMPONENTS
import PostCard from "../components/post-card/postCard";
import Search from "../components/search/search";

function registerScreens() {
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Splash",
        () => Splash,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Home",
        () => Home,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Hot",
        () => Hot,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Feed",
        () => Feed,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Post",
        () => Post,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Login",
        () => Login,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Wallet",
        () => Wallet,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Editor",
        () => Editor,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Discover",
        () => Discover,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Settings",
        () => Settings,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Notifications",
        () => Notifications,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.SideMenuScreen",
        () => SideMenu,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Profile",
        () => Profile,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Author",
        () => Author,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.PostCard",
        () => PostCard,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.Search",
        () => Search,
        Provider,
        store
    );
    Navigation.registerComponentWithRedux(
        "navigation.eSteem.PinCode",
        () => PinCode,
        Provider,
        store
    );
}

module.exports = {
    registerScreens,
};
