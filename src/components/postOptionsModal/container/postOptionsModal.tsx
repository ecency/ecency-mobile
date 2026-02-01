import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Alert, Share, Text, TouchableHighlight } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import EStyleSheet from 'react-native-extended-stylesheet';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { getPostQueryOptions, getAccountFullQueryOptions } from '@ecency/sdk';
import {
  deleteComment,
  ignoreUser,
  pinCommunityPost,
  profileUpdate,
  reblog,
} from '../../../providers/hive/dhive';
import { addReport } from '../../../providers/ecency/ecency';
import { toastNotification, setRcOffer } from '../../../redux/actions/uiAction';

// Constants
import OPTIONS from '../../../constants/options/post';
import ROUTES from '../../../constants/routeNames';

// Utilities
import { writeToClipboard } from '../../../utils/clipboard';
import { getPostUrl } from '../../../utils/post';

// Component

import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import showLoginAlert from '../../../utils/showLoginAlert';
import { useUserActivityMutation } from '../../../providers/queries/pointQueries';
import { useAddBookmarkMutation } from '../../../providers/queries/bookmarkQueries';
import { PointActivityIds } from '../../../providers/ecency/ecency.types';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import styles from '../styles/postOptionsModal.styles';
import { delay } from '../../../utils/editor';
import { SheetNames } from '../../../navigation/sheets';
import {
  selectCurrentAccount,
  selectIsLoggedIn,
  selectIsPinCodeOpen,
  selectPin,
} from '../../../redux/selectors';
import { useGetReblogsQuery } from '../../../providers/queries/postQueries/repostQueries';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

interface Props {
  pageType?: string;
  isWave?: boolean;
  isVisibleTranslateModal?: boolean;
}

const PostOptionsModal = ({ pageType, isWave, isVisibleTranslateModal }: Props, ref) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const userActivityMutation = useUserActivityMutation();
  const addBookmarkMutation = useAddBookmarkMutation();

  const bottomSheetModalRef = useRef<ActionSheet | null>(null);
  const alertTimer = useRef<any>(null);
  const shareTimer = useRef<any>(null);
  const actionSheetTimer = useRef<any>(null);
  const reportTimer = useRef<any>(null);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinCode = useAppSelector(selectPin);
  const isPinCodeOpen = useAppSelector(selectIsPinCodeOpen);
  const subscribedCommunities = useAppSelector((state) => state.communities.subscribedCommunities);

  const [content, setContent] = useState<any>(null);
  const [options, setOptions] = useState(OPTIONS);

  // Fetch reblogs to check if post is already reblogged
  // Skip fetching on own profile page where we can determine reblog status from author field alone
  const shouldFetchReblogs = !!content && pageType !== 'ownProfile';

  const reblogsQuery = useGetReblogsQuery(
    content?.author || '',
    content?.permlink || '',
    shouldFetchReblogs, // Only fetch when needed
  );

  useImperativeHandle(ref, () => ({
    show: (_content) => {
      if (!_content) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.something_wrong' }),
          'Post content not passed for viewing post options',
        );
        return;
      }

      if (bottomSheetModalRef.current) {
        setContent(_content);
        bottomSheetModalRef.current.show();
      }
    },
  }));

  useEffect(() => {
    if (content && !reblogsQuery.isLoading) {
      _initOptions();
    }

    return () => {
      if (alertTimer.current) {
        clearTimeout(alertTimer.current);
        alertTimer.current = null;
      }

      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
        shareTimer.current = null;
      }

      if (actionSheetTimer.current) {
        clearTimeout(actionSheetTimer.current);
        actionSheetTimer.current = null;
      }
      if (reportTimer.current) {
        clearTimeout(reportTimer.current);
        reportTimer.current = null;
      }
    };
  }, [content, reblogsQuery.data, reblogsQuery.isLoading]);

  const _initOptions = () => {
    // check if post is owned by current user or not, if so pinned or not
    const _canUpdateBlogPin =
      !!pageType && !!content && !!currentAccount && currentAccount.name === content.author;
    const _isPinnedInProfile = !!content && content.stats?.is_pinned_blog;

    // check community pin update eligibility
    const _isCommunityPost = !!content && !!content.community;

    const _canUpdateCommunityPin =
      subscribedCommunities.data && !!content && content.community
        ? subscribedCommunities.data.reduce((role, subscription) => {
            if (content.community === subscription[0]) {
              return ['owner', 'admin', 'mod'].includes(subscription[2]);
            }
            return role;
          }, false)
        : false;
    const _isPinnedInCommunity = !!content && content.stats?.is_pinned;

    // check if post can be deleted
    const _canDeletePost =
      currentAccount.name === content.author &&
      !content.is_paidout &&
      !content.children &&
      !content.active_votes?.length;

    // check if post is reblogged by current user
    // Priority 1: On own profile's blog page, if author != current user, it must be reblogged
    const _isOwnProfileReblog =
      pageType === 'ownProfile' && currentAccount && content.author !== currentAccount.name;

    // Priority 2: Check if reblogged_by field includes current user (available from blog feed)
    const _isRebloggedFromField =
      content.reblogged_by &&
      Array.isArray(content.reblogged_by) &&
      currentAccount &&
      content.reblogged_by.includes(currentAccount.name);

    // Priority 3: Fall back to reblogs query data
    const _isRebloggedFromQuery =
      reblogsQuery.data && currentAccount && reblogsQuery.data.includes(currentAccount.name);

    const _isReblogged = _isOwnProfileReblog || _isRebloggedFromField || _isRebloggedFromQuery;

    // cook options list based on collected flags
    const _options = OPTIONS.filter((option) => {
      switch (option) {
        case 'reblog':
          return !_isReblogged; // Show "reblog" only if not reblogged
        case 'undo-reblog':
          return _isReblogged; // Show "undo-reblog" only if already reblogged
        case 'pin-blog':
          return _canUpdateBlogPin && !_isPinnedInProfile;
        case 'unpin-blog':
          return _canUpdateBlogPin && _isPinnedInProfile;
        case 'pin-community':
          return _canUpdateCommunityPin && !_isPinnedInCommunity;
        case 'unpin-community':
          return _canUpdateCommunityPin && _isPinnedInCommunity;
        case 'translate':
          return isVisibleTranslateModal;
        case 'delete-post':
          return _canDeletePost;
        case 'cross-post':
          return _isCommunityPost;
        default:
          return true;
      }
    });

    setOptions(_options);
  };

  const _muteUser = () => {
    const username = content.author;
    const follower = currentAccount.name;
    const following = username;

    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }
    ignoreUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
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
        _profileActionDone({ error: err });
      });
  };

  const _profileActionDone = ({ error = null }: { error: any }) => {
    if (error) {
      if (error.jse_shortmsg && error.jse_shortmsg.includes('wait to transact')) {
        // when RC is not enough, offer boosting account
        dispatch(setRcOffer(true));
      } else {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.fail',
          }),
          error.message || error.toString(),
        );
      }
    }
  };

  const _share = () => {
    const _url = isWave ? `/@${content.author}/${content.permlink}` : content.url;
    const postUrl = getPostUrl(_url);

    Share.share({
      message: `${get(content, 'title')} ${postUrl}`,
    });
  };

  const _report = (url) => {
    const _onConfirm = () => {
      addReport('content', url)
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

  const _deletePost = () => {
    const _onConfirm = async () => {
      await deleteComment(currentAccount, pinCode, content.permlink);
      navigation.goBack();
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.removed',
          }),
        ),
      );
    };

    SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: intl.formatMessage({ id: 'alert.remove_alert' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            onPress: () => {
              console.log('cancel pressed');
            },
          },
          {
            text: intl.formatMessage({ id: 'alert.delete' }),
            onPress: _onConfirm,
          },
        ],
      },
    });
  };

  const _addToBookmarks = () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }
    // Toast notifications are handled by the mutation hook
    addBookmarkMutation.mutate({
      author: get(content, 'author'),
      permlink: get(content, 'permlink'),
    });
  };

  const _reblog = (undo = false) => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }
    if (isLoggedIn) {
      reblog(currentAccount, pinCode, content.author, get(content, 'permlink', ''), undo)
        .then((response) => {
          // track user activity points ty=130 (only for reblog, not undo)
          if (!undo) {
            userActivityMutation.mutate({
              pointsTy: PointActivityIds.REBLOG,
              transactionId: response.id,
            });
          }

          dispatch(
            toastNotification(
              intl.formatMessage({
                id: undo ? 'alert.success_reblog_deleted' : 'alert.success_rebloged',
              }),
            ),
          );

          // Refetch reblogs to update the list
          reblogsQuery.refetch();

          // Invalidate the specific post query to update reblog stats
          queryClient.invalidateQueries({
            queryKey: ['posts', 'entry', `/@${content.author}/${get(content, 'permlink', '')}`],
          });

          // Invalidate account posts query to show added/removed reblog in blog and reblog filters
          // SDK query key structure: ['posts', 'account-posts', username, filter, ...]
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === 'posts' &&
              query.queryKey[1] === 'account-posts' &&
              query.queryKey[2] === currentAccount.name &&
              ['blog', 'reblog'].includes(String(query.queryKey[3])),
          });
        })
        .catch((error) => {
          if (String(get(error, 'jse_shortmsg', '')).indexOf('has already reblogged') > -1) {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.already_rebloged',
                }),
              ),
            );
          } else {
            if (error && error.jse_shortmsg?.split(': ')[1]?.includes('wait to transact')) {
              // when RC is not enough, offer boosting account
              dispatch(setRcOffer(true));
            } else {
              // when other errors
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
            }
          }
        });
    }
  };

  const _crossPost = () => {
    SheetManager.show(SheetNames.CROSS_POST, {
      payload: {
        postContent: content,
      },
    });
  };

  const _updatePinnedPost = async (
    { unpinPost }: { unpinPost: boolean } = { unpinPost: false },
  ) => {
    const params = {
      ...(currentAccount.about?.profile || {}),
      pinned: unpinPost ? null : content.permlink,
    };

    try {
      await profileUpdate(params, pinCode, currentAccount);

      const nextAccount = {
        ...currentAccount,
        about: {
          ...(currentAccount.about || {}),
          profile: { ...params },
        },
      };

      dispatch(updateCurrentAccount(nextAccount));
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

      // Invalidate account query to update profile data with new pinned post
      const { queryKey: accountQueryKey } = getAccountFullQueryOptions(currentAccount.name);
      queryClient.invalidateQueries({ queryKey: accountQueryKey });

      // Invalidate post query to refetch with updated pin status
      const { queryKey: entryQueryKey } = getPostQueryOptions(
        content.author,
        content.permlink,
        currentAccount?.name || '',
      );
      queryClient.invalidateQueries({ queryKey: entryQueryKey });

      // Invalidate account feed queries to update profile feeds (blog, posts, reblog)
      // Use SDK query key structure: ['posts', 'account-posts', username, filter, ...]
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' &&
          query.queryKey[1] === 'account-posts' &&
          query.queryKey[2] === currentAccount.name &&
          ['blog', 'posts', 'reblog'].includes(String(query.queryKey[3])),
      });
    } catch (err) {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        get(err, 'message') || String(err) || 'Unknown error',
      );
    }
  };

  const _updatePinnedPostCommunity = async (
    { unpinPost }: { unpinPost: boolean } = { unpinPost: false },
  ) => {
    try {
      await pinCommunityPost(
        currentAccount,
        pinCode,
        content.community,
        content.author,
        content.permlink,
        unpinPost,
      );
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

      // Invalidate post query to refetch with updated pin status
      const { queryKey: entryQueryKey } = getPostQueryOptions(
        content.author,
        content.permlink,
        currentAccount?.name || '',
      );
      queryClient.invalidateQueries({ queryKey: entryQueryKey });

      // Invalidate community feed queries to update community posts
      // Use SDK query key structure: ['posts', 'posts-ranked', sort, tag, ...]
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' &&
          query.queryKey[1] === 'posts-ranked' &&
          query.queryKey[3] === content.community, // tag/community is at index 3
      });
    } catch (err) {
      console.warn('Failed to update pin status of community post', err);
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        get(err, 'message') || String(err) || 'Unknown error',
      );
    }
  };

  const _redirectToReply = () => {
    if (isLoggedIn) {
      navigation.navigate({
        name: ROUTES.SCREENS.EDITOR,
        key: `editor_post_${content.permlink}`,
        params: {
          isReply: true,
          post: content,
        },
      });
    }
  };

  const _redirectToPromote = (name, from, redeemType) => {
    const params = {
      from,
      permlink: `${get(content, 'author')}/${get(content, 'permlink')}`,
      redeemType,
    };

    if (isPinCodeOpen) {
      navigation.navigate({
        name: ROUTES.SCREENS.PINCODE,
        params: {
          navigateTo: name,
          navigateParams: params,
        },
      });
    } else if (isLoggedIn) {
      navigation.navigate({
        name,
        params,
      });
    }
  };

  // Component Functions
  const _handleOnDropdownSelect = async (index) => {
    const username = content.author;
    const isOwnProfile = !username || currentAccount?.name === username;

    switch (options[index]) {
      case 'copy':
        const _url = isWave ? `/@${content.author}/${content.permlink}` : content.url;
        await writeToClipboard(getPostUrl(_url));
        alertTimer.current = setTimeout(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.copied',
              }),
            ),
          );
          alertTimer.current = null;
        }, 300);
        break;

      case 'reblog':
        _reblog(false);
        break;

      case 'undo-reblog':
        _reblog(true);
        break;

      case 'reply':
        _redirectToReply();
        break;

      case 'share':
        shareTimer.current = setTimeout(() => {
          _share();
          shareTimer.current = null;
        }, 500);
        break;

      case 'bookmarks':
        _addToBookmarks();
        break;

      case 'promote':
        _redirectToPromote(ROUTES.SCREENS.REDEEM, 1, 'promote');
        break;

      case 'boost':
        _redirectToPromote(ROUTES.SCREENS.REDEEM, 2, 'boost');
        break;

      case 'report':
        reportTimer.current = setTimeout(() => {
          _report(get(content, 'url'));
        }, 300);

        break;
      case 'pin-blog':
        _updatePinnedPost();
        break;
      case 'unpin-blog':
        _updatePinnedPost({ unpinPost: true });
        break;
      case 'pin-community':
        _updatePinnedPostCommunity();
        break;
      case 'unpin-community':
        _updatePinnedPostCommunity({ unpinPost: true });
        break;
      case 'edit-history':
        navigation.navigate({
          name: ROUTES.SCREENS.EDIT_HISTORY,
          params: {
            author: content?.author || '',
            permlink: content?.permlink || '',
          },
        });
        break;
      case 'mute':
        !isOwnProfile && _muteUser();
        break;
      case 'translate':
        await delay(700);
        SheetManager.show(SheetNames.POST_TRANSLATION, {
          payload: {
            content,
          },
        });
        break;
      case 'delete-post':
        await delay(700);
        _deletePost();
        break;
      case 'cross-post':
        await delay(700);
        _crossPost();
        break;
      default:
        break;
    }
  };

  const _renderItem = ({ item, index }: { item: string; index: number }) => {
    const _onPress = () => {
      bottomSheetModalRef.current?.hide();
      _handleOnDropdownSelect(index);
    };

    return (
      <TouchableHighlight
        underlayColor={EStyleSheet.value('$primaryLightBackground')}
        onPress={_onPress}
      >
        <Text
          style={[
            styles.dropdownItem,
            item === 'delete-post' && { color: EStyleSheet.value('$primaryRed') },
          ]}
        >
          {intl.formatMessage({ id: `post_dropdown.${item}` }).toLocaleUpperCase()}
        </Text>
      </TouchableHighlight>
    );
  };

  return (
    <ActionSheet
      ref={bottomSheetModalRef}
      gestureEnabled={true}
      hideUnderlay={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
    >
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={options}
        renderItem={_renderItem}
        keyExtractor={(item) => item}
      />
    </ActionSheet>
  );
};

export default forwardRef(PostOptionsModal);
