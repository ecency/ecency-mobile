/* eslint-disable no-unused-vars */
import React, { Component, Fragment } from 'react';
import { View, ScrollView } from 'react-native';

// Components
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';
import { Comments } from '../../../components/comments';
import { CollapsibleCard } from '../../../components/collapsibleCard';
import { Header } from '../../../components/header';
import { NoPost, ProfileSummaryPlaceHolder } from '../../../components/basicUIElements';
import { Posts } from '../../../components/posts';
import { ProfileSummary } from '../../../components/profileSummary';
import { TabBar } from '../../../components/tabBar';
import { Wallet } from '../../../components/wallet';

// Utilitites
import { getFormatedCreatedDate } from '../../../utils/time';
import { getRcPower, getVotingPower } from '../../../utils/manaBar';
import parseToken from '../../../utils/parseToken';

// Styles
import styles from './profileStyles';

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      about,
      comments,
      follows,
      isLoading,
      isLoggedIn,
      isReverseHeader,
      user,
      isReady,
      username,
    } = this.props;
    let _about;
    let avatar;
    let coverImage;
    let name;
    let location;
    let website;
    let votingPower;
    let resourceCredits;
    let fullInHourVP;
    let fullInHourRC;

    if (user) {
      votingPower = getVotingPower(user).toFixed(1);
      resourceCredits = getRcPower(user).toFixed(1);
      fullInHourVP = Math.ceil((100 - votingPower) * 0.833333);
      fullInHourRC = Math.ceil((100 - resourceCredits) * 0.833333);
    }

    if (about) {
      _about = about.about;
      coverImage = about.cover_image;
      avatar = about.profile_image;
      location = about.location;
      website = about.website;
      name = about.name;
    }
    return (
      <Fragment>
        <Header
          name={name}
          avatar={avatar}
          isReverse={isReverseHeader}
          userName={user && user.name}
          reputation={user && user.reputation}
        />
        <View style={styles.container}>
          {!isReady ? (
            <ProfileSummaryPlaceHolder />
          ) : (
            <CollapsibleCard
              title={_about}
              isTitleCenter
              defaultTitle="Profile details"
              expanded={isLoggedIn}
              locked={!isLoggedIn}
            >
              <ProfileSummary
                percentVP={votingPower}
                percentRC={resourceCredits}
                hoursVP={fullInHourVP || null}
                hoursRC={fullInHourRC || null}
                location={location}
                link={website}
                date={getFormatedCreatedDate(user && user.created)}
                followerCount={follows.follower_count}
                followingCount={follows.following_count}
                coverImage={coverImage}
              />
            </CollapsibleCard>
          )}

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
              {user && (
                <Posts
                  filterOptions={[
                    'NEW POSTS',
                    'VOTES',
                    'REPLIES',
                    'MENTIONS',
                    'FOLLOWS',
                    'REBLOGS',
                  ]}
                  isLoginMust
                  getFor="blog"
                  tag={username}
                  user={user && user}
                  isLoggedIn={isLoggedIn}
                />
              )}
            </View>
            <View tabLabel="Comments" style={styles.commentsTabBar}>
              {comments && comments.length > 0 ? (
                <ScrollView>
                  <Comments comments={comments} />
                </ScrollView>
              ) : (
                <NoPost
                  name={username}
                  text="haven't commented anything yet"
                  defaultText="Login to see!"
                />
              )}
            </View>
            <View
              tabLabel={user && user.balance ? `$${user && parseToken(user.balance)}` : 'Wallet'}
            >
              <Wallet user={user} />
            </View>
          </ScrollableTabView>
        </View>
      </Fragment>
    );
  }
}

export default ProfileScreen;
