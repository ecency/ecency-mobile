import React from 'react';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import { Profile } from '../../../components';
import { ProfileContainer } from '../../../containers';

const ProfileScreen = ({ route }) => (
  <ProfileContainer route={route}>
    {({
      about,
      activePage,
      avatar,
      changeForceLoadPostState,
      comments,
      currency,
      currencyRate,
      currencySymbol,
      error,
      follows,
      forceLoadPost,
      getReplies,
      handleFollowUnfollowUser,
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
      isHideImage,
      isLoggedIn,
      isMuted,
      isOwnProfile,
      isProfileLoading,
      isReady,
      quickProfile,
      resourceCredits,
      selectedUser,
      setEstimatedWalletValue,
      username,
      votingPower,
      reverseHeader,
      deepLinkFilter,
    }) => (
      <Profile
        about={about}
        activePage={activePage}
        avatar={avatar}
        changeForceLoadPostState={changeForceLoadPostState}
        comments={comments}
        currency={currency}
        currencyRate={currencyRate}
        currencySymbol={currencySymbol}
        error={error}
        follows={follows}
        forceLoadPost={forceLoadPost}
        getReplies={getReplies}
        handleFollowUnfollowUser={handleFollowUnfollowUser}
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
        setEstimatedWalletValue={setEstimatedWalletValue}
        username={username}
        votingPower={votingPower || 0}
        isHideImage={isHideImage}
        reverseHeader={reverseHeader}
        deepLinkFilter={deepLinkFilter}
      />
    )}
  </ProfileContainer>
);

export default gestureHandlerRootHOC(ProfileScreen);
