import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';

// Providers
import {
  followUser,
  unfollowUser,
  ignoreUser,
  getFollows,
  getRepliesByLastUpdate,
  getUserComments,
  getUser,
  getIsFollowing,
  getIsMuted,
} from '../../../providers/steem/dsteem';

// Esteem providers
import { getIsFavorite, addFavorite, removeFavorite } from '../../../providers/esteem/esteem';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Components
import ProfileScreen from '../screen/profileScreen';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    const isReverseHeader = !!(
      props.navigation.state
      && props.navigation.state.params
      && props.navigation.state.username
    );

    this.state = {
      comments: [],
      follows: {},
      isFavorite: false,
      isFollowing: false,
      isMuted: false,
      isProfileLoading: false,
      isReady: false,
      isReverseHeader,
      user: null,
      selectedQuickProfile: null,
    };
  }

  componentDidMount = () => {
    const { navigation, isLoggedIn, currentAccount } = this.props;
    const selectedUser = navigation.state && navigation.state.params;

    if (!isLoggedIn && !selectedUser) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (selectedUser && selectedUser.username && selectedUser.username !== currentAccount.name) {
      this._loadProfile(selectedUser.username);

      if (selectedUser.username) {
        const selectedQuickProfile = {
          reputation: selectedUser.reputation,
          name: selectedUser.username,
        };

        this.setState({ selectedQuickProfile });
      }

      this.setState({ isReverseHeader: true });
    } else {
      this._loadProfile(currentAccount.name);
    }
  };

  componentWillReceiveProps(nextProps) {
    const {
      navigation, currentAccount, activeBottomTab, isLoggedIn,
    } = this.props;
    const currentUsername = currentAccount.name !== nextProps.currentAccount.name && nextProps.currentAccount.name;

    if (isLoggedIn && !nextProps.isLoggedIn) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (currentUsername) {
      this._loadProfile(currentUsername);
    }

    if (
      activeBottomTab !== nextProps.activeBottomTab
      && nextProps.activeBottomTab === 'ProfileTabbar'
    ) {
      this._loadProfile(currentAccount.name);
    }
  }

  _getReplies = async (user) => {
    const { isReverseHeader } = this.state;
    if (isReverseHeader) {
      await getUserComments({ start_author: user, limit: 10 }).then((result) => {
        this.setState({
          comments: result,
        });
      });
    } else {
      await getRepliesByLastUpdate({ start_author: user, limit: 10 }).then((result) => {
        this.setState({
          comments: result,
        });
      });
    }
  };

  _handleFollowUnfollowUser = async (isFollowAction) => {
    const { isFollowing } = this.state;

    this.setState({
      isProfileLoading: true,
    });

    if (isFollowAction && !isFollowing) {
      this._followUser();
    } else {
      this._unfollowUser();
    }
  };

  _handleMuteUnmuteUser = (isMuteAction) => {
    this.setState({
      isProfileLoading: true,
    });

    if (isMuteAction) {
      this._muteUser();
    } else {
      this._unfollowUser();
    }
  };

  _unfollowUser = () => {
    const { username } = this.state;
    const { currentAccount, pinCode } = this.props;
    const follower = currentAccount.name;
    const following = username;

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

  _followUser = () => {
    const { username } = this.state;
    const { currentAccount, pinCode } = this.props;
    const follower = currentAccount.name;
    const following = username;

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

  _muteUser = () => {
    const { username } = this.state;
    const { currentAccount, pinCode } = this.props;
    const follower = currentAccount.name;
    const following = username;

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

    if (error) {
      this.setState(
        {
          error,
        },
        () => alert(error),
      );
    } else {
      this._fetchProfile(username, true);
    }
  };

  _fetchProfile = async (username = null, isProfileAction = false) => {
    const { username: _username, isFollowing, isMuted } = this.state;

    if (username) {
      const { isLoggedIn, currentAccount } = this.props;
      let _isFollowing;
      let _isMuted;
      let isFavorite;
      let follows;

      if (isLoggedIn && currentAccount.name !== username) {
        _isFollowing = await getIsFollowing(username, currentAccount.name);

        _isMuted = _isFollowing ? false : await getIsMuted(username, currentAccount.name);

        getIsFavorite(username, currentAccount.name).then((isFav) => {
          isFavorite = isFav;
        });
      }

      try {
        follows = await getFollows(username);
      } catch (err) {
        follows = null;
      }

      /**
       * This follow code totally a work arround
       * Ceated for server response delay.
       */
      if (isProfileAction && (isFollowing === _isFollowing && isMuted === _isMuted)) {
        this._fetchProfile(_username, true);
      } else {
        this.setState({
          follows,
          isFollowing: _isFollowing,
          isMuted: _isMuted,
          isFavorite,
          isReady: true,
          isProfileLoading: false,
        });
      }
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

  _addFavorite = () => {
    const { currentAccount } = this.props;
    const { username } = this.state;

    addFavorite(currentAccount.name, username).then(() => {
      this.setState({ isFavorite: true });
    });
  };

  _removeFavorite = () => {
    const { currentAccount } = this.props;
    const { username } = this.state;

    removeFavorite(currentAccount.name, username).then(() => {
      this.setState({ isFavorite: false });
    });
  };

  _handleOnFavoritePress = (isFavorite) => {
    if (isFavorite) {
      this._removeFavorite();
    } else {
      this._addFavorite();
    }
  };

  _handleOnBackPress = () => {
    const { navigation } = this.props;
    const navigationParams = navigation.state && navigation.state.params;

    if (navigationParams && navigationParams.fetchData) {
      navigationParams.fetchData();
    }
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
    const {
      isDarkTheme, isLoggedIn, currency, navigation,
    } = this.props;
    const activePage = (navigation.state.params && navigation.state.params.activePage) || 0;

    return (
      <ProfileScreen
        about={user && user.about && user.about.profile}
        activePage={activePage}
        avatar={avatar}
        comments={comments}
        currency={currency}
        error={error}
        follows={follows}
        getReplies={() => this._getReplies(username)}
        handleFollowUnfollowUser={this._handleFollowUnfollowUser}
        handleMuteUnmuteUser={this._handleMuteUnmuteUser}
        handleOnBackPress={this._handleOnBackPress}
        handleOnFavoritePress={this._handleOnFavoritePress}
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
    );
  }
}

const mapStateToProps = state => ({
  // Applicaiton
  isLoggedIn: state.application.isLoggedIn,
  isDarkTheme: state.application.isDarkTheme,
  currency: state.application.currency,

  // Ui
  activeBottomTab: state.ui.activeBottomTab,

  // Account
  currentAccount: state.account.currentAccount,
  pinCode: state.account.pin,
});

export default connect(mapStateToProps)(withNavigation(ProfileContainer));
