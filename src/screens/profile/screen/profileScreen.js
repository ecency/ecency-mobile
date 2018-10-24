/* eslint-disable no-unused-vars */
import React, { Component, Fragment } from 'react';
import { FlatList, ActivityIndicator, View } from 'react-native';

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
import { Header } from '../../../components/header';

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

  _renderFooter = () => {
    if (this.state.isLoading) return null;

    return (
      <View style={{ marginVertical: 20 }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  _getPostRenderItem = () => {};

  render() {
    const { getMorePost } = this.props;
    const {
      user, follows, posts, commments, isLoggedIn, isLoading, about,
    } = this.props;
    let _about;
    let coverImage;
    let location;
    let website;
    let votingPower;
    let resourceCredits;
    let fullInHourVP;
    let fullInHourRC;

    if (user) {
      votingPower = user.voting_power && user.voting_power / 100;
      resourceCredits = user.resource_credits && user.resource_credits / 100;
      fullInHourVP = Math.ceil((100 - votingPower) * 0.833333);
      fullInHourRC = Math.ceil((100 - resourceCredits) * 0.833333);
    }

    if (about) {
      _about = about.about;
      coverImage = about.cover_image;
      location = about.location;
      website = about.website;
    }
    return (
      <Fragment>
        <Header />
        <View style={styles.container}>
          <CollapsibleCard
            title={_about}
            defaultTitle="Profile details"
            expanded={!isLoggedIn}
            locked={!isLoggedIn}
          >
            <ProfileSummary
              percentVP={votingPower}
              percentRC={resourceCredits}
              hoursVP={fullInHourVP}
              hoursRC={fullInHourRC}
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
                    !isLoading && getMorePost();
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
              <Wallet user={user} />
            </View>
          </ScrollableTabView>
        </View>
      </Fragment>
    );
  }
}

export default ProfileScreen;
