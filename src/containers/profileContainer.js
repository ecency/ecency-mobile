/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, has, unionBy, update } from 'lodash';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Providers
import { useNavigation } from '@react-navigation/native';
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
import { checkFavorite, addFavorite, deleteFavorite, addReport } from '../providers/ecency/ecency';

// Utilitites
import { getRcPower, getVotingPower } from '../utils/manaBar';
import { toastNotification, setRcOffer, showActionModal } from '../redux/actions/uiAction';

// Constants
import { default as ROUTES } from '../constants/routeNames';
import { updateCurrentAccount } from '../redux/actions/accountAction';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);

    // check if is signed in user profile
    const username = props.route.params?.username ?? '';
    const {
      currentAccount: { name: currentAccountUsername },
    } = props;
    const isOwnProfile = !username || currentAccountUsername === username;

    this.state = {
      comments: [],
      follows: {},
      forceLoadPost: false,
      isFavorite: false,
      isFollowing: false,
      isMuted: false,
      isProfileLoading: false,
      isReady: false,
      isOwnProfile,
      user: null,
      quickProfile: {
        reputation: get(props, 'route.params.reputation', ''),
        name: get(props, 'route.params.username', ''),
      },
      reverseHeader: !!username,
      deepLinkFilter: get(props, 'route.params.deepLinkFilter'),
    };
  }

  componentDidMount() {
    const {
      route,
      navigation,
      isConnected,
      isLoggedIn,
      currentAccount: { name: currentAccountUsername },
    } = this.props;
    const username = route.params?.username || '';

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
  }

  _getReplies = async (query) => {
    const { isOwnProfile, comments, user } = this.state;
    const {
      currentAccount: { name: currentAccountUsername },
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
    }

    if (query) {
      delete query.author;
      delete query.permlink;
      repliesAction(query).then((result) => {
        const _comments = unionBy(comments, result, 'permlink');
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
        // means user is now being followed
        if (!isFollowing) {
          const mutes = currentAccount.mutes || [];
          const mutedIndex = mutes.indexOf(username);
          if (mutedIndex >= 0) {
            mutes.splice(mutedIndex, 1);
            currentAccount.mutes = mutes;
            dispatch(updateCurrentAccount(currentAccount));
          }
        }

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: isFollowAction ? 'alert.success_follow' : 'alert.success_unfollow',
            }),
          ),
        );

        this.setState({
          isFollowing: isFollowAction,
        });

        this._profileActionDone({ shouldFetchProfile: false });
      })
      .catch((err) => {
        this._profileActionDone({ error: err });
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
        this.setState({
          isMuted: true,
          isProfileLoading: false,
        });

        const curMutes = currentAccount.mutes || [];
        if (curMutes.indexOf(username) < 0) {
          // check to avoid double entry corner case
          currentAccount.mutes = [username, ...curMutes];
        }
        dispatch(updateCurrentAccount(currentAccount));

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success_mute',
            }),
          ),
        );
      })
      .catch((err) => {
        this._profileActionDone({ error: err });
      });
  };

  _profileActionDone = ({ error = null, shouldFetchProfile = true }) => {
    const { username } = this.state;
    const { intl, dispatch } = this.props;

    this.setState({
      isProfileLoading: false,
    });
    if (error) {
      if (error.jse_shortmsg && error.jse_shortmsg.includes('wait to transact')) {
        // when RC is not enough, offer boosting account
        dispatch(setRcOffer(true));
      } else {
        // when other errors
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
    } else if (shouldFetchProfile) {
      this._fetchProfile(username, true);
    }
  };

  _fetchProfile = async (username = null, isProfileAction = false) => {
    const { intl } = this.props;
    try {
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
          isFavorite = await checkFavorite(username);
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
    } catch (error) {
      console.warn('Failed to fetch complete profile data', error);
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error.message || error.toString(),
      );
    }
  };

  _loadProfile = async (username = null) => {
    let user;
    const { isOwnProfile } = this.state;
    try {
      user = await getUser(username, isOwnProfile);
      this._fetchProfile(username);
    } catch (error) {
      this._profileActionDone({ error });
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
      name: ROUTES.SCREENS.FOLLOWS,
      params: {
        isFollowingPress,
        count,
        username,
      },
      key: `${username}${count}`,
    });
  };

  _handleOnFavoritePress = (isFavorite = false) => {
    const { dispatch, intl } = this.props;
    const { username } = this.state;
    let favoriteAction;

    this.setState({
      isProfileLoading: true,
    });

    if (isFavorite) {
      favoriteAction = deleteFavorite;
    } else {
      favoriteAction = addFavorite;
    }

    favoriteAction(username)
      .then(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: isFavorite ? 'alert.success_unfavorite' : 'alert.success_favorite',
            }),
          ),
        );
        this.setState({ isFavorite: !isFavorite, isProfileLoading: false });
      })
      .catch((error) => {
        console.warn('Failed to perform favorite action');
        Alert.alert(
          intl.formatMessage({
            id: 'alert.fail',
          }),
          error.message || error.toString(),
        );
      });
  };

  _handleReportUser = () => {
    const { dispatch, intl } = this.props;
    const { username } = this.state;

    const _onConfirm = () => {
      addReport('user', username)
        .then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'report.added',
              }),
            ),
          );
        })
        .catch(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'report.added',
              }),
            ),
          );
        });
    };

    dispatch(
      showActionModal({
        title: intl.formatMessage({ id: 'report.confirm_report_title' }),
        body: intl.formatMessage({ id: 'report.confirm_report_body' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            onPress: () => {},
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            onPress: _onConfirm,
          },
        ],
      }),
    );
  };

  _handleDelegateHp = () => {
    const { route, navigation } = this.props;
    const username = route.params?.username ?? '';
    navigation.navigate({
      name: ROUTES.SCREENS.TRANSFER,
      params: {
        transferType: 'delegate',
        fundType: 'HIVE_POWER',
        referredUsername: username,
      },
    });
  };

  _handleOnBackPress = () => {
    const { route } = this.props;

    if (route && route.params && route.params.fetchData) {
      route.params.fetchData();
    }
  };

  _changeForceLoadPostState = (value) => {
    this.setState({ forceLoadPost: value });
  };

  _handleOnPressProfileEdit = () => {
    const { navigation, currentAccount } = this.props;

    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE_EDIT,
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
      reverseHeader,
      deepLinkFilter,
    } = this.state;
    const { currency, isDarkTheme, isLoggedIn, children, isHideImage, route } = this.props;

    const activePage = route.params?.state ?? 0;
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
        handleReportUser: this._handleReportUser,
        handleDelegateHp: this._handleDelegateHp,
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
        reverseHeader,
        deepLinkFilter,
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
  activeBottomTab: state.ui.activeBottomTab,
  currentAccount: state.account.currentAccount,
  isHideImage: state.application.hidePostsThumbnails,
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  return <ProfileContainer {...props} navigation={navigation} />;
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
/* eslint-enable */
