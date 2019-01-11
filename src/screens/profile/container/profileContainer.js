import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';

// Providers
import {
  followUser,
  unfollowUser,
  ignoreUser,
  getFollows,
  getRepliesByLastUpdate,
  getUser,
  getIsFollowing,
  getIsMuted,
} from '../../../providers/steem/dsteem';

// Esteem providers
import { getIsFavorite } from '../../../providers/esteem/esteem';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Components
import ProfileScreen from '../screen/profileScreen';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      follows: {},
      isFavorite: false,
      isFollowing: false,
      isMuted: false,
      isProfileLoading: false,
      isReady: false,
      isReverseHeader: !!(props.navigation.state && props.navigation.state.params),
      user: null,
      selectedQuickProfile: null,
    };
  }

  componentDidMount = () => {
    const { navigation, isLoggedIn } = this.props;
    const selectedUser = navigation.state && navigation.state.params;

    if (!isLoggedIn && !selectedUser) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (selectedUser) {
      this._loadProfile(selectedUser.username);

      if (selectedUser.username) {
        const selectedQuickProfile = {
          reputation: selectedUser.reputation,
          name: selectedUser.username,
        };

        this.setState({ selectedQuickProfile });
      }

      this.setState({ isReverseHeader: true });
    }
  };

  componentWillReceiveProps(nextProps) {
    const {
      navigation, currentAccount, activeBottomTab, isLoggedIn,
    } = this.props;
    const currentUsername = currentAccount.name
      !== nextProps.currentAccount.name
      && nextProps.currentAccount.name;
    const isParamsChange = nextProps.navigation.state
      && navigation.state
      && nextProps.navigation.state.params
      && nextProps.navigation.state.params.username
      && nextProps.navigation.state.params.username !== navigation.state.params.username;

    if (isLoggedIn && !nextProps.isLoggedIn) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (currentUsername) {
      this._loadProfile(currentUsername);
    }

    if (activeBottomTab !== nextProps.activeBottomTab && nextProps.activeBottomTab === 'ProfileTabbar') {
      this._loadProfile(currentAccount.name);
    }

    if (isParamsChange) {
      const selectedUser = nextProps.navigation.state && nextProps.navigation.state.params;

      this._loadProfile(selectedUser && selectedUser.username);
    }
  }

  _getReplies = async (user) => {
    await getRepliesByLastUpdate({ start_author: user, limit: 10 })
      .then((result) => {
        this.setState({
          isReady: true,
          comments: result,
        });
      })
      .catch(() => {});
  };

  _handleFollowUnfollowUser = async (isFollowAction) => {
    const { username, isFollowing } = this.state;
    const { currentAccount, pinCode } = this.props;

    this.setState({
      isProfileLoading: true,
    });

    if (isFollowAction && !isFollowing) {
      this._followUser(currentAccount, pinCode, currentAccount.name, username);
    } else {
      this._unfollowUser(currentAccount, pinCode, currentAccount.name, username);
    }
  };

  _handleMuteUnmuteUser = async (isMuteAction) => {
    const { username } = this.state;
    const { currentAccount, pinCode } = this.props;

    this.setState({
      isProfileLoading: true,
    });

    if (isMuteAction) {
      this._muteUser(currentAccount, pinCode, currentAccount.name, username);
    }
  };

  _unfollowUser = (currentAccount, pinCode, follower, following) => {
    unfollowUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        this._profileActionDone();
      })
      .catch((err) => {
        this._profileActionDone(err);
      });
  };

  _followUser = (currentAccount, pinCode, follower, following) => {
    followUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        this._profileActionDone();
      })
      .catch((err) => {
        this._profileActionDone(err);
      });
  };

  _muteUser = async (currentAccount, pinCode, follower, following) => {
    ignoreUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        this._profileActionDone();
      })
      .catch((err) => {
        this._profileActionDone(err);
      });
  };

  _profileActionDone = (error = null) => {
    const { username } = this.state;

    this.setState({
      isProfileLoading: false,
    });

    if (error) {
      this.setState({
        error,
      });
      alert(error);
    } else {
      this._fetchProfile(username);
    }
  };

  _fetchProfile = async (username = null) => {
    if (username) {
      const { isLoggedIn, currentAccount } = this.props;
      let _isFollowing;
      let _isMuted;
      let _isFavorite;
      let _follows;

      if (isLoggedIn && currentAccount.name !== username) {
        _isFollowing = await getIsFollowing(username, currentAccount.name);

        _isMuted = _isFollowing ? false : await getIsMuted(username, currentAccount.name);

        _isFavorite = getIsFavorite(username, currentAccount.name);
      }

      await getFollows(username).then((res) => {
        _follows = res;
      });

      this.setState({
        follows: _follows,
        isFollowing: _isFollowing,
        isMuted: _isMuted,
        isFavorite: _isFavorite,
      });
    }
  };

  _loadProfile = async (selectedUser = null) => {
    const user = await getUser(selectedUser);

    this._fetchProfile(selectedUser);

    this.setState(prevState => ({
      selectedQuickProfile: {
        ...prevState.selectedQuickProfile,
        display_name: user.display_name,
        reputation: user.reputation,
      },
    }));

    this.setState(
      {
        user,
        username: selectedUser,
      },
      () => {
        this._getReplies(selectedUser);
      },
    );
  };

  _handleFollowsPress = async (isFollowingPress) => {
    const { navigation } = this.props;
    const { username, follows } = this.state;
    let count;

    if (!isFollowingPress) {
      count = follows.follower_count;
    } else {
      count = follows.following_count;
    }

    navigation.navigate({
      routeName: ROUTES.SCREENS.FOLLOWS,
      params: {
        isFollowingPress,
        count,
        username,
      },
      key: `${username}${count}`,
    });
  };

  render() {
    const {
      avatar,
      comments,
      error,
      follows,
      isFavorite,
      isFollowing,
      isMuted,
      isProfileLoading,
      isReady,
      isReverseHeader,
      selectedQuickProfile,
      user,
      username,
    } = this.state;
    const { isDarkTheme, isLoggedIn } = this.props;

    return (
      <Fragment>
        <ProfileScreen
          about={user && user.about && user.about.profile}
          avatar={avatar}
          comments={comments}
          error={error}
          follows={follows}
          handleFollowUnfollowUser={this._handleFollowUnfollowUser}
          handleMuteUnmuteUser={this._handleMuteUnmuteUser}
          handleOnFollowsPress={this._handleFollowsPress}
          isDarkTheme={isDarkTheme}
          isFavorite={isFavorite}
          isFollowing={isFollowing}
          isLoggedIn={isLoggedIn}
          isMuted={isMuted}
          isProfileLoading={isProfileLoading}
          isReady={isReady}
          isReverseHeader={isReverseHeader}
          selectedQuickProfile={selectedQuickProfile}
          selectedUser={user}
          username={username}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.account.pin,
  isDarkTheme: state.application.isDarkTheme,
  activeBottomTab: state.ui.activeBottomTab,
});

export default connect(mapStateToProps)(withNavigation(ProfileContainer));
