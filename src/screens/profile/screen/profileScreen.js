/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import {
  FlatList, ActivityIndicator, View, Text,
} from 'react-native';

import FastImage from 'react-native-fast-image';
// Components
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';
import Comment from '../../../components/comment/comment';
import { CollapsibleCard } from '../../../components/collapsibleCard';
import { FilterBar } from '../../../components/filterBar';
import { NoPost } from '../../../components/basicUIElements';
import { PostCard } from '../../../components/postCard';
import { ProfileSummary } from '../../../components/profileSummary';
import { TabBar } from '../../../components/tabBar';
import { Wallet } from '../../../components/wallet';

// Utilitites
import {
  getUser, getFollows, getPosts, getUserComments,
} from '../../../providers/steem/dsteem';
import { getUserData, getAuthStatus } from '../../../realm/realm';
import { getFormatedCreatedDate } from '../../../utils/time';

// Styles
import styles from './profileStyles';

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: [],
      posts: [],
      commments: [],
      replies: [],
      about: {},
      follows: {},
      isLoggedIn: false,
      isLoading: true,
    };
  }

  async componentDidMount() {
    let isLoggedIn;
    await getAuthStatus().then((res) => {
      isLoggedIn = res;
    });

    if (isLoggedIn) {
      let user;
      let userData;
      let follows;
      let about;

      await getUserData().then((res) => {
        userData = Array.from(res);
      });

      await getFollows(userData[0].username).then((res) => {
        follows = res;
      });

      user = await getUser(userData[0].username);
      // json_metadata: "{}" can be ceme as emty object if the account new!
      about = user.json_metadata && JSON.parse(user.json_metadata);
      this.setState(
        {
          user,
          isLoggedIn,
          follows,
          about: about && about.profile,
        },
        () => {
          this._getBlog(userData[0].username);
          this._getComments(userData[0].username);
        },
      );
    }
  }

  _renderFooter = () => {
    if (this.state.isLoading) return null;

    return (
      <View style={{ marginVertical: 20 }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  _getBlog = (user) => {
    this.setState({ isLoading: true });
    getPosts('blog', { tag: user, limit: 10 }, user)
      .then((result) => {
        this.setState({
          isReady: true,
          posts: result,
          start_author: result[result.length - 1].author,
          start_permlink: result[result.length - 1].permlink,
          refreshing: false,
          isLoading: false,
        });
      })
      .catch((err) => {
        alert(err);
      });
  };

  _getMore = async () => {
    console.log('get more');
    await getPosts(
      'blog',
      {
        tag: this.state.user.name,
        limit: 10,
        start_author: this.state.start_author,
        start_permlink: this.state.start_permlink,
      },
      this.state.user.name,
    ).then((result) => {
      console.log(result);
      const posts = result;
      posts.shift();
      this.setState({
        posts: [...this.state.posts, ...posts],
        start_author: result[result.length - 1] && result[result.length - 1].author,
        start_permlink: result[result.length - 1] && result[result.length - 1].permlink,
        isLoading: false,
      });
    });
  };

  _getComments = async (user) => {
    await getUserComments({ start_author: user, limit: 10 })
      .then((result) => {
        this.setState({
          isReady: true,
          commments: result,
          refreshing: false,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  _getPostRenderItem = () => {};

  render() {
    const {
      user, follows, posts, commments, isLoggedIn, isLoading, about,
    } = this.state;
    let _about;
    let coverImage;
    let location;
    let website;
    const votingPower = user && user.voting_power && user.voting_power / 100;
    const fullInHour = Math.ceil((100 - votingPower) * 0.833333);

    if (about) {
      _about = about.about;
      coverImage = about.cover_image;
      location = about.location;
      website = about.website;
    }
    return (
      <View style={styles.container}>
        <CollapsibleCard
          title={_about}
          defaultTitle="Profile details"
          expanded={isLoggedIn}
          locked={!isLoggedIn}
        >
          <ProfileSummary
            percent={votingPower}
            hours={fullInHour}
            location={location}
            link={website}
            date={getFormatedCreatedDate(user && user.created)}
            followerCount={follows.follower_count}
            followingCount={follows.following_count}
            coverImage={coverImage}
          />
        </CollapsibleCard>

        <ScrollableTabView
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={80}
              tabUnderlineScaleX={2}
              activeColor="#357ce6"
              inactiveColor="#788187"
            />
          )}
        >
          <View tabLabel="Post" style={styles.postTabBar}>
            <FilterBar
              isHide={!isLoggedIn}
              dropdownIconName="md-arrow-dropdown"
              options={['NEW POSTS', 'VOTES', 'REPLIES', 'MENTIONS', 'FOLLOWS', 'REBLOGS']}
              defaultText="ALL NOTIFICATION"
              onDropdownSelect={this._handleOnDropdownSelect}
              rightIconName="md-apps"
            />
            {posts && posts.length > 0 ? (
              <FlatList
                data={posts}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <PostCard
                    style={{
                      shadowColor: '#f6f6f6',
                    }}
                    content={item}
                    user={user}
                    isLoggedIn
                  />
                )}
                keyExtractor={(post, index) => index.toString()}
                onEndReached={(info) => {
                  !isLoading && this._getMore();
                }}
                onEndThreshold={0}
                bounces={false}
              />
            ) : (
              <NoPost
                name={user.name}
                text={"haven't posted anything yet"}
                defaultText="Login to see!"
              />
            )}
          </View>
          <View tabLabel="Comments" style={styles.commentsTabBar}>
            {commments && commments.length > 0 ? (
              <FlatList
                data={commments}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => <Comment comment={item} isLoggedIn user={user} />}
                keyExtractor={(post, index) => index.toString()}
                onEndThreshold={0}
                bounces={false}
              />
            ) : (
              <NoPost
                name={user.name}
                text="haven't commented anything yet"
                defaultText="Login to see!"
              />
            )}
          </View>
          <View tabLabel={user.balance ? `$${user.balance}` : 'Wallet'}>
            <Wallet />
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}

export default ProfileScreen;
