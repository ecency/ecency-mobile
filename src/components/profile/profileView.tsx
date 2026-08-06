import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import { connect } from 'react-redux';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollapsibleCard } from '../collapsibleCard';
import { Header } from '../header';
import { ProfileSummaryPlaceHolder, WalletDetailsPlaceHolder } from '../basicUIElements';
import { ProfileSummary } from '../profileSummary';
import { Wallet } from '../wallet';
import { IconButton } from '../iconButton';
import { navigationRef } from '../../navigation/rootNavigation';

// Constants
import { getDefaultFilters, getFilterMap } from '../../constants/options/filters';

// Utils
import { getFormatedCreatedDate } from '../../utils/time';
import { parseReputation } from '../../utils/user';

// Styles
import styles from './profileStyles';

import { TabbedPosts } from '../tabbedPosts';
import CommentsTabContent from './children/commentsTabContent';
import WavesTabContent from './children/wavesTabContent';
import { Icon } from '..';

// Profile summary collapse/expand is driven by feed scroll. A dead zone + cooldown keep
// the header from oscillating: collapse only once scrolled well past the top, re-expand
// only within a few px of the top, and ignore further flips for COOLDOWN ms (>= the 500ms
// CollapsibleCard height animation) so the reflow that animation causes — which momentarily
// reports offsetY≈0 on FlashList — can't re-trigger the opposite toggle.
const SUMMARY_COLLAPSE_THRESHOLD = 80;
const SUMMARY_EXPAND_THRESHOLD = 8;
const SUMMARY_TOGGLE_COOLDOWN_MS = 550;
// The header also reveals mid-list once the user has dragged upward this many px in one
// continuous run (#1915). Because the header can now be open while scrolled deep into the
// list, collapse must be direction-aware as well or the next cooldown recheck past the
// threshold would immediately undo a mid-list reveal: both legs read one signed run that
// accumulates same-direction deltas and resets when direction flips. Per-event deltas at
// or above the jump size are layout blips (the post-toggle reflow, tab switches), not
// user scrolling: they zero the run, because a stale blip-inflated run would otherwise
// mistoggle when the cooldown recheck fires.
const SUMMARY_REVEAL_SCROLL_UP_PX = 60;
const SUMMARY_COLLAPSE_RUN_PX = 20;
const SUMMARY_LAYOUT_JUMP_PX = 250;

class ProfileView extends PureComponent<any, any> {
  _lastSummaryToggleAt = 0;

  _lastOffsetY = 0;

  // signed: positive = downward scrolling, negative = upward
  _scrollRun = 0;

  _summaryRecheckTimer: any = null;

  constructor(props: any) {
    super(props);
    this.state = {
      isSummaryOpen: true,
      collapsibleMoreHeight: 0,
      estimatedWalletValue: 0,
      oldEstimatedWalletValue: 0,
    };
  }

  componentWillUnmount() {
    if (this._summaryRecheckTimer) {
      clearTimeout(this._summaryRecheckTimer);
    }
  }

  // Decide collapse/expand from the latest scroll offset, honoring the dead zone and the
  // post-toggle cooldown. If a wanted toggle lands inside the cooldown, re-evaluate once it
  // clears using the most recent offset — so returning to the top still settles (re-expands)
  // even when no further scroll event arrives (otherwise that lone toggle event is dropped).
  _evaluateSummary = () => {
    const { isSummaryOpen } = this.state;
    const offsetY = this._lastOffsetY;
    const wantCollapse =
      isSummaryOpen &&
      offsetY > SUMMARY_COLLAPSE_THRESHOLD &&
      this._scrollRun >= SUMMARY_COLLAPSE_RUN_PX;
    const wantExpand =
      !isSummaryOpen &&
      (offsetY <= SUMMARY_EXPAND_THRESHOLD || this._scrollRun <= -SUMMARY_REVEAL_SCROLL_UP_PX);
    if (!wantCollapse && !wantExpand) {
      return;
    }

    const now = Date.now();
    const elapsed = now - this._lastSummaryToggleAt;
    if (elapsed < SUMMARY_TOGGLE_COOLDOWN_MS) {
      if (this._summaryRecheckTimer) {
        clearTimeout(this._summaryRecheckTimer);
      }
      this._summaryRecheckTimer = setTimeout(() => {
        this._summaryRecheckTimer = null;
        this._evaluateSummary();
      }, SUMMARY_TOGGLE_COOLDOWN_MS - elapsed + 20);
      return;
    }

    this._lastSummaryToggleAt = now;
    this._scrollRun = 0;
    this.setState({ isSummaryOpen: wantExpand });
  };

  _handleOnScroll = (event: any) => {
    const offsetY = event?.nativeEvent?.contentOffset?.y;
    if (offsetY === undefined) {
      return;
    }
    const delta = offsetY - this._lastOffsetY;
    if (Math.abs(delta) >= SUMMARY_LAYOUT_JUMP_PX) {
      this._scrollRun = 0;
    } else if (delta !== 0) {
      const sameDirection = delta > 0 === this._scrollRun > 0 || this._scrollRun === 0;
      this._scrollRun = sameDirection ? this._scrollRun + delta : delta;
    }
    this._lastOffsetY = offsetY;
    this._evaluateSummary();
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
      // Stamp the cooldown clock like the scroll-driven path, otherwise a tap-expand while
      // scrolled past the threshold leaves the timestamp stale and the next scroll event
      // immediately re-collapses the header.
      this._lastSummaryToggleAt = Date.now();
      this.setState({ isSummaryOpen: true });
    }
  };

  _handleUIChange = (height: any) => {
    this.setState({ collapsibleMoreHeight: height });
  };

  _getTabLabel = (value: any) => {
    if (value.length > 10) {
      return `${value.substring(0, 10)}...`;
    }
    return value;
  };

  _onTabChange = ({ i }: any) => {
    const { estimatedWalletValue, oldEstimatedWalletValue } = this.state;
    const { isOwnProfile, profileTabs, ownProfileTabs } = this.props;
    const pageType = isOwnProfile ? 'ownProfile' : 'profile';
    const tabs = (isOwnProfile ? ownProfileTabs : profileTabs) || getDefaultFilters(pageType);
    const walletIndex = tabs.indexOf('wallet');

    if (i !== walletIndex || walletIndex === -1) {
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
      handleMessage,
    } = this.props;

    const { isSummaryOpen, collapsibleMoreHeight } = this.state;

    const reputation = get(selectedUser, 'reputation');
    const displayName = get(about, 'name', '');

    return !isReady ? (
      <ProfileSummaryPlaceHolder />
    ) : (
      <CollapsibleCard
        title=""
        defaultTitle=""
        titleComponent={<View />}
        isExpanded={isSummaryOpen}
        handleOnExpanded={this._handleOnSummaryExpanded}
        moreHeight={collapsibleMoreHeight}
        fitContent
        noBorder
      >
        <ProfileSummary
          date={getFormatedCreatedDate(get(selectedUser, 'created'))}
          about={about}
          displayName={displayName}
          reputation={reputation ? parseReputation(reputation) : ''}
          followerCount={follows ? follows.follower_count : 0}
          followingCount={follows ? follows.following_count : 0}
          handleFollowUnfollowUser={handleFollowUnfollowUser}
          handleMessage={handleMessage}
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

  _contentComentsTab = (type: any) => {
    const { username, isOwnProfile, selectedUser } = this.props;
    return (
      <CommentsTabContent
        username={username}
        selectedUser={selectedUser}
        isOwnProfile={isOwnProfile}
        type={type}
        onScroll={this._handleOnScroll as any}
      />
    );
  };

  _contentWavesTab = () => {
    const { username, isOwnProfile } = this.props;
    return (
      <WavesTabContent
        username={username}
        isOwnProfile={isOwnProfile}
        onScroll={this._handleOnScroll as any}
      />
    );
  };

  _contentWalletTab = () => {
    const { currencyRate, currencySymbol, selectedUser, isOwnProfile } = this.props;
    const { estimatedWalletValue } = this.state;
    const displayCurrencySymbol = isOwnProfile ? currencySymbol ?? '$' : '$';
    const displayCurrencyRate = isOwnProfile && currencyRate ? currencyRate : 1;

    return (
      <View
        key="profile.wallet"
        {...({
          tabLabel: estimatedWalletValue
            ? `${displayCurrencySymbol} ${(estimatedWalletValue * displayCurrencyRate).toFixed(2)}`
            : null,
        } as any)}
      >
        {selectedUser ? (
          <Wallet
            setEstimatedWalletValue={(value: any) => this.setState({ estimatedWalletValue: value })}
            selectedUser={selectedUser}
            handleOnScroll={this._handleOnScroll}
            forceUsdEstimate={!isOwnProfile}
          />
        ) : (
          <WalletDetailsPlaceHolder />
        )}
      </View>
    );
  };

  _renderTabs = () => {
    const { about, username, isOwnProfile, profileTabs, ownProfileTabs, deepLinkFilter } =
      this.props;

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

    const tabFilters = tabs.map((key: any) => ({
      filterKey: key,
      label: getFilterMap(pageType)[key],
    }));

    // compile content overrides
    const tabContentOverrides = new Map();
    if (tabs.indexOf('replies') !== -1) {
      tabContentOverrides.set(tabs.indexOf('replies'), this._contentComentsTab('replies'));
    }
    if (tabs.indexOf('comments') !== -1) {
      tabContentOverrides.set(tabs.indexOf('comments'), this._contentComentsTab('comments'));
    }
    if (tabs.indexOf('waves') !== -1) {
      tabContentOverrides.set(tabs.indexOf('waves'), this._contentWavesTab());
    }
    if (tabs.indexOf('wallet') !== -1) {
      tabContentOverrides.set(tabs.indexOf('wallet'), this._contentWalletTab());
    }

    return (
      <View style={styles.postTabBar}>
        <TabbedPosts
          key={username + JSON.stringify(tabFilters)}
          tabFilters={tabFilters}
          selectedOptionIndex={selectedIndex}
          pageType={pageType}
          feedUsername={username}
          // Begin-drag intentionally not wired (prop omitted): toggling on touch-start (a
          // stationary touch or tiny drag) only fed the oscillation. onScrollEndDrag drives
          // collapse instead.
          handleOnScroll={this._handleOnScroll}
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

  render() {
    const { handleOnBackPress, quickProfile, reverseHeader, isMuted } = this.props;
    const { isSummaryOpen } = this.state;

    return (
      <View style={styles.container}>
        {!isSummaryOpen && (
          <Header
            key={quickProfile && quickProfile.name}
            selectedUser={quickProfile}
            isReverse={reverseHeader}
            handleOnBackPress={handleOnBackPress}
          />
        )}
        <View style={styles.container}>
          {this._renderProfileContent()}
          {!isMuted ? this._renderTabs() : this._renderMutedView()}
        </View>
        {isSummaryOpen && (
          <SafeAreaView edges={['top']} style={styles.floatingBackContainer}>
            <IconButton
              style={styles.floatingBackButton}
              iconStyle={styles.floatingBackIcon}
              name="arrow-back"
              onPress={() => {
                if (handleOnBackPress) {
                  handleOnBackPress();
                }
                if (navigationRef.isReady()) {
                  navigationRef.goBack();
                }
              }}
            />
          </SafeAreaView>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state: any) => ({
  profileTabs: state.customTabs.profileTabs,
  ownProfileTabs: state.customTabs.ownProfileTabs,
});

export default injectIntl(connect(mapStateToProps)(ProfileView));
