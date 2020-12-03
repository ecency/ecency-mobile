/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { get, has, unionBy } from 'lodash';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';
import Matomo from 'react-native-matomo-sdk';

// Providers
import {
  followUser,
  unfollowUser,
  ignoreUser,
  getFollows,
  getRepliesByLastUpdate,
  getUser,
  getRelationship,
  getAccountPosts,
} from '../providers/hive/dhive';

// Ecency providers
import { getIsFavorite, addFavorite, removeFavorite } from '../providers/esteem/esteem';

// Utilitites
import { getRcPower, getVotingPower } from '../utils/manaBar';
import { toastNotification, setRcOffer } from '../redux/actions/uiAction';

// Constants
import { default as ROUTES } from '../constants/routeNames';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: [],
      follows: {},
      forceLoadPost: false,
      isFavorite: false,
      isFollowing: false,
      isMuted: false,
      isProfileLoading: false,
      isReady: false,
      isOwnProfile: !has(props, 'navigation.state.params.username'),
      user: null,
      quickProfile: {
        reputation: get(props, 'navigation.state.params.reputation', ''),
        name: get(props, 'navigation.state.params.username', ''),
      },
    };
  }

  componentDidMount() {
    const {
      navigation,
      isConnected,
      isLoggedIn,
      isAnalytics,
      currentAccount: { name: currentAccountUsername },
    } = this.props;
    const username = get(navigation, 'state.params.username');
    const { isOwnProfile } = this.state;
    let targetUsername = currentAccountUsername;

    if (!isConnected) {
      return;
    }

    if (!isLoggedIn && !username) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (!isOwnProfile) {
      targetUsername = username;
    }

    this._loadProfile(targetUsername);
    if (isAnalytics) {
      Matomo.trackView([`/@${targetUsername}`]).catch((error) =>
        console.warn('Failed to track screen', error),
      );
    }
  }

  _getReplies = async (query) => {
    const { isOwnProfile, comments, user } = this.state;
    const {
      currentAccount: { name: currentAccountUsername },
      isAnalytics,
    } = this.props;
    this.setState({ isProfileLoading: true });
    let repliesAction;
    if (!isOwnProfile) {
      repliesAction = getAccountPosts;
      if (query) {
        query.account = query.author;
        if (comments.length > 0) {
          query.start_author = query.author;
          query.start_permlink = query.permlink;
        }
        query.limit = 5;
        query.observer = '';
        query.sort = 'comments';
      }

      if (isAnalytics && user) {
        Matomo.trackView([`/@${user.name}/comments`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      }
    } else {
      repliesAction = getAccountPosts;
      if (query) {
        query.account = query.author;
        if (comments.length > 0) {
          query.start_author = query.author;
          query.start_permlink = query.permlink;
        }
        query.limit = 5;
        query.observer = '';
        query.sort = 'replies';
      }

      if (isAnalytics) {
        Matomo.trackView([`/@${currentAccountUsername}/replies`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      }
    }
    if (query) {
      delete query.author;
      delete query.permlink;
      console.log(query);
      repliesAction(query).then((result) => {
        let _comments = unionBy(comments, result, 'permlink');
        this.setState({
          comments: _comments,
          isProfileLoading: false,
        });
      });
    }
  };

  _handleFollowUnfollowUser = async (isFollowAction) => {
    const { isFollowing, username } = this.state;
    const { currentAccount, pinCode, dispatch, intl } = this.props;
    const follower = get(currentAccount, 'name', '');
    const following = username;

    let followAction;

    this.setState({
      isProfileLoading: true,
    });

    if (isFollowAction && !isFollowing) {
      followAction = followUser;
    } else {
      followAction = unfollowUser;
    }

    followAction(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: isFollowing ? 'alert.success_unfollow' : 'alert.success_follow',
            }),
          ),
        );
        this._profileActionDone();
      })
      .catch((err) => {
        this._profileActionDone(err);
      });
  };

  _handleMuteUnmuteUser = async (isMuteAction) => {
    if (isMuteAction) {
      this._muteUser();
    } else {
      this._handleFollowUnfollowUser();
    }
  };

  _muteUser = () => {
    const { username } = this.state;
    const { currentAccount, pinCode, dispatch, intl } = this.props;
    const follower = currentAccount.name;
    const following = username;

    this.setState({
      isProfileLoading: true,
    });

    ignoreUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success_mute',
            }),
          ),
        );
        this._profileActionDone();
      })
      .catch((err) => {
        this._profileActionDone(err);
      });
  };

  _profileActionDone = (error = null) => {
    const { username } = this.state;
    const { intl, dispatch } = this.props;

    this.setState({
      isProfileLoading: false,
    });
    if (error) {
      if (error.jse_shortmsg && error.jse_shortmsg.includes('wait to transact')) {
        //when RC is not enough, offer boosting account
        dispatch(setRcOffer(true));
      } else {
        //when other errors
        this.setState(
          {
            error,
          },
          () =>
            Alert.alert(
              intl.formatMessage({
                id: 'alert.fail',
              }),
              error.message || error.toString(),
            ),
        );
      }
    } else {
      this._fetchProfile(username, true);
    }
  };

  _fetchProfile = async (username = null, isProfileAction = false) => {
    const { username: _username, isFollowing, isMuted, isOwnProfile } = this.state;

    if (username) {
      const { currentAccount } = this.props;
      let _isFollowing;
      let _isMuted;
      let isFavorite;
      let follows;

      if (!isOwnProfile) {
        const res = await getRelationship(currentAccount.name, username);
        _isFollowing = res && res.follows;

        _isMuted = res && res.ignores;

        getIsFavorite(username, currentAccount.name).then((isFav) => {
          isFavorite = isFav;
        });
      }

      try {
        follows = await getFollows(username);
      } catch (err) {
        follows = null;
      }

      if (isProfileAction && isFollowing === _isFollowing && isMuted === _isMuted) {
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

  _loadProfile = async (username = null) => {
    let user;
    const { isOwnProfile } = this.state;
    try {
      user = await getUser(username, isOwnProfile);
      this._fetchProfile(username);
    } catch (error) {
      this._profileActionDone(error);
    }

    this.setState((prevState) => ({
      quickProfile: {
        ...prevState.quickProfile,
        display_name: get(user, 'display_name'),
        reputation: get(user, 'reputation'),
      },
      user,
      username,
    }));

    this._getReplies({ author: username, permlink: undefined });
  };

  _handleFollowsPress = async (isFollowingPress) => {
    const { navigation } = this.props;
    const { username, follows } = this.state;
    const count = get(follows, !isFollowingPress ? 'follower_count' : 'following_count');

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

  _handleOnFavoritePress = (isFavorite = false) => {
    const { currentAccount, dispatch, intl } = this.props;
    const { username } = this.state;
    let favoriteAction;

    this.setState({
      isProfileLoading: true,
    });

    if (isFavorite) {
      favoriteAction = removeFavorite;
    } else {
      favoriteAction = addFavorite;
    }

    favoriteAction(currentAccount.name, username).then(() => {
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: isFavorite ? 'alert.success_unfavorite' : 'alert.success_favorite',
          }),
        ),
      );
      this.setState({ isFavorite: !isFavorite, isProfileLoading: false });
    });
  };

  _handleOnBackPress = () => {
    const { navigation } = this.props;
    const navigationParams = get(navigation.state, 'params');

    if (get(navigationParams, 'fetchData')) {
      navigationParams.fetchData();
    }
  };

  _changeForceLoadPostState = (value) => {
    this.setState({ forceLoadPost: value });
  };

  _handleOnPressProfileEdit = () => {
    const { navigation, currentAccount } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE_EDIT,
      params: {
        fetchUser: () => this.setState({ user: currentAccount }),
      },
    });
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!nextProps.isConnected) {
      return;
    }

    const { isLoggedIn, navigation } = this.props;
    const { isOwnProfile } = this.state;

    if (isLoggedIn && !nextProps.isLoggedIn) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
      return;
    }

    if (isOwnProfile) {
      const { user } = this.state;
      const { activeBottomTab, currentAccount } = this.props;

      const currentUsername =
        get(currentAccount, 'name') !== get(nextProps, 'currentAccount.name') &&
        get(nextProps, 'currentAccount.name');
      const isActiveTabChanged =
        activeBottomTab !== get(nextProps, 'activeBottomTab') &&
        get(nextProps, 'activeBottomTab') === ROUTES.TABBAR.PROFILE;

      if ((isActiveTabChanged && user) || currentUsername) {
        this._loadProfile(get(nextProps, 'currentAccount.name'));
      }
    }
  }

  render() {
    const {
      avatar,
      comments,
      error,
      follows,
      forceLoadPost,
      isFavorite,
      isFollowing,
      isMuted,
      isOwnProfile,
      isProfileLoading,
      isReady,
      quickProfile,
      user,
      username,
    } = this.state;
    const { currency, isDarkTheme, isLoggedIn, navigation, children, isHideImage } = this.props;
    const activePage = get(navigation.state.params, 'state', 0);
    const { currencyRate, currencySymbol } = currency;

    let votingPower;
    let resourceCredits;

    if (user) {
      votingPower = getVotingPower(user).toFixed(1);
      resourceCredits = getRcPower(user).toFixed(1);
    }

    return (
      children &&
      children({
        about: get(user, 'about.profile'),
        activePage,
        avatar,
        setEstimatedWalletValue: this._setEstimatedWalletValue,
        changeForceLoadPostState: this._changeForceLoadPostState,
        comments,
        currency,
        currencyRate,
        currencySymbol,
        votingPower,
        resourceCredits,
        error,
        follows,
        forceLoadPost,
        getReplies: this._getReplies,
        handleFollowUnfollowUser: this._handleFollowUnfollowUser,
        handleMuteUnmuteUser: this._handleMuteUnmuteUser,
        handleOnBackPress: this._handleOnBackPress,
        handleOnFavoritePress: this._handleOnFavoritePress,
        handleOnFollowsPress: this._handleFollowsPress,
        handleOnPressProfileEdit: this._handleOnPressProfileEdit,
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
        selectedUser: user,
        username,
      })
    );
  }
}
const mapStateToProps = (state) => ({
  currency: state.application.currency,
  isConnected: state.application.isConnected,
  isDarkTheme: state.application.isDarkTheme,
  isLoggedIn: state.application.isLoggedIn,
  pinCode: state.application.pin,
  isAnalytics: state.application.isAnalytics,
  activeBottomTab: state.ui.activeBottomTab,
  currentAccount: state.account.currentAccount,
  isHideImage: state.ui.hidePostsThumbnails,
});

export default connect(mapStateToProps)(injectIntl(withNavigation(ProfileContainer)));
/* eslint-enable */
