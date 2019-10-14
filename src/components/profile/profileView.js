import React, { PureComponent, Fragment } from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import ScrollableTabView from 'react-native-scrollable-tab-view';

// Components
import { CollapsibleCard } from '../collapsibleCard';
import { Comments } from '../comments';
import { Header } from '../header';
import { NoPost, ProfileSummaryPlaceHolder, WalletDetailsPlaceHolder } from '../basicUIElements';
import { Posts } from '../posts';
import { ProfileSummary } from '../profileSummary';
import { TabBar } from '../tabBar';
import { Wallet } from '../wallet';

// Constants
import { PROFILE_FILTERS } from '../../constants/options/filters';

// Utils
import { getFormatedCreatedDate } from '../../utils/time';

// Styles
import styles from './profileStyles';
import globalStyles from '../../globalStyles';

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

    if (isSummaryOpen) this.setState({ isSummaryOpen: false });
  };

  _handleOnSummaryExpanded = () => {
    const { isSummaryOpen } = this.state;

    if (!isSummaryOpen) this.setState({ isSummaryOpen: true });
  };

  _handleUIChange = height => {
    this.setState({ collapsibleMoreHeight: height });
  };

  render() {
    const {
      about,
      activePage,
      changeForceLoadPostState,
      comments,
      currencyRate,
      currencySymbol,
      follows,
      forceLoadPost,
      getReplies,
      handleFollowUnfollowUser,
      handleMuteUnmuteUser,
      handleOnBackPress,
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
      quickProfile,
      resourceCredits,
      selectedUser,
      username,
      votingPower,
      isHideImage,
    } = this.props;

    const {
      isSummaryOpen,
      collapsibleMoreHeight,
      estimatedWalletValue,
      oldEstimatedWalletValue,
    } = this.state;

    return (
      <Fragment>
        <Header
          key={quickProfile && quickProfile.name}
          selectedUser={quickProfile}
          isReverse={!isOwnProfile}
          handleOnBackPress={handleOnBackPress}
        />
        <SafeAreaView style={styles.container}>
          {!isReady ? (
            <ProfileSummaryPlaceHolder />
          ) : (
            <CollapsibleCard
              title={get(about, 'about')}
              isTitleCenter
              defaultTitle={intl.formatMessage({
                id: 'profile.details',
              })}
              expanded
              isExpanded={isSummaryOpen}
              handleOnExpanded={this._handleOnSummaryExpanded}
              moreHeight={collapsibleMoreHeight}
              // expanded={isLoggedIn}
              // locked={!isLoggedIn}
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
          )}

          <ScrollableTabView
            style={[globalStyles.tabView, styles.tabView]}
            initialPage={activePage}
            renderTabBar={() => (
              <TabBar style={styles.tabbar} tabUnderlineDefaultWidth={80} tabUnderlineScaleX={2} />
            )}
            onChangeTab={({ i }) => {
              if (i !== 2) {
                this.setState({
                  estimatedWalletValue: 0,
                  oldEstimatedWalletValue: estimatedWalletValue,
                });
              } else this.setState({ estimatedWalletValue: oldEstimatedWalletValue });
            }}
          >
            <View
              tabLabel={intl.formatMessage({
                id: 'profile.post',
              })}
              style={styles.postTabBar}
            >
              <Posts
                filterOptions={PROFILE_FILTERS}
                selectedOptionIndex={0}
                pageType="profiles"
                getFor="blog"
                tag={username}
                key={username}
                handleOnScroll={isSummaryOpen ? this._handleOnScroll : null}
                forceLoadPost={forceLoadPost}
                changeForceLoadPostState={changeForceLoadPostState}
              />
            </View>
            <View
              tabLabel={
                !isOwnProfile
                  ? intl.formatMessage({
                      id: 'profile.comments',
                    })
                  : intl.formatMessage({
                      id: 'profile.replies',
                    })
              }
              style={styles.commentsTabBar}
            >
              {comments && comments.length > 0 ? (
                <ScrollView onScroll={this._handleOnScroll}>
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
            <View
              tabLabel={
                estimatedWalletValue
                  ? `${currencySymbol} ${(estimatedWalletValue * currencyRate).toFixed()}`
                  : intl.formatMessage({
                      id: 'profile.wallet',
                    })
              }
            >
              {selectedUser ? (
                <Wallet
                  setEstimatedWalletValue={value => this.setState({ estimatedWalletValue: value })}
                  selectedUser={selectedUser}
                  handleOnScroll={isSummaryOpen ? this._handleOnScroll : null}
                />
              ) : (
                <WalletDetailsPlaceHolder />
              )}
            </View>
          </ScrollableTabView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default injectIntl(ProfileView);
