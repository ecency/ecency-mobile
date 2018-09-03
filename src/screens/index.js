import { Navigation } from "react-native-navigation";

import SideMenu from "./SideMenuScreen";
import Home from "./home/Home";
import Hot from "./home/Hot";
import Feed from "./home/Feed";
import Post from "./single-post/Post";
import Profile from "./profile/profile";
import Author from "./author-profile/Author";
import Login from "./login/Login";
import Wallet from "./wallet/wallet";
import Editor from "./editor/editor";
import Discover from "./discover/Discover";
import Settings from "./settings/Settings";
import Notifications from "./notifications/notification";
import PostCard from "../components/post-card/PostCard";

function registerScreens() {
    Navigation.registerComponent("navigation.eSteem.Home", () => Home);
    Navigation.registerComponent("navigation.eSteem.Hot", () => Hot);
    Navigation.registerComponent("navigation.eSteem.Feed", () => Feed);
    Navigation.registerComponent("navigation.eSteem.Post", () => Post);
    Navigation.registerComponent("navigation.eSteem.Login", () => Login);
    Navigation.registerComponent("navigation.eSteem.Wallet", () => Wallet);
    Navigation.registerComponent("navigation.eSteem.Editor", () => Editor);
    Navigation.registerComponent("navigation.eSteem.Discover", () => Discover);
    Navigation.registerComponent("navigation.eSteem.Settings", () => Settings);
    Navigation.registerComponent(
        "navigation.eSteem.Notifications",
        () => Notifications
    );
    Navigation.registerComponent(
        "navigation.eSteem.SideMenuScreen",
        () => SideMenu
    );
    Navigation.registerComponent("navigation.eSteem.Profile", () => Profile);
    Navigation.registerComponent("navigation.eSteem.Author", () => Author);
    Navigation.registerComponent("navigation.eSteem.PostCard", () => PostCard);
}

module.exports = {
    registerScreens,
};
