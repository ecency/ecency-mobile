/* eslint-disable no-unused-vars */
import React from "react";
import { FlatList, ActivityIndicator } from "react-native";

import { getTimeFromNow } from "../../utils/time";
import FastImage from "react-native-fast-image";

import ScrollableTabView from "@esteemapp/react-native-scrollable-tab-view";
import { TabBar } from "../../components/tabBar";
import DiscoverPage from "../discover/discover";
import { PostCard } from "../../components/postCard";
import Comment from "../../components/comment/comment";

import { Card, CardItem, View, Body } from "native-base";

import { getUserData, getAuthStatus } from "../../realm/realm";
import {
  getUser,
  getFollows,
  getPosts,
  getUserComments,
} from "../../providers/steem/dsteem";
import styles from "../../styles/profile.styles";
/* eslint-enable no-unused-vars */

class ProfilePage extends React.Component {
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
        leftButtons: {
          id: "back",
        },
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

  constructor() {
    super();
    this.getBlog = this.getBlog.bind(this);
    this.getMore = this.getMore.bind(this);
    this.getComments = this.getComments.bind(this);
    this.state = {
      user: [],
      posts: [],
      commments: [],
      replies: [],
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

    if (isLoggedIn) {
      await getUserData().then(res => {
        userData = Array.from(res);
      });

      await getFollows(userData[0].username).then(res => {
        follows = res;
      });

      user = await getUser(userData[0].username);
      about = JSON.parse(user.json_metadata);
      this.setState(
        {
          user: user,
          isLoggedIn: isLoggedIn,
          follows: follows,
          about: about.profile,
        },
        () => {
          this.getBlog(userData[0].username);
          this.getComments(userData[0].username);
        }
      );
    }
  }

  renderFooter = () => {
    if (this.state.loading) return null;

    return (
      <View style={{ marginVertical: 20 }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  getBlog = user => {
    this.setState({ loading: true });
    getPosts("blog", { tag: user, limit: 10 }, user)
      .then(result => {
        this.setState({
          isReady: true,
          posts: result,
          start_author: result[result.length - 1].author,
          start_permlink: result[result.length - 1].permlink,
          refreshing: false,
          loading: false,
        });
      })
      .catch(err => {
        alert(err);
      });
  };

  getMore = async () => {
    console.log("get more");
    await getPosts(
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

  render() {
    return (
      <View style={styles.container}>
        {this.state.isLoggedIn ? (
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
                  {this.state.user.name}
                </Text>
                <Text>{this.state.about.about}</Text>
              </Body>
              <Card style={{ margin: 0 }}>
                <CardItem style={styles.about}>
                  <View style={{ flex: 0.3 }}>
                    <Text>{this.state.user.post_count} Posts</Text>
                  </View>
                  <View style={{ flex: 0.4 }}>
                    <Text>{this.state.follows.follower_count} Followers</Text>
                  </View>
                  <View style={{ flex: 0.4 }}>
                    <Text>{this.state.follows.following_count} Following</Text>
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
                      {getTimeFromNow(this.state.user.created)}
                    </Text>
                  </View>
                </CardItem>
              </Card>
            </View>
            <ScrollableTabView
              style={styles.tabs}
              style={{ flex: 1 }}
              renderTabBar={() => (
                <TabBar
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
                      content={item}
                      user={this.state.user}
                      isLoggedIn={true}
                    />
                  )}
                  keyExtractor={(post, index) => index.toString()}
                  onEndReached={info => {
                    if (!this.state.loading) {
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
                  <Text>STEEM Balance: {this.state.user.balance}</Text>
                </Card>
                <Card>
                  <Text>SBD Balance: {this.state.user.sbd_balance}</Text>
                </Card>
                <Card>
                  <Text>STEEM Power: {this.state.user.steem_power} SP</Text>
                  <Text>
                    Received STEEM Power: {this.state.user.received_steem_power}{" "}
                    SP
                  </Text>
                  <Text>
                    Delegated Power Power:{" "}
                    {this.state.user.delegated_steem_power} SP
                  </Text>
                </Card>
                <Card>
                  <Text>
                    Saving STEEM Balance: {this.state.user.savings_balance}
                  </Text>
                  <Text>
                    Saving STEEM Balance: {this.state.user.savings_sbd_balance}
                  </Text>
                </Card>
              </View>
            </ScrollableTabView>
          </View>
        ) : (
          <DiscoverPage />
        )}
      </View>
    );
  }
}

export default ProfilePage;
