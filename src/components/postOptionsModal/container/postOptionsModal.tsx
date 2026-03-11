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
import { getPostQueryOptions, getAccountFullQueryOptions, useDeleteComment } from '@ecency/sdk';
import { useAuthContext } from '../../../providers/sdk';
import {
  useReblogMutation,
  usePinPostMutation,
  useAccountUpdateMutation,
  useIgnoreUserMutation,
  useUpdateReplyMutation,
} from '../../../providers/sdk/mutations';
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
import { useAddBookmarkMutation } from '../../../providers/queries/bookmarkQueries';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import styles from '../styles/postOptionsModal.styles';
import { delay } from '../../../utils/editor';
import { SheetNames } from '../../../navigation/sheets';
import {
  selectCurrentAccount,
  selectIsLoggedIn,
  selectIsPinCodeOpen,
} from '../../../redux/selectors';
import { useGetReblogsQuery } from '../../../providers/queries/postQueries/repostQueries';
import QUERIES from '../../../providers/queries/queryKeys';

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
  const addBookmarkMutation = useAddBookmarkMutation();

  const bottomSheetModalRef = useRef<ActionSheet | null>(null);
  const alertTimer = useRef<any>(null);
  const shareTimer = useRef<any>(null);
  const actionSheetTimer = useRef<any>(null);
  const reportTimer = useRef<any>(null);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const authContext = useAuthContext();
  const deleteCommentMutation = useDeleteComment(currentAccount?.name, authContext);
  const reblogMutation = useReblogMutation();
  const pinPostMutation = usePinPostMutation();
  const accountUpdateMutation = useAccountUpdateMutation();
  const ignoreUserMutation = useIgnoreUserMutation();
  const updateReplyMutation = useUpdateReplyMutation();
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

    // Pin reply: only for depth-1 comments when current user is the post author
    const _isDirectReply = content?.depth === 1;
    const _canPinReply = _isDirectReply && currentAccount?.name === content.parent_author;
    const _observer = currentAccount?.name || currentAccount?.username;
    const _parentPostData = _canPinReply
      ? queryClient.getQueryData(
          getPostQueryOptions(content.parent_author, content.parent_permlink, _observer).queryKey,
        )
      : null;
    const _isPinnedReply =
      (_parentPostData as any)?.json_metadata?.pinned_reply ===
      `${content.author}/${content.permlink}`;

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
        case 'pin-reply':
          return _canPinReply && !_isPinnedReply;
        case 'unpin-reply':
          return _canPinReply && _isPinnedReply;
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

    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }
    ignoreUserMutation
      .mutateAsync({ following: username })
      .then(() => {
        const curMutes = currentAccount.mutes || [];
        const nextMutes = curMutes.indexOf(username) < 0 ? [username, ...curMutes] : [...curMutes];
        const nextAccount = {
          ...currentAccount,
          mutes: nextMutes,
        };
        dispatch(updateCurrentAccount(nextAccount));
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

  const _report = async (author: string, permlink: string) => {
    const _onConfirm = () => {
      addReport('post', author, currentAccount?.name, permlink)
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
                id: 'report.failed',
              }),
            ),
          );
        });
    };

    const action = await SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: intl.formatMessage({ id: 'report.confirm_report_title' }),
        body: intl.formatMessage({ id: 'report.confirm_report_body' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            returnValue: 'cancel',
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            returnValue: 'confirm',
          },
        ],
      },
    });

    if (action === 'confirm') {
      _onConfirm();
    }
  };

  const _deletePost = async () => {
    const _onConfirm = async () => {
      try {
        await deleteCommentMutation.mutateAsync({
          author: currentAccount?.name,
          permlink: content.permlink,
          parentAuthor: content.parent_author || '',
          parentPermlink: content.parent_permlink || '',
        });
        navigation.goBack();
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.removed',
            }),
          ),
        );
      } catch (err) {
        console.warn('Failed to delete post', err);
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
      }
    };

    const action = await SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: intl.formatMessage({ id: 'alert.remove_alert' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            returnValue: 'cancel',
          },
          {
            text: intl.formatMessage({ id: 'alert.delete' }),
            returnValue: 'confirm',
          },
        ],
      },
    });

    if (action === 'confirm') {
      _onConfirm();
    }
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

    reblogMutation
      .mutateAsync({
        author: content.author,
        permlink: get(content, 'permlink', ''),
        deleteReblog: undo,
      })
      .then(() => {
        // SDK handles activity tracking (ty=130) and blog/entry cache invalidation
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: undo ? 'alert.success_reblog_deleted' : 'alert.success_rebloged',
            }),
          ),
        );

        // Refresh legacy reblogs list cache used by Reblogs screen/modal
        const reblogsKey = [QUERIES.POST.GET_REBLOGS, content.author, get(content, 'permlink', '')];
        queryClient.invalidateQueries({ queryKey: reblogsKey });

        // Also invalidate reblog filter (SDK only invalidates blog filter)
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === 'posts' &&
            query.queryKey[1] === 'account-posts' &&
            query.queryKey[2] === currentAccount.name &&
            query.queryKey[3] === 'reblog',
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
        } else if (error && error.jse_shortmsg?.split(': ')[1]?.includes('wait to transact')) {
          dispatch(setRcOffer(true));
        } else {
          dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
        }
      });
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
    const profileParams = {
      ...(currentAccount.profile || {}),
      pinned: unpinPost ? null : content.permlink,
    };

    try {
      await accountUpdateMutation.mutateAsync({ profile: profileParams });

      const nextAccount = {
        ...currentAccount,
        profile: { ...profileParams },
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
      await pinPostMutation.mutateAsync({
        community: content.community,
        account: content.author,
        permlink: content.permlink,
        pin: !unpinPost,
      });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

      // Invalidate post query to refetch with updated pin status
      const { queryKey: entryQueryKey } = getPostQueryOptions(
        content.author,
        content.permlink,
        currentAccount?.name || '',
      );
      queryClient.invalidateQueries({ queryKey: entryQueryKey });

      // Invalidate community feed queries to update community posts
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' &&
          query.queryKey[1] === 'posts-ranked' &&
          query.queryKey[3] === content.community,
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

  const _updatePinnedReply = async ({ unpin }: { unpin: boolean } = { unpin: false }) => {
    const observer = currentAccount?.name || currentAccount?.username;
    const parentPost = queryClient.getQueryData(
      getPostQueryOptions(content.parent_author, content.parent_permlink, observer).queryKey,
    ) as any;

    if (!parentPost) {
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), 'Parent post not found');
      return;
    }

    const newJsonMetadata = {
      ...parentPost.json_metadata,
      pinned_reply: unpin ? undefined : `${content.author}/${content.permlink}`,
    };

    try {
      await updateReplyMutation.mutateAsync({
        author: content.parent_author,
        permlink: content.parent_permlink,
        parentAuthor: parentPost.parent_author || '',
        parentPermlink: parentPost.parent_permlink || parentPost.category,
        title: parentPost.title || '',
        body: parentPost.body,
        jsonMetadata: newJsonMetadata,
      });

      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

      queryClient.invalidateQueries({
        queryKey: getPostQueryOptions(content.parent_author, content.parent_permlink, observer)
          .queryKey,
      });
    } catch (err) {
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), get(err, 'message') || String(err));
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
          _report(get(content, 'author'), get(content, 'permlink'));
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
      case 'pin-reply':
        _updatePinnedReply();
        break;
      case 'unpin-reply':
        _updatePinnedReply({ unpin: true });
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
