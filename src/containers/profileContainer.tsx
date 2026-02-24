import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, unionBy } from 'lodash';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Providers
import { useNavigation } from '@react-navigation/native';
import { SheetManager } from 'react-native-actions-sheet';
import {
  getFollowCountQueryOptions,
  getAccountFullQueryOptions,
  getRelationshipBetweenAccountsQueryOptions,
  getAccountPostsQueryOptions,
  getAccountRcQueryOptions,
  checkFavoriteQueryOptions,
} from '@ecency/sdk';
import {
  selectCurrentAccount,
  selectIsLoggedIn,
  selectIsDarkTheme,
  selectCurrency,
  selectPin,
  selectIsConnected,
  selectHidePostsThumbnails,
} from '../redux/selectors';
import { getDigitPinCode } from '../providers/hive/dhive';
import {
  useFollowMutation,
  useUnfollowMutation,
  useIgnoreUserMutation,
} from '../providers/sdk/mutations';
import { getQueryClient } from '../providers/queries';
import { startMattermostDirectMessage } from '../providers/chat/mattermost';

// Ecency providers
import { addReport } from '../providers/ecency/ecency';
import {
  useAddFavouriteMutation,
  useDeleteFavouriteMutation,
} from '../providers/queries/bookmarkQueries';

// Utilitites
import { getRcPower, getVotingPower } from '../utils/manaBar';
import { toastNotification, setRcOffer } from '../redux/actions/uiAction';
import { decryptKey } from '../utils/crypto';

// Constants
import { default as ROUTES } from '../constants/routeNames';
import { updateCurrentAccount } from '../redux/actions/accountAction';
import { SheetNames } from '../navigation/sheets';

const MAX_PROFILE_RETRIES = 2;

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
      rcAccount: null,
      user: null,
      quickProfile: {
        reputation: get(props, 'route.params.reputation', ''),
        name: isOwnProfile ? currentAccountUsername : username,
      },
      reverseHeader: true,
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
    const { isOwnProfile, comments, username } = this.state;
    const {
      currentAccount: { name: currentUsername },
    } = this.props;

    this.setState({ isProfileLoading: true });

    if (query) {
      const sort = isOwnProfile ? 'replies' : 'comments';
      const startAuthor = comments.length > 0 ? query.author : '';
      const startPermlink = comments.length > 0 ? query.permlink : '';

      const queryClient = getQueryClient();
      queryClient
        .fetchQuery(
          getAccountPostsQueryOptions(
            username || (comments.length === 0 ? query.author : currentUsername) || '',
            sort,
            startAuthor,
            startPermlink,
            5,
            currentUsername || '',
          ),
        )
        .then((result) => {
          const _comments = unionBy(comments, result, 'permlink');
          this.setState({
            comments: _comments,
            isProfileLoading: false,
          });
        })
        .catch(() => {
          this.setState({ isProfileLoading: false });
        });
    }
  };

  _handleFollowUnfollowUser = async (isFollowAction) => {
    const { isFollowing, username } = this.state;
    const { currentAccount, dispatch, intl, followMutation, unfollowMutation } = this.props;

    this.setState({
      isProfileLoading: true,
    });

    const mutation = isFollowAction && !isFollowing ? followMutation : unfollowMutation;

    mutation
      .mutateAsync({ following: username })
      .then(() => {
        // means user is now being followed
        if (!isFollowing) {
          const mutes = currentAccount.mutes || [];
          const mutedIndex = mutes.indexOf(username);
          if (mutedIndex >= 0) {
            mutes.splice(mutedIndex, 1);
            currentAccount.mutes = mutes;
            dispatch(updateCurrentAccount(currentAccount));
            this.setState({
              isMuted: false,
            });
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

  _handleMessage = async () => {
    const { username } = this.state;
    const { currentAccount, dispatch, intl } = this.props;

    try {
      // Ensure user is logged in and has access to chat
      if (!currentAccount?.name) {
        dispatch(toastNotification(intl.formatMessage({ id: 'login_required' })));
        return;
      }

      // Start DM with the user
      const dmChannel = await startMattermostDirectMessage(username);

      if (!dmChannel.channelId) {
        throw new Error('User has not joined chats');
      }

      // Navigate to the chat thread
      const { navigation } = this.props;
      navigation.navigate(ROUTES.SCREENS.CHAT_THREAD, {
        channelId: dmChannel.channelId,
        channelName: username,
        bootstrapResult: null, // Will be loaded in chat thread
      });
    } catch (error) {
      console.error('Failed to start DM:', error);
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'chats.dm_error', defaultMessage: 'User has not joined chats' }),
        ),
      );
    }
  };

  _muteUser = () => {
    const { username } = this.state;
    const { currentAccount, dispatch, intl, ignoreUserMutation } = this.props;

    this.setState({
      isProfileLoading: true,
    });

    ignoreUserMutation
      .mutateAsync({ following: username })
      .then(() => {
        this.setState({
          isMuted: true,
          isProfileLoading: false,
        });

        const curMutes = currentAccount.mutes || [];
        if (curMutes.indexOf(username) < 0) {
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
      this._fetchProfile(username, true, 0);
    }
  };

  _fetchProfile = async (username = null, isProfileAction = false, retryCount = 0) => {
    const { intl } = this.props;
    try {
      const { username: _username, isFollowing, isMuted, isOwnProfile } = this.state;

      if (username) {
        const { currentAccount, pinCode } = this.props;
        let _isFollowing;
        let _isMuted;

        const queryClient = getQueryClient();

        const accessToken =
          currentAccount?.local?.accessToken && pinCode
            ? decryptKey(currentAccount.local.accessToken, getDigitPinCode(pinCode))
            : undefined;

        const relationshipPromise =
          !isOwnProfile && currentAccount?.name
            ? queryClient.fetchQuery(
                getRelationshipBetweenAccountsQueryOptions(currentAccount.name, username),
              )
            : Promise.resolve(null);

        const favoritePromise =
          !isOwnProfile && currentAccount?.name && accessToken
            ? queryClient
                .fetchQuery(checkFavoriteQueryOptions(currentAccount.name, accessToken, username))
                .catch(() => undefined)
            : Promise.resolve(undefined);

        const followsPromise = queryClient
          .fetchQuery(getFollowCountQueryOptions(username))
          .catch(() => null);

        const [relationship, favorite, followsResult] = await Promise.all([
          relationshipPromise,
          favoritePromise,
          followsPromise,
        ]);

        if (relationship) {
          _isFollowing = relationship.follows;
          _isMuted = relationship.ignores;
        }

        const isFavorite = Boolean(favorite);
        const follows = followsResult;

        if (isProfileAction && isFollowing === _isFollowing && isMuted === _isMuted) {
          if (retryCount < MAX_PROFILE_RETRIES && _username) {
            setTimeout(() => {
              this._fetchProfile(_username, true, retryCount + 1);
            }, 0);
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
      this.setState({ isProfileLoading: false, isReady: true });
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
    let rcAccount = null;
    try {
      const queryClient = getQueryClient();
      const rawAccount = await queryClient.fetchQuery(getAccountFullQueryOptions(username));

      // SDK returns profile directly as .profile field
      user = {
        ...rawAccount,
      };

      try {
        const rcResult = await queryClient.fetchQuery(getAccountRcQueryOptions(username));
        // SDK may return array or single object
        rcAccount = Array.isArray(rcResult) ? rcResult[0] ?? null : rcResult ?? null;
      } catch (error) {
        rcAccount = null;
      }
      this._fetchProfile(username, false, 0);
    } catch (error) {
      this._profileActionDone({ error });
      return;
    }

    this.setState((prevState) => ({
      quickProfile: {
        ...prevState.quickProfile,
        display_name: get(user, 'profile.name'),
        reputation: get(user, 'reputation'),
      },
      rcAccount,
      user,
      username,
      isReady: true,
      isProfileLoading: false,
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
    const { intl } = this.props;
    const { username } = this.state;
    const { addFavouriteMutation, deleteFavouriteMutation } = this.props;

    this.setState({
      isProfileLoading: true,
    });

    const mutation = isFavorite ? deleteFavouriteMutation : addFavouriteMutation;

    mutation
      .mutateAsync({ account: username })
      .then(() => {
        this.setState({ isFavorite: !isFavorite, isProfileLoading: false });
      })
      .catch((error) => {
        console.warn('Failed to perform favorite action');
        this.setState({ isProfileLoading: false });
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

    SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: intl.formatMessage({ id: 'report.confirm_report_title' }),
        body: intl.formatMessage({ id: 'report.confirm_report_body' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            onPress: () => {
              console.log('cancel pressed');
            },
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            onPress: _onConfirm,
          },
        ],
      },
    });
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

    if (isLoggedIn && !nextProps.isLoggedIn) {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
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
      rcAccount,
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
      resourceCredits = getRcPower(rcAccount || user).toFixed(1);
    }

    return (
      children &&
      children({
        about: get(user, 'profile', {}),
        activePage,
        avatar,
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
        handleMessage: this._handleMessage,
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
  currency: selectCurrency(state),
  isConnected: selectIsConnected(state),
  isDarkTheme: selectIsDarkTheme(state),
  isLoggedIn: selectIsLoggedIn(state),
  pinCode: selectPin(state),
  activeBottomTab: state.ui.activeBottomTab,
  currentAccount: selectCurrentAccount(state),
  isHideImage: selectHidePostsThumbnails(state),
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  const addFavouriteMutation = useAddFavouriteMutation();
  const deleteFavouriteMutation = useDeleteFavouriteMutation();
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();
  const ignoreUserMutation = useIgnoreUserMutation();
  return (
    <ProfileContainer
      {...props}
      navigation={navigation}
      addFavouriteMutation={addFavouriteMutation}
      deleteFavouriteMutation={deleteFavouriteMutation}
      followMutation={followMutation}
      unfollowMutation={unfollowMutation}
      ignoreUserMutation={ignoreUserMutation}
    />
  );
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
