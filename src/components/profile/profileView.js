import React, { PureComponent } from 'react';
import { View, ScrollView } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import { connect } from 'react-redux';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { CollapsibleCard } from '../collapsibleCard';
import { Comments } from '../comments';
import { Header } from '../header';
import { NoPost, ProfileSummaryPlaceHolder, WalletDetailsPlaceHolder } from '../basicUIElements';
import { ProfileSummary } from '../profileSummary';
import { Wallet } from '../wallet';

// Constants
import { getDefaultFilters, getFilterMap } from '../../constants/options/filters';

// Utils
import { getFormatedCreatedDate } from '../../utils/time';

// Styles
import styles from './profileStyles';

import { TabbedPosts } from '../tabbedPosts';
import CommentsTabContent from './children/commentsTabContent';
import { Icon } from '..';

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
      handleReportUser,
      handleDelegateHp,
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
      username,
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
        // expanded={!isOwnProfile}
        isExpanded={isSummaryOpen}
        handleOnExpanded={this._handleOnSummaryExpanded}
        moreHeight={collapsibleMoreHeight}
      >
        <ProfileSummary
          date={getFormatedCreatedDate(get(selectedUser, 'created'))}
          about={about}
          followerCount={follows ? follows.follower_count : 0}
          followingCount={follows ? follows.following_count : 0}
          handleFollowUnfollowUser={handleFollowUnfollowUser}
          handleMuteUnmuteUser={handleMuteUnmuteUser}
          handleOnFavoritePress={handleOnFavoritePress}
          handleOnFollowsPress={handleOnFollowsPress}
          handleReportUser={handleReportUser}
          handleDelegateHp={handleDelegateHp}
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
          username={username}
        />
      </CollapsibleCard>
    );
  };

  _contentComentsTab = (type) => {
    const { username, isOwnProfile, selectedUser } = this.props;
    return (
      <CommentsTabContent
        username={username}
        selectedUser={selectedUser}
        isOwnProfile={isOwnProfile}
        type={type}
        onScroll={this._handleOnScroll}
      />
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
            ? `${currencySymbol} ${(estimatedWalletValue * currencyRate).toFixed(2)}`
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
    const {
      about,
      changeForceLoadPostState,
      forceLoadPost,
      username,
      isOwnProfile,
      profileTabs,
      ownProfileTabs,
      deepLinkFilter,
    } = this.props;

    const { isSummaryOpen } = this.state;
    const pageType = isOwnProfile ? 'ownProfile' : 'profile';
    const tabs = (isOwnProfile ? ownProfileTabs : profileTabs) || getDefaultFilters(pageType);

    // set initial tab based on deep link filter if available
    let selectedIndex = 0;
    if (deepLinkFilter) {
      selectedIndex = tabs.indexOf(deepLinkFilter);
      if (selectedIndex < 0) {
        tabs.pop();
        tabs.push(deepLinkFilter);
        selectedIndex = 2;
      }
    }

    const filterOptions = tabs.map((key) => getFilterMap(pageType)[key]);

    // compile content overrides
    const tabContentOverrides = new Map();

    tabContentOverrides.set(tabs.indexOf('replies'), this._contentComentsTab('replies'));
    tabContentOverrides.set(tabs.indexOf('comments'), this._contentComentsTab('comments'));
    tabContentOverrides.set(tabs.indexOf('wallet'), this._contentWalletTab());

    return (
      <View style={styles.postTabBar}>
        <TabbedPosts
          key={username + JSON.stringify(filterOptions)}
          filterOptions={filterOptions}
          filterOptionsValue={tabs}
          selectedOptionIndex={selectedIndex}
          pageType={pageType}
          getFor="blog"
          feedUsername={username}
          handleOnScroll={isSummaryOpen ? this._handleOnScroll : null}
          forceLoadPost={forceLoadPost}
          changeForceLoadPostState={changeForceLoadPostState}
          isFeedScreen={false}
          tabContentOverrides={tabContentOverrides}
          onChangeTab={this._onTabChange}
          pinnedPermlink={about?.pinned}
        />
      </View>
    );
  };

  _renderMutedView = () => {
    return (
      <View style={styles.mutedView}>
        <Icon
          iconType="MaterialCommunityIcons"
          name="volume-variant-off"
          size={120}
          color={EStyleSheet.value('$iconColor')}
          disabled={true}
        />
      </View>
    );
  };

  _isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
  }

  render() {
    const { handleOnBackPress, quickProfile, reverseHeader, isMuted } = this.props;

    return (
      <View style={styles.container}>
        <Header
          key={quickProfile && quickProfile.name}
          selectedUser={quickProfile}
          isReverse={reverseHeader}
          handleOnBackPress={handleOnBackPress}
        />
        <View style={styles.container}>
          {this._renderProfileContent()}
          {!isMuted ? this._renderTabs() : this._renderMutedView()}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  profileTabs: state.customTabs.profileTabs,
  ownProfileTabs: state.customTabs.ownProfileTabs,
});

export default injectIntl(connect(mapStateToProps)(ProfileView));
