import React from "react";
/* eslint-disable no-unused-vars */
import {
    Content,
    Text,
    List,
    ListItem,
    Icon,
    Container,
    Left,
    Right,
    View,
    Badge,
    Thumbnail,
} from "native-base";
/* eslint-enable no-unused-vars */
import styles from "./style";

import FastImage from "react-native-fast-image";
import { getAccount } from "../../providers/steem/Dsteem";
import { removeUserData } from "../../realm/Realm";
import RNRestart from "react-native-restart";
import { Navigation } from "react-native-navigation";

const masterKeyMenuOptions = [
    {
        name: "Profile",
        route: "Profile",
        icon: "contact",
        bg: "#C5F442",
    },
    {
        name: "Bookmarks",
        route: "bookmarks",
        icon: "bookmarks",
        bg: "#DA4437",
    },
    {
        name: "Favorites",
        route: "favorites",
        icon: "heart",
        bg: "#DA4437",
    },
    {
        name: "Drafts",
        route: "drafts",
        icon: "create",
        bg: "#DA4437",
    },
    {
        name: "Schedules",
        route: "schedules",
        icon: "time",
        bg: "#DA4437",
    },
    {
        name: "Gallery",
        route: "galery",
        icon: "images",
        bg: "#DA4437",
    },
    {
        name: "Settings",
        route: "Settings",
        icon: "settings",
        bg: "#DA4437",
    },
];

const postingKeyMenuOptions = [
    {
        name: "Profile",
        route: "Profile",
        icon: "contact",
        bg: "#C5F442",
    },
    {
        name: "Bookmarks",
        route: "bookmarks",
        icon: "bookmarks",
        bg: "#DA4437",
    },
    {
        name: "Favorites",
        route: "favorites",
        icon: "heart",
        bg: "#DA4437",
    },
    {
        name: "Drafts",
        route: "drafts",
        icon: "create",
        bg: "#DA4437",
    },
    {
        name: "Schedules",
        route: "schedules",
        icon: "time",
        bg: "#DA4437",
    },
    {
        name: "Gallery",
        route: "galery",
        icon: "images",
        bg: "#DA4437",
    },
    {
        name: "Settings",
        route: "Settings",
        icon: "settings",
        bg: "#DA4437",
    },
];

export default class LoggedInSideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shadowOffsetWidth: 1,
            shadowRadius: 4,
            user: [],
            loginType: "",
            json_metadata: {},
        };
    }

    componentDidMount() {
        getAccount(this.props.user)
            .then(result => {
                let json_metadata = JSON.parse(result[0].json_metadata);
                this.setState({
                    user: result[0],
                    avatar: `https://steemitimages.com/u/${
                        result[0].name
                    }/avatar/small`,
                    json_metadata: json_metadata.profile,
                });
            })
            .catch(err => {
                alert(err);
            });
    }

    hideSideMenu() {
        Navigation.mergeOptions("Component14", {
            sideMenu: {
                ["right"]: {
                    visible: false,
                },
            },
        });
    }

    Logout = () => {
        removeUserData()
            .then(() => {
                RNRestart.Restart();
            })
            .catch(err => {
                alert(err);
            });
    };

    render() {
        return (
            <Container>
                <Content
                    bounces={false}
                    style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
                >
                    <View style={styles.drawerCover} />
                    <Thumbnail
                        style={styles.drawerImage}
                        source={{ uri: this.state.avatar }}
                    />
                    <View style={styles.info}>
                        <Text style={styles.userLabel}>
                            {this.state.json_metadata.name || ""}
                        </Text>
                        <Text style={styles.username}>
                            @{this.state.user.name}
                        </Text>
                    </View>
                    <List
                        style={{ paddingLeft: 25 }}
                        dataArray={
                            this.state.loginType === "master_key"
                                ? masterKeyMenuOptions
                                : postingKeyMenuOptions
                        }
                        renderRow={data => (
                            <ListItem
                                button
                                noBorder
                                onPress={() => {
                                    Navigation.push("tab1Stack", {
                                        component: {
                                            name: `navigation.eSteem.${
                                                data.route
                                            }`,
                                            passProps: {},
                                            options: {
                                                topBar: {
                                                    title: {},
                                                },
                                            },
                                        },
                                    });
                                    this.hideSideMenu();
                                }}
                            >
                                <Left>
                                    <Icon
                                        active
                                        name={data.icon}
                                        style={{
                                            color: "#777",
                                            fontSize: 26,
                                            width: 30,
                                        }}
                                    />
                                    <Text style={styles.text}>{data.name}</Text>
                                </Left>
                                {data.types && (
                                    <Right style={{ flex: 1 }}>
                                        <Badge
                                            style={{
                                                borderRadius: 3,
                                                height: 25,
                                                width: 72,
                                                backgroundColor: data.bg,
                                            }}
                                        >
                                            <Text style={styles.badgeText}>{`${
                                                data.types
                                            } Types`}</Text>
                                        </Badge>
                                    </Right>
                                )}
                            </ListItem>
                        )}
                    />
                    <ListItem
                        noBorder
                        style={{ paddingLeft: 25 }}
                        onPress={() => this.Logout()}
                    >
                        <Left>
                            <Icon
                                active
                                name="log-out"
                                style={{
                                    color: "#777",
                                    fontSize: 26,
                                    width: 30,
                                }}
                            />
                            <Text style={styles.text}>Logout</Text>
                        </Left>
                    </ListItem>
                </Content>
            </Container>
        );
    }
}
