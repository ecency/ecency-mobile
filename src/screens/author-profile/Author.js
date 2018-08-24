import React from "react";
import {
    StatusBar,
    Dimensions,
    FlatList,
    ActivityIndicator,
} from "react-native";
import {
    Container,
    Card,
    CardItem,
    Header,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Title,
    Content,
    Text,
    View,
} from "native-base";
import ScrollableTabView from "react-native-scrollable-tab-view";
import CustomTabBar from "../home/FeedTabs";
import PostCard from "../../components/post-card/PostCard";
import Comment from "../../components/comment/Comment";
import moment from "moment";
import FastImage from "react-native-fast-image";
import FeatherIcons from "react-native-vector-icons/Feather";

import Theme, { createThemedComponent } from "react-native-theming";
import styles from "../../styles/author.styles";
import themes from "../../styles/themes";
import {
    followUser,
    unfollowUser,
    getFollows,
    getPosts,
    getUserComments,
    getUser,
    getFollowers,
    isFolllowing,
} from "../../providers/steem/Dsteem";
import { getAuthStatus, getUserData } from "../../realm/Realm";
import { decryptKey } from "../../utils/Crypto";

const Bar = createThemedComponent(StatusBar, ["barStyle", "backgroundColor"]);

class AuthorPage extends React.Component {
    constructor(props) {
        super(props);
        this.getBlog = this.getBlog.bind(this);
        this.getMore = this.getMore.bind(this);
        this.getComments = this.getComments.bind(this);
        this.follow = this.follow.bind(this);
        this.unfollow = this.unfollow.bind(this);
        this.state = {
            user: {
                name: "null",
            },
            posts: [],
            commments: [],
            replies: [],
            about: {},
            follows: {},
            loading: false,
            isLoggedIn: false,
            author: "author",
            start_author: "",
            start_permlink: "",
            isFolllowing: false,
            follow_loader: true,
        };
    }

    async componentDidMount() {
        /*for (var i = 0; i < themes.length; i++) {
            themes[i].name == 'Light'?themes[0].apply():'';
        }*/
        let info;
        let json_metadata;
        let isLoggedIn;
        let follows;
        let author;
        let user;

        await getAuthStatus().then(res => {
            isLoggedIn = res;
        });

        if (isLoggedIn == true) {
            getUserData()
                .then(res => {
                    user = Array.from(res);
                    user = user[0];
                })
                .then(() => {
                    this.setState({
                        user: user,
                    });
                })
                .then(() => {
                    getUser(user.username).then(result => {
                        this.setState({
                            user: result,
                        });
                    });

                    isFolllowing(
                        this.props.navigation.state.params.author,
                        user.username
                    ).then(result => {
                        this.setState({
                            isFolllowing: result,
                            follow_loader: false,
                        });
                    });
                });
        }

        await getFollows(this.props.navigation.state.params.author).then(
            res => {
                follows = res;
            }
        );

        author = await getUser(this.props.navigation.state.params.author);

        this.getBlog(this.state.user.name, author.name);
        this.getComments(author.name);

        json_metadata = JSON.parse(author.json_metadata);
        info = json_metadata.profile;
        this.setState(
            {
                about: info,
                author: author,
                isLoggedIn: isLoggedIn,
                follows: follows,
            },
            () => {
                console.log(this.state.about);
            }
        );
    }

    getBlog = (user, author) => {
        this.setState({ loading: true });
        getPosts("blog", { tag: author, limit: 10 }, user)
            .then(result => {
                this.setState({
                    loading: false,
                    isReady: true,
                    posts: result,
                    start_author: result[result.length - 1].author,
                    start_permlink: result[result.length - 1].permlink,
                    refreshing: false,
                });
            })
            .catch(err => {
                console.log(err);
            });
    };

    getMore = () => {
        if (this.state.loading == true) {
            return false;
        } else {
            getPosts(
                "blog",
                {
                    tag: this.state.user.name,
                    limit: 10,
                    start_author: this.state.start_author,
                    start_permlink: this.state.start_permlink,
                },
                this.state.user.name
            ).then(result => {
                console.log(result);
                let posts = result;
                posts.shift();
                this.setState({
                    posts: [...this.state.posts, ...posts],
                    start_author: result[result.length - 1].author,
                    start_permlink: result[result.length - 1].permlink,
                    loading: false,
                });
            });
        }
    };

    getComments = async user => {
        await getUserComments({ start_author: user, limit: 10 })
            .then(result => {
                this.setState({
                    isReady: true,
                    commments: result,
                    refreshing: false,
                    loading: false,
                });
            })
            .catch(err => {
                console.log(err);
            });
    };

    follow = async () => {
        let userData;
        let privateKey;

        await this.setState({
            follow_loader: true,
        });

        await getUserData().then(result => {
            userData = Array.from(result);
        });

        console.log(userData);
        privateKey = decryptKey(userData[0].postingKey, "pinCode");

        followUser(
            {
                follower: userData[0].username,
                following: this.state.author.name,
            },
            privateKey
        )
            .then(result => {
                console.log(result);
                this.setState({
                    follow_loader: false,
                    isFolllowing: true,
                });
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    follow_loader: false,
                    isFolllowing: false,
                });
            });
    };

    unfollow = async () => {
        let userData;
        let privateKey;

        await this.setState({
            follow_loader: true,
        });

        await getUserData().then(result => {
            userData = Array.from(result);
        });

        console.log(userData);
        privateKey = decryptKey(userData[0].postingKey, "pinCode");

        unfollowUser(
            {
                follower: userData[0].username,
                following: this.state.author.name,
            },
            privateKey
        )
            .then(result => {
                this.setState({
                    follow_loader: false,
                    isFolllowing: false,
                });
            })
            .catch(err => {
                this.setState({
                    follow_loader: false,
                });
            });
    };

    renderFooter = () => {
        if (!this.state.loading == false) return null;

        return (
            <View style={{ marginVertical: 20 }}>
                <ActivityIndicator animating size="large" />
            </View>
        );
    };

    render() {
        return (
            <Container style={styles.container}>
                <Header>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name="arrow-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title> {this.state.author.name} </Title>
                    </Body>
                    <Right>
                        <Button transparent>
                            <Icon name="heart" />
                        </Button>
                        {this.state.isFolllowing == true ? (
                            <Button
                                onPress={() => {
                                    this.unfollow();
                                }}
                                transparent
                            >
                                {this.state.follow_loader ? (
                                    <ActivityIndicator />
                                ) : (
                                    <FeatherIcons
                                        style={{
                                            fontSize: 20,
                                        }}
                                        name="user-check"
                                    />
                                )}
                            </Button>
                        ) : (
                            <Button
                                onPress={() => {
                                    this.follow();
                                }}
                                transparent
                            >
                                {this.state.follow_loader ? (
                                    <ActivityIndicator />
                                ) : (
                                    <FeatherIcons
                                        style={{
                                            fontSize: 20,
                                        }}
                                        name="user-plus"
                                    />
                                )}
                            </Button>
                        )}
                    </Right>
                </Header>

                <View style={{ flex: 1 }}>
                    <View style={styles.content}>
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
                                {this.state.author.name}
                            </Text>
                            <Text>{this.state.about.about}</Text>
                        </Body>
                        <Card style={{ margin: 0 }}>
                            <CardItem style={styles.about}>
                                <View style={{ flex: 0.3 }}>
                                    <Text>
                                        {this.state.author.post_count} Posts
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
                                            .utc(this.state.author.created)
                                            .local()
                                            .fromNow()}
                                    </Text>
                                </View>
                            </CardItem>
                        </Card>
                    </View>
                    <ScrollableTabView
                        style={styles.tabs}
                        style={{ flex: 1 }}
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
                        <View tabLabel="Blog" style={styles.tabbarItem}>
                            <FlatList
                                data={this.state.posts}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <PostCard
                                        style={{ shadowColor: "white" }}
                                        navigation={this.props.navigation}
                                        content={item}
                                        user={this.state.user}
                                        isLoggedIn={true}
                                    />
                                )}
                                keyExtractor={(post, index) => index.toString()}
                                onEndReached={info => {
                                    if (this.state.loading == false) {
                                        console.log(info);
                                        this.getMore();
                                    }
                                }}
                                onEndThreshold={0}
                                bounces={false}
                                ListFooterComponent={this.renderFooter}
                            />
                        </View>

                        <View tabLabel="Comments" style={styles.tabbarItem}>
                            <FlatList
                                data={this.state.commments}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <Comment
                                        comment={item}
                                        navigation={this.props.navigation}
                                        isLoggedIn={true}
                                        user={this.state.user}
                                    />
                                )}
                                keyExtractor={(post, index) => index.toString()}
                                onEndThreshold={0}
                                bounces={false}
                                ListFooterComponent={this.renderFooter}
                            />
                        </View>
                        <View tabLabel="Replies" style={styles.tabbarItem} />
                        <View tabLabel="Wallet" style={styles.tabbarItem}>
                            <Card>
                                <Text>
                                    STEEM Balance: {this.state.author.balance}
                                </Text>
                            </Card>
                            <Card>
                                <Text>
                                    SBD Balance: {this.state.author.sbd_balance}
                                </Text>
                            </Card>
                            <Card>
                                <Text>
                                    STEEM Power: {this.state.author.steem_power}{" "}
                                    SP
                                </Text>
                                <Text>
                                    Received STEEM Power:{" "}
                                    {this.state.author.received_steem_power} SP
                                </Text>
                                <Text>
                                    Delegated Power Power:{" "}
                                    {this.state.author.delegated_steem_power} SP
                                </Text>
                            </Card>
                            <Card>
                                <Text>
                                    Saving STEEM Balance:{" "}
                                    {this.state.author.savings_balance}
                                </Text>
                                <Text>
                                    Saving STEEM Balance:{" "}
                                    {this.state.author.savings_sbd_balance}
                                </Text>
                            </Card>
                        </View>
                    </ScrollableTabView>
                </View>
            </Container>
        );
    }
}

export default AuthorPage;
