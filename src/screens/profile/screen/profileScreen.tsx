import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import { Profile } from '../../../components';
import { ProfileContainer } from '../../../containers';

const ProfileScreen = ({ route }: any) => (
  <ProfileContainer route={route}>
    {({
      about,
      activePage,
      avatar,
      comments,
      currency,
      currencyRate,
      currencySymbol,
      error,
      follows,
      getReplies,
      handleFollowUnfollowUser,
      handleMessage,
      handleMuteUnmuteUser,
      handleOnBackPress,
      handleOnFavoritePress,
      handleOnFollowsPress,
      handleOnPressProfileEdit,
      handleReportUser,
      handleDelegateHp,
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
      reverseHeader,
      deepLinkFilter,
    }: any) => (
      <Profile
        about={about}
        activePage={activePage}
        avatar={avatar}
        comments={comments}
        currency={currency}
        currencyRate={currencyRate}
        currencySymbol={currencySymbol}
        error={error}
        follows={follows}
        getReplies={getReplies}
        handleFollowUnfollowUser={handleFollowUnfollowUser}
        handleMessage={handleMessage}
        handleMuteUnmuteUser={handleMuteUnmuteUser}
        handleOnBackPress={handleOnBackPress}
        handleOnFavoritePress={handleOnFavoritePress}
        handleOnFollowsPress={handleOnFollowsPress}
        handleOnPressProfileEdit={handleOnPressProfileEdit}
        handleReportUser={handleReportUser}
        handleDelegateHp={handleDelegateHp}
        isDarkTheme={isDarkTheme}
        isFavorite={isFavorite}
        isFollowing={isFollowing}
        isLoggedIn={isLoggedIn}
        isMuted={isMuted}
        isOwnProfile={isOwnProfile}
        isProfileLoading={isProfileLoading}
        isReady={isReady}
        quickProfile={quickProfile}
        resourceCredits={resourceCredits || 0}
        selectedUser={selectedUser}
        username={username}
        votingPower={votingPower || 0}
        reverseHeader={reverseHeader}
        deepLinkFilter={deepLinkFilter}
      />
    )}
  </ProfileContainer>
);

export default gestureHandlerRootHOC(ProfileScreen);
