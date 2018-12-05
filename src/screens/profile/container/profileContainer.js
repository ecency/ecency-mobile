import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

// Components
import { ProfileScreen } from '..';

// Utilitites
import {
  followUser,
  unfollowUser,
  ignoreUser,
  getFollows,
  getUserComments,
  getUser,
  getIsFollowing,
  getIsMuted,
  getFollowers,
  getFollowing,
} from '../../../providers/steem/dsteem';
import { decryptKey } from '../../../utils/crypto';
import { getDigitPinCode } from '../../../providers/steem/auth';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      follows: {},
      isFollowing: false,
      isMuted: false,
      isProfileLoading: false,
      isReady: false,
      isReverseHeader: !!(props.navigation.state && props.navigation.state.params),
      user: null,
    };
  }

  componentDidMount = () => {
    const { navigation, isLoggedIn, currentAccount } = this.props;
    const selectedUser = navigation.state && navigation.state.params;

    if (!isLoggedIn && !selectedUser) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (selectedUser) {
      this._loadProfile(selectedUser.username);
      this.setState({ isReverseHeader: true });
    } else {
      this._loadProfile(currentAccount.name);
    }
  };

  componentWillReceiveProps(nextProps) {
    const { navigation } = this.props;
    const isParamsChange = nextProps.navigation.state
      && navigation.state
      && nextProps.navigation.state.params
      && nextProps.navigation.state.params.username !== navigation.state.params.username;

    if (isParamsChange) {
      const selectedUser = nextProps.navigation.state && nextProps.navigation.state.params;

      this._loadProfile(selectedUser && selectedUser.username);
    }
  }

  _getComments = async (user) => {
    await getUserComments({ start_author: user, limit: 10 })
      .then((result) => {
        this.setState({
          isReady: true,
          comments: result,
        });
      })
      .catch((err) => {});
  };

  _handleFollowUnfollowUser = async (isFollowAction) => {
    const { username, isFollowing } = this.state;
    const { currentAccount } = this.props;
    const digitPinCode = await getDigitPinCode();

    const privateKey = decryptKey(currentAccount.local.postingKey, digitPinCode);

    this.setState({
      isProfileLoading: true,
    });

    if (isFollowAction && !isFollowing) {
      this._followUser(currentAccount.name, username, privateKey);
    } else {
      this._unfollowUser(currentAccount.name, username, privateKey);
    }
  };

  _handleMuteUnmuteUser = async (isMuteAction) => {
    const { username, isMuted } = this.state;
    const { currentAccount } = this.props;
    const digitPinCode = await getDigitPinCode();

    const privateKey = decryptKey(currentAccount.local.postingKey, digitPinCode);

    this.setState({
      isProfileLoading: true,
    });

    if (isMuteAction && !isMuted) {
      this._muteUser(currentAccount.name, username, privateKey);
    } else {
      this._muteUser(currentAccount.name, username, privateKey);
    }
  };

  _unfollowUser = (follower, following, privateKey) => {
    unfollowUser(
      {
        follower,
        following,
      },
      privateKey,
    )
      .then(() => {
        this._profileActionDone();
      })
      .catch((err) => {
        this._profileActionDone(err);
      });
  };

  _followUser = (follower, following, privateKey) => {
    followUser(
      {
        follower,
        following,
      },
      privateKey,
    )
      .then(() => {
        this._profileActionDone();
      })
      .catch((err) => {
        this._profileActionDone(err);
      });
  };

  _muteUser = async (follower, following, privateKey) => {
    ignoreUser(
      {
        follower,
        following,
      },
      privateKey,
    )
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
      let _follows;

      if (isLoggedIn) {
        _isFollowing = await getIsFollowing(username, currentAccount.name);

        _isMuted = _isFollowing ? false : await getIsMuted(username, currentAccount.name);
      }

      await getFollows(username).then((res) => {
        _follows = res;
      });

      this.setState({
        follows: _follows,
        isFollowing: _isFollowing,
        isMuted: _isMuted,
      });
    }
  };

  _loadProfile = async (selectedUser = null) => {
    const user = await getUser(selectedUser);

    this._fetchProfile(selectedUser);

    this.setState(
      {
        user,
        username: selectedUser,
      },
      () => {
        this._getComments(selectedUser);
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
    });
  };

  render() {
    const {
      comments,
      error,
      follows,
      isProfileLoading,
      isFollowing,
      isMuted,
      isReady,
      isReverseHeader,
      user,
      username,
    } = this.state;
    const { isDarkTheme, isLoggedIn } = this.props;

    return (
      <Fragment>
        <ProfileScreen
          about={user && user.about && user.about.profile}
          comments={comments}
          error={error}
          follows={follows}
          handleFollowUnfollowUser={this._handleFollowUnfollowUser}
          handleMuteUnmuteUser={this._handleMuteUnmuteUser}
          handleOnFollowsPress={this._handleFollowsPress}
          isDarkTheme={isDarkTheme}
          isFollowing={isFollowing}
          isLoggedIn={isLoggedIn}
          isMuted={isMuted}
          isProfileLoading={isProfileLoading}
          isReady={isReady}
          isReverseHeader={isReverseHeader}
          user={user}
          username={username}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(ProfileContainer);
