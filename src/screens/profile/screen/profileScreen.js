import React, { PureComponent } from 'react';
import { injectIntl } from 'react-intl';

import { Profile } from '../../../components';
import { ProfileContainer } from '../../../containers';

class ProfileScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <ProfileContainer>
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
          setEstimatedWalletValue,
          username,
          votingPower,
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
            isDarkTheme={isDarkTheme}
            isFavorite={isFavorite}
            isFollowing={isFollowing}
            isLoggedIn={isLoggedIn}
            isMuted={isMuted}
            isOwnProfile={isOwnProfile}
            isProfileLoading={isProfileLoading}
            isReady={isReady}
            quickProfile={quickProfile}
            resourceCredits={resourceCredits}
            selectedUser={selectedUser}
            setEstimatedWalletValue={setEstimatedWalletValue}
            username={username}
            votingPower={votingPower}
          />
        )}
      </ProfileContainer>
    );
  }
}

export default injectIntl(ProfileScreen);
