import React, { PureComponent, Fragment } from 'react';
import { View, ScrollView, SafeAreaView, Text } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import ScrollableTabView from 'react-native-scrollable-tab-view';

// Components
import { CollapsibleCard } from '../collapsibleCard';
import { Comments } from '../comments';
import { Header } from '../header';
import { NoPost, ProfileSummaryPlaceHolder, WalletDetailsPlaceHolder } from '../basicUIElements';
import { ProfileSummary } from '../profileSummary';
import { TabBar } from '../tabBar';
import { Wallet } from '../wallet';

// Constants
import {
  PROFILE_FILTERS,
  PROFILE_FILTERS_OWN,
  PROFILE_FILTERS_VALUE,
  PROFILE_SUBFILTERS,
  PROFILE_SUBFILTERS_VALUE,
} from '../../constants/options/filters';

// Utils
import { getFormatedCreatedDate } from '../../utils/time';

// Styles
import styles from './profileStyles';
import globalStyles from '../../globalStyles';
import { TabbedPosts } from '../tabbedPosts';

class ProfileView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isSummaryOpen: true,
      collapsibleMoreHeight: 0,
      estimatedWalletValue: 0,
      oldEstimatedWalletValue: 0,
    };
  }

  _handleOnScroll = () => {
    const { isSummaryOpen } = this.state;

    if (isSummaryOpen) {
      this.setState({ isSummaryOpen: false });
    }
  };

  _loadMoreComments = () => {
    const { getReplies, comments } = this.props;

    if (comments && comments.length > 0) {
      getReplies({
        author: comments[comments.length - 1].author,
        permlink: comments[comments.length - 1].permlink,
      });
    }
  };

  _handleOnSummaryExpanded = () => {
    const { isSummaryOpen } = this.state;

    if (!isSummaryOpen) {
      this.setState({ isSummaryOpen: true });
    }
  };

  _handleUIChange = (height) => {
    this.setState({ collapsibleMoreHeight: height });
  };

  _getTabLabel = (value) => {
    if (value.length > 10) {
      return `${value.substring(0, 10)}...`;
    }
    return value;
  };

  _onTabChange = ({ i }) => {
    const { estimatedWalletValue, oldEstimatedWalletValue } = this.state;

    if (i !== 2) {
      this.setState({
        estimatedWalletValue: 0,
        oldEstimatedWalletValue: estimatedWalletValue,
      });
    } else {
      this.setState({ estimatedWalletValue: oldEstimatedWalletValue });
    }
  };

  _renderProfileContent = () => {
    const {
      about,
      follows,
      handleFollowUnfollowUser,
      handleMuteUnmuteUser,
      handleOnFavoritePress,
      handleOnFollowsPress,
      handleOnPressProfileEdit,
      intl,
      isDarkTheme,
      isFavorite,
      isFollowing,
      isLoggedIn,
      isMuted,
      isOwnProfile,
      isProfileLoading,
      isReady,
      resourceCredits,
      selectedUser,
      votingPower,
    } = this.props;

    const { isSummaryOpen, collapsibleMoreHeight } = this.state;

    return !isReady ? (
      <ProfileSummaryPlaceHolder />
    ) : (
      <CollapsibleCard
        title={get(about, 'about')}
        isTitleCenter
        defaultTitle={intl.formatMessage({
          id: 'profile.details',
        })}
        expanded={!isOwnProfile}
        isExpanded={isSummaryOpen}
        handleOnExpanded={this._handleOnSummaryExpanded}
        moreHeight={collapsibleMoreHeight}
      >
        <ProfileSummary
          date={getFormatedCreatedDate(get(selectedUser, 'created'))}
          about={about}
          followerCount={follows.follower_count}
          followingCount={follows.following_count}
          handleFollowUnfollowUser={handleFollowUnfollowUser}
          handleMuteUnmuteUser={handleMuteUnmuteUser}
          handleOnFavoritePress={handleOnFavoritePress}
          handleOnFollowsPress={handleOnFollowsPress}
          handleUIChange={this._handleUIChange}
          hoursRC={Math.ceil((100 - resourceCredits) * 0.833333) || null}
          hoursVP={Math.ceil((100 - votingPower) * 0.833333) || null}
          intl={intl}
          isDarkTheme={isDarkTheme}
          isFavorite={isFavorite}
          isFollowing={isFollowing}
          isLoggedIn={isLoggedIn}
          isMuted={isMuted}
          isOwnProfile={isOwnProfile}
          isProfileLoading={isProfileLoading}
          percentRC={resourceCredits}
          percentVP={votingPower}
          handleOnPressProfileEdit={handleOnPressProfileEdit}
        />
      </CollapsibleCard>
    );
  };

  _contentComentsTab = () => {
    const { comments, getReplies, intl, isOwnProfile, username, isHideImage } = this.props;

    return (
      <View key="profile.comments" style={styles.commentsTabBar}>
        {comments && comments.length > 0 ? (
          <ScrollView
            onScroll={({ nativeEvent }) => {
              this._handleOnScroll();
              if (this._isCloseToBottom(nativeEvent)) {
                this._loadMoreComments();
              }
            }}
            contentContainerStyle={styles.scrollContentContainer}
            //scrollEventThrottle={16}
          >
            <Comments
              isProfilePreview
              comments={comments}
              fetchPost={getReplies}
              isOwnProfile={isOwnProfile}
              isHideImage={isHideImage}
            />
          </ScrollView>
        ) : (
          <NoPost
            name={username}
            text={intl.formatMessage({
              id: 'profile.havent_commented',
            })}
            defaultText={intl.formatMessage({
              id: 'profile.login_to_see',
            })}
          />
        )}
      </View>
    );
  };

  _contentWalletTab = () => {
    const { currencyRate, currencySymbol, selectedUser } = this.props;

    const { isSummaryOpen, estimatedWalletValue } = this.state;
    return (
      <View
        key="profile.wallet"
        tabLabel={
          estimatedWalletValue
            ? `${currencySymbol} ${(estimatedWalletValue * currencyRate).toFixed()}`
            : null
        }
      >
        {selectedUser ? (
          <Wallet
            setEstimatedWalletValue={(value) => this.setState({ estimatedWalletValue: value })}
            selectedUser={selectedUser}
            handleOnScroll={isSummaryOpen ? this._handleOnScroll : null}
          />
        ) : (
          <WalletDetailsPlaceHolder />
        )}
      </View>
    );
  };

  _renderTabs = () => {
    const { changeForceLoadPostState, forceLoadPost, username, isOwnProfile } = this.props;

    const { isSummaryOpen } = this.state;

    const filterOptions = isOwnProfile ? PROFILE_FILTERS_OWN : PROFILE_FILTERS;

    //compile content overrides
    const tabContentOverrides = new Map();
    tabContentOverrides.set(2, this._contentComentsTab());
    if (!isOwnProfile) {
      tabContentOverrides.set(3, this._contentWalletTab());
    }

    return (
      <View style={styles.postTabBar}>
        <TabbedPosts
          filterOptions={filterOptions}
          filterOptionsValue={PROFILE_FILTERS_VALUE}
          selectedOptionIndex={0}
          pageType="profiles"
          getFor="blog"
          feedUsername={username}
          key={username}
          handleOnScroll={isSummaryOpen ? this._handleOnScroll : null}
          forceLoadPost={forceLoadPost}
          changeForceLoadPostState={changeForceLoadPostState}
          isFeedScreen={false}
          tabContentOverrides={tabContentOverrides}
          onChangeTab={this._onTabChange}
          imagesToggleEnabled={false}
        />
      </View>
    );
  };

  _isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
  }

  render() {
    const { handleOnBackPress, isOwnProfile, quickProfile } = this.props;

    return (
      <View style={styles.container}>
        <Header
          key={quickProfile && quickProfile.name}
          selectedUser={quickProfile}
          isReverse={!isOwnProfile}
          handleOnBackPress={handleOnBackPress}
        />
        <View style={styles.container}>
          {this._renderProfileContent()}
          {this._renderTabs()}
        </View>
      </View>
    );
  }
}

export default injectIntl(ProfileView);
