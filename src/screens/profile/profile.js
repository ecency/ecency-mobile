/* eslint-disable no-unused-vars */
import React from "react";
import { StatusBar, Dimensions } from "react-native";

import moment from "moment";
import FastImage from "react-native-fast-image";

import ScrollableTabView from "react-native-scrollable-tab-view";
import CustomTabBar from "../home/FeedTabs";
import DiscoverPage from "../discover/Discover";
import { getUser, getFollows } from "../../providers/steem/Dsteem";

import {
    Content,
    Card,
    CardItem,
    View,
    Header,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Title,
    Text,
} from "native-base";

import { getUserData, getAuthStatus } from "../../realm/Realm";
import store from "../../redux/store/Store";
import styles from "../../styles/profile.styles";
/* eslint-enable no-unused-vars */

class ProfilePage extends React.Component {
    constructor() {
        super();
        this.state = {
            user: [],
            about: {},
            follows: {},
            isLoggedIn: false,
        };
    }

    async componentDidMount() {
        let isLoggedIn;
        let user;
        let userData;
        let follows;
        let about;

        await getAuthStatus().then(res => {
            isLoggedIn = res;
        });

        if (isLoggedIn == true) {
            await getUserData().then(res => {
                userData = Array.from(res);
            });

            await getFollows(userData[0].username).then(res => {
                follows = res;
            });

            user = await getUser(userData[0].username);
            about = JSON.parse(user.json_metadata);
            this.setState({
                user: user,
                isLoggedIn: isLoggedIn,
                follows: follows,
                about: about.profile,
            });
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.isLoggedIn ? (
                    <View style={{ flex: 1 }}>
                        <Header
                            style={{
                                backgroundColor: "transparent",
                                position: "absolute",
                                top: StatusBar.currentHeight,
                            }}
                        >
                            <Left>
                                <Button transparent>
                                    <Icon name="menu" />
                                </Button>
                            </Left>
                            <Body>
                                <Title>{this.state.user.name}</Title>
                            </Body>
                            <Right>
                                <Button transparent>
                                    <Icon name="search" />
                                </Button>
                                <Button transparent>
                                    <Icon name="heart" />
                                </Button>
                                <Button transparent>
                                    <Icon name="more" />
                                </Button>
                            </Right>
                        </Header>
                        <Content style={styles.content}>
                            <FastImage
                                style={styles.cover}
                                source={{
                                    uri: this.state.about.cover_image,
                                    priority: FastImage.priority.high,
                                }}
                            />
                            <FastImage
                                style={styles.avatar}
                                source={{
                                    uri: this.state.about.profile_image,
                                    priority: FastImage.priority.high,
                                }}
                            />
                            <Body style={{ top: -40 }}>
                                <Text style={{ fontWeight: "bold" }}>
                                    {this.state.user.name}
                                </Text>
                                <Text>{this.state.about.about}</Text>
                            </Body>
                            <Card style={{ margin: 0 }}>
                                <CardItem style={styles.about}>
                                    <View style={{ flex: 0.3 }}>
                                        <Text>
                                            {this.state.user.post_count} Posts
                                        </Text>
                                    </View>
                                    <View style={{ flex: 0.4 }}>
                                        <Text>
                                            {this.state.follows.follower_count}{" "}
                                            Followers
                                        </Text>
                                    </View>
                                    <View style={{ flex: 0.4 }}>
                                        <Text>
                                            {this.state.follows.following_count}{" "}
                                            Following
                                        </Text>
                                    </View>
                                </CardItem>

                                <CardItem style={styles.info}>
                                    <View style={{ flex: 0.5 }}>
                                        <Text
                                            style={{
                                                marginLeft: 20,
                                                alignSelf: "flex-start",
                                            }}
                                        >
                                            <Icon
                                                style={{
                                                    fontSize: 20,
                                                    alignSelf: "flex-start",
                                                }}
                                                name="md-pin"
                                            />
                                            {this.state.about.location}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 0.5 }}>
                                        <Text>
                                            <Icon
                                                style={{
                                                    fontSize: 20,
                                                    marginRight: 10,
                                                }}
                                                name="md-calendar"
                                            />
                                            {moment
                                                .utc(this.state.user.created)
                                                .local()
                                                .fromNow()}
                                        </Text>
                                    </View>
                                </CardItem>
                            </Card>
                            <View>
                                <ScrollableTabView
                                    style={styles.tabs}
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
                                    <View tabLabel="Blog" />
                                    <View
                                        tabLabel="Comments"
                                        style={styles.tabbarItem}
                                    />
                                    <View
                                        tabLabel="Replies"
                                        style={styles.tabbarItem}
                                    />
                                    <View
                                        tabLabel="Wallet"
                                        style={styles.tabbarItem}
                                    />
                                </ScrollableTabView>
                            </View>
                        </Content>
                    </View>
                ) : (
                    <View>
                        <Header>
                            <Left>
                                <Button transparent>
                                    <Icon name="menu" />
                                </Button>
                            </Left>
                            <Body>
                                <Title />
                            </Body>
                            <Right>
                                <Button transparent>
                                    <Icon name="more" />
                                </Button>
                            </Right>
                        </Header>
                        <DiscoverPage />
                    </View>
                )}
            </View>
        );
    }
}

export default ProfilePage;
