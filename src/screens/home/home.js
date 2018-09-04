import React from "react";
import { Text, View, Dimensions } from "react-native";
import { Navigation } from "react-native-navigation";

import ScrollableTabView from "@esteemapp/react-native-scrollable-tab-view";
import CustomTabBar from "./customTab";

import FastImage from "react-native-fast-image";

import Placeholder from "rn-placeholder";

// REDUX
import { connect } from "react-redux";
import { fetchAccount } from "../../redux/actions/userActions";
import store from "../../redux/store/store";

// STEEM
import { getUserData, getAuthStatus } from "../../realm/realm";
import { getUser } from "../../providers/steem/dsteem";

// SCREENS
import HotPage from "./hot";
import FeedPage from "./feed";
import TrendingPage from "./trending";

export default class Home extends React.PureComponent {
    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this); // <== Will be automatically unregistered when unmounted
        this.state = {
            user: {
                name: "null",
            },
            isLoggedIn: false,
            isLoading: true,
        };
    }

    navigationButtonPressed({ buttonId }) {
        if (buttonId === "menu") {
            Navigation.mergeOptions(this.props.componentId, {
                sideMenu: {
                    ["right"]: {
                        visible: true,
                    },
                },
            });
        }
    }

    async componentDidMount() {
        let user;
        let userData;
        let isLoggedIn;

        await getAuthStatus().then(res => {
            isLoggedIn = res;
        });

        if (isLoggedIn == true) {
            await getUserData().then(res => {
                user = Array.from(res);
            });
            userData = await getUser(user[0].username);

            this.setState({
                user: userData,
                isLoggedIn: isLoggedIn,
                isLoading: false,
            });
        } else {
            await this.setState({
                isLoading: false,
            });
        }
    }

    render() {
        return (
            <View style={styles.root} key={"overlay"}>
                <ScrollableTabView
                    style={styles.tabView}
                    renderTabBar={() => (
                        <CustomTabBar
                            style={styles.tabbar}
                            tabUnderlineDefaultWidth={30} // default containerWidth / (numberOfTabs * 4)
                            tabUnderlineScaleX={3} // default 3
                            activeColor={"#222"}
                            inactiveColor={"#222"}
                        />
                    )}
                >
                    <View tabLabel="Feed" style={styles.tabbarItem}>
                        {this.state.isLoggedIn ? (
                            <FeedPage
                                user={this.state.user}
                                isLoggedIn={this.state.isLoggedIn}
                                componentId={this.props.componentId}
                            />
                        ) : (
                            <Text>Login to see your Feed</Text>
                        )}
                    </View>
                    <View tabLabel="Hot" style={styles.tabbarItem}>
                        <HotPage
                            user={this.state.user}
                            isLoggedIn={this.state.isLoggedIn}
                            componentId={this.props.componentId}
                        />
                    </View>
                    <View tabLabel="Trending" style={styles.tabbarItem}>
                        <TrendingPage
                            user={this.state.user}
                            isLoggedIn={this.state.isLoggedIn}
                            componentId={this.props.componentId}
                        />
                    </View>
                </ScrollableTabView>
                <View style={styles.buttonContainer} />
            </View>
        );
    }
}

const styles = {
    root: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    buttonContainer: {
        width: "50%",
        alignItems: "center",
    },
    tabView: {
        alignSelf: "center",
        backgroundColor: "transparent",
    },
    tabbar: {
        alignSelf: "center",
        height: 40,
        backgroundColor: "white",
    },
    tabbarItem: {
        flex: 1,
        paddingHorizontal: 7,
        backgroundColor: "#f9f9f9",
        minWidth: Dimensions.get("window").width / 1,
    },
    container: {
        backgroundColor: "#F9F9F9",
        flex: 1,
    },
    tabs: {
        flex: 1,
    },
    placeholder: {
        backgroundColor: "white",
        padding: 20,
        borderStyle: "solid",
        borderWidth: 1,
        borderTopWidth: 1,
        borderColor: "#e2e5e8",
        borderRadius: 5,
        marginRight: 0,
        marginLeft: 0,
        marginTop: 10,
    },
    header: {
        backgroundColor: "#284b78",
        borderBottomWidth: 0,
        borderColor: "#284b78",
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "white",
    },
    searchButton: {
        color: "white",
        fontWeight: "bold",
    },
    loginButton: {
        alignSelf: "center",
        marginTop: 100,
    },
};
