import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Alert, Platform, Share, Text, TouchableHighlight } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import EStyleSheet from 'react-native-extended-stylesheet';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPostQueryOptions,
  getAccountFullQueryOptions,
  getCommunityQueryOptions,
  parseProfileMetadata,
  useDeleteComment,
} from '@ecency/sdk';
import { postBodySummary } from '@ecency/render-helper';
import { captureException } from '../../../utils/sentryUtils';
import { isAlreadyReblogged, isInsufficientRcError } from '../../../utils/rcError';
import { useAuthContext } from '../../../providers/sdk';
import {
  useReblogMutation,
  usePinPostMutation,
  useMutePostMutation,
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
import { resolveProfileMergeBase } from '../../../utils/profileMergeBase';
import { getPostUrl, stripCategoryFromPostPath } from '../../../utils/post';
import { isCommunityModerator } from '../../../utils/communityModeration';

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
  /**
   * Optional delete handler. When provided, the "delete-post" action
   * delegates entirely to this callback instead of running the local
   * `deleteCommentMutation` + `navigation.goBack()` pair. The waves feed uses
   * it to route through `wavesQuery.deleteWave`, which is the only path that
   * updates the waves infinite-query cache so the deleted wave actually
   * disappears from the feed.
   */
  onDelete?: (content: any) => void | Promise<void>;
  /**
   * Set only by consumers whose content *is* the screen, which today means postScreen alone, so
   * that deleting it pops back. Everything else owns a surrounding list and must not pop.
   *
   * This is an opt-in rather than a default because the two failure modes are not symmetric.
   * Forgetting it leaves the user on the screen, which is mildly wrong and obvious in testing.
   * Popping by default navigated the user away from a list they were reading, which is badly
   * wrong and easy to miss: it shipped three times (waves, the comment surfaces in #3405/#3406,
   * the feed list in #3407). Content shape cannot decide this, because postScreen renders
   * comments and waves as primary content, so a comment in a list and a comment as the screen
   * are the same object (#3408, reverted).
   */
  popScreenOnDelete?: boolean;
  /**
   * Optional thread handler. When provided, the "open-thread" action is offered
   * and delegates here. Only comment surfaces can open a thread, so the option
   * is hidden wherever this is absent.
   */
  onOpenThread?: (content: any) => void;
}

const PostOptionsModal = (
  { pageType, isWave, isVisibleTranslateModal, onDelete, popScreenOnDelete, onOpenThread }: Props,
  ref: any,
) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const addBookmarkMutation = useAddBookmarkMutation();

  const bottomSheetModalRef = useRef<any>(null);
  const alertTimer = useRef<any>(null);
  const shareTimer = useRef<any>(null);
  const actionSheetTimer = useRef<any>(null);
  const reportTimer = useRef<any>(null);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const authContext = useAuthContext();
  const deleteCommentMutation = useDeleteComment(currentAccount?.name, authContext, 'async');
  const reblogMutation = useReblogMutation();
  const pinPostMutation = usePinPostMutation();
  const mutePostMutation = useMutePostMutation();
  const accountUpdateMutation = useAccountUpdateMutation();
  const ignoreUserMutation = useIgnoreUserMutation();
  const updateReplyMutation = useUpdateReplyMutation();
  const isPinCodeOpen = useAppSelector(selectIsPinCodeOpen);

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

  // Authoritative source for the moderator gate on community pin/unpin. The
  // Redux `subscribedCommunities` tuple this replaced only covered communities
  // the moderator had subscribed to, and its role slot can be blanked by the
  // Discover-tab subscribe path, which silently removed the action.
  const communityQuery = useQuery(
    getCommunityQueryOptions(content?.community, currentAccount?.name, !!content?.community),
  );

  useImperativeHandle(ref, () => ({
    show: (_content: any) => {
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
    // `currentAccount?.profile?.pinned` is included so the blog pin/unpin
    // option recomputes after pinning from the detail modal (where the stored
    // `content` and its stats don't change).
    //
    // `communityQuery.data` is included because `_initOptions` computes the
    // menu imperatively when the sheet opens. On a cold cache the community
    // resolves after that first pass, and without this the moderator would see
    // a menu with no pin action until the sheet was reopened.
  }, [
    content,
    reblogsQuery.data,
    reblogsQuery.isLoading,
    currentAccount?.profile?.pinned,
    communityQuery.data,
  ]);

  // Timers are cleared on unmount only. These fire after the sheet has already
  // hidden (copy/share/report defer 300-700ms before their toast or sheet), so
  // tearing them down whenever an option input changes would cancel an action
  // the user had already selected. A late-resolving query was enough to do it.
  useEffect(
    () => () => {
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
    },
    [],
  );

  const _initOptions = () => {
    // check if post is owned by current user or not, if so pinned or not
    // Blog-pin eligibility is decided solely by post ownership; `pageType` was
    // an unintended extra gate that hid the option on the post detail screen
    // (PostOptionsModal is mounted there without a pageType). Restrict to
    // top-level, non-wave posts so pin/unpin-blog never appears on comments or
    // waves (also mounted without pageType).
    const _canUpdateBlogPin =
      !isWave &&
      !!content &&
      !!currentAccount &&
      currentAccount.name === content.author &&
      (content.depth === 0 || !content.parent_author);
    // On the post detail screen `stats.is_pinned_blog` may be absent, so fall
    // back to the current user's own profile pin to flip the menu to "unpin".
    // Use `??` so an explicit `false` from canonical stats is trusted and the
    // (possibly stale) profile pin is only consulted when the stat is missing.
    const _isPinnedInProfile =
      !!content &&
      (content.stats?.is_pinned_blog ?? currentAccount?.profile?.pinned === content.permlink);

    // check community pin update eligibility
    const _isCommunityPost = !!content && !!content.community;

    const _isCommunityModerator = isCommunityModerator(
      communityQuery.data?.team,
      currentAccount?.name,
    );

    // Moderating a cross-post is not expressible: `parsePost` swaps author and
    // permlink to the original entry but leaves `community` as the wrapper's,
    // so the {community, author, permlink} tuple would not match anything
    // hivemind knows about. Moderate the original post instead.
    //
    // Both pin and mute build that same tuple, so both are withheld.
    const _canModerateCommunityPost =
      _isCommunityPost && _isCommunityModerator && !content.crosspostMeta;

    const _canUpdateCommunityPin = _canModerateCommunityPost;
    const _isPinnedInCommunity = !!content && content.stats?.is_pinned;

    const _canMuteCommunityPost = _canModerateCommunityPost;

    // Read `stats.gray` directly rather than the parsed `isMuted`, which is also set
    // for downvoted and low-trust posts and would offer "unmute" on posts no
    // moderator ever muted.
    const _isMutedInCommunity = !!content && !!content.stats?.gray;

    // Carried over from the legacy comment menu, so both are scoped to comments
    // rather than widening the post detail sheet. A comment is anything with a
    // parent; copying the text also needs a body to copy, and opening a thread
    // only means something where a handler was given.
    const _isCommentContent = !!content && (content.depth > 0 || !!content.parent_author);
    const _canCopyText = _isCommentContent && !!content?.markdownBody;
    const _canOpenThread = _isCommentContent && !!onOpenThread;

    // check if post can be deleted
    // Hive's on-chain rule is: no children AND no net positive rshares. Using
    // `active_votes.length` was stricter than the chain (a self-vote or a
    // downvote made the option silently disappear), which surfaced as
    // "I can't delete this wave" when a duplicate had any vote at all.
    const _netRshares = Number(content.net_rshares ?? 0);
    // Withheld on cross-posts for the same reason as mute and pin: `parsePost`
    // swaps author and permlink to the original entry, so `content` here is the
    // ORIGINAL, not the wrapper the user is looking at. On a self cross-post the
    // author check passes and deleting would destroy the original post while
    // leaving the wrapper, which is not what "delete" on that card means. Delete
    // the original from its own card or screen instead.
    const _canDeletePost =
      currentAccount.name === content.author &&
      !content.crosspostMeta &&
      !content.is_paidout &&
      !content.children &&
      _netRshares <= 0;

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
        case 'mute-post':
          return _canMuteCommunityPost && !_isMutedInCommunity;
        case 'unmute-post':
          return _canMuteCommunityPost && _isMutedInCommunity;
        case 'copy-text':
          return _canCopyText;
        case 'open-thread':
          return _canOpenThread;
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

    setOptions(_options as any);
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
      if (isInsufficientRcError(error)) {
        // when RC is not enough, offer boosting account
        dispatch(setRcOffer(true));
      } else {
        captureException(error, (scope) => scope.setTag('context', 'post-options-action'));
        Alert.alert(
          intl.formatMessage({
            id: 'alert.fail',
          }),
          error.message || intl.formatMessage({ id: 'alert.unknow_error' }),
        );
      }
    }
  };

  const _share = () => {
    // Strip the legacy `/<category>/` prefix from SDK-supplied URLs so shared
    // links match the canonical `/@author/permlink` form. Waves already use
    // the canonical form directly.
    const _url = isWave
      ? `/@${content.author}/${content.permlink}`
      : stripCategoryFromPostPath(content.url);
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
          // auto-mute the reported user
          _muteUser();
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
      // When an `onDelete` callback is provided (e.g. by wavesScreen) the
      // caller owns the full delete pipeline — SDK mutation, cache update,
      // toast, and any navigation. Calling `navigation.goBack()` here on the
      // waves feed would pop the wrong screen and we'd also skip the
      // waves-infinite-query cache update, leaving the deleted wave visible.
      if (onDelete) {
        try {
          await onDelete(content);
        } catch (err) {
          console.warn('Failed to delete post (delegated)', err);
          const detail =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message?: unknown }).message ?? '')
              : '';
          dispatch(
            toastNotification(
              detail
                ? `${intl.formatMessage({ id: 'alert.fail' })}: ${detail}`
                : intl.formatMessage({ id: 'alert.fail' }),
            ),
          );
        }
        return;
      }

      try {
        await deleteCommentMutation.mutateAsync({
          author: currentAccount?.name,
          permlink: content.permlink,
          parentAuthor: content.parent_author || '',
          parentPermlink: content.parent_permlink || '',
        });
        // Only the caller knows whether the deleted content *is* the screen, so popping is
        // opt-in. Forgetting the opt-in leaves the user where they were; the old default
        // navigated them off a screen they were still reading.
        if (popScreenOnDelete) {
          navigation.goBack();
        }
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
        if (isAlreadyReblogged(error)) {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.already_rebloged',
              }),
            ),
          );
        } else if (isInsufficientRcError(error)) {
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
    try {
      // Merge onto the CURRENT on-chain profile, not a possibly stale/empty
      // Redux copy. Force a fresh fetch first so changing only `pinned` can
      // never overwrite name/avatar/cover/etc with stale or empty values.
      const freshAccount = await queryClient.fetchQuery({
        ...getAccountFullQueryOptions(currentAccount.name),
        staleTime: 0,
      });
      const baseProfile = resolveProfileMergeBase(
        (parseProfileMetadata as any)(freshAccount?.posting_json_metadata),
        currentAccount.profile,
      );

      const profileParams = {
        ...baseProfile,
        pinned: unpinPost ? null : content.permlink,
      };

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

  const _muteCommunityPost = async ({ unmute }: { unmute: boolean } = { unmute: false }) => {
    // hivemind requires a note on both mute and unmute.
    const result = await SheetManager.show(SheetNames.MOD_NOTES, {
      payload: {
        title: intl.formatMessage({
          id: unmute ? 'community.unmute_post_title' : 'community.mute_post_title',
        }),
        description: `@${content.author}/${content.permlink}`,
        placeholder: intl.formatMessage({
          id: unmute ? 'community.unmute_post_reason' : 'community.mute_post_reason',
        }),
        confirmLabel: intl.formatMessage({
          id: unmute ? 'post_dropdown.unmute-post' : 'post_dropdown.mute-post',
        }),
      },
    });

    // Only a confirmation carries a string `notes`. Cancelling yields
    // { cancelled: true }, and a backdrop, swipe or back dismissal yields the
    // payload object, because the library publishes `data || payloadRef.current`
    // on close. Testing truthiness here would broadcast on every dismissal.
    const notes = typeof result?.notes === 'string' ? result.notes.trim() : '';
    if (!notes) {
      return;
    }

    try {
      await mutePostMutation.mutateAsync({
        community: content.community,
        author: content.author,
        permlink: content.permlink,
        notes,
        mute: !unmute,
      });
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

      const { queryKey: entryQueryKey } = getPostQueryOptions(
        content.author,
        content.permlink,
        currentAccount?.name || '',
      );
      queryClient.invalidateQueries({ queryKey: entryQueryKey });

      // Refresh the community feeds so the post is hidden or restored.
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'posts' &&
          query.queryKey[1] === 'posts-ranked' &&
          query.queryKey[3] === content.community,
      });
    } catch (err) {
      console.warn('Failed to update mute status of community post', err);
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

  const _redirectToPromote = (name: any, from: any, redeemType: any) => {
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
  const _handleOnDropdownSelect = async (index: any) => {
    const username = content.author;
    const isOwnProfile = !username || currentAccount?.name === username;

    switch (options[index]) {
      case 'copy': {
        // Block-scoped so `_url` doesn't leak into sibling case clauses.
        // Mirror the canonical-form normalization used in `_share` so copied
        // links go to `/@author/permlink` instead of the legacy
        // `/<category>/@author/permlink` (which the web 302s anyway).
        const _url = isWave
          ? `/@${content.author}/${content.permlink}`
          : stripCategoryFromPostPath(content.url);
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
      }
      case 'copy-text': {
        // The legacy comment menu copied a plain-text summary rather than raw
        // markdown, so links and images do not come through as syntax.
        // writeToClipboard returns false for empty text, and the summary can be
        // empty where the body is only an image or markup, so the success toast
        // has to follow the result rather than the attempt.
        const _body = postBodySummary(content.markdownBody, null as any, Platform.OS as any);
        const _copied = await writeToClipboard(_body);
        if (!_copied) {
          break;
        }
        alertTimer.current = setTimeout(() => {
          dispatch(toastNotification(intl.formatMessage({ id: 'alert.copied' })));
          alertTimer.current = null;
        }, 300);
        break;
      }
      case 'open-thread':
        // Deferred like the other cases that leave this sheet, so the
        // navigation is not swallowed by the sheet's own hide animation.
        await delay(700);
        onOpenThread?.(content);
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
      // Delayed like the other cases that open a sheet, so this one is not
      // swallowed by the options sheet's own hide animation.
      case 'mute-post':
        await delay(700);
        _muteCommunityPost();
        break;
      case 'unmute-post':
        await delay(700);
        _muteCommunityPost({ unmute: true });
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
      {...({ hideUnderlay: true } as any)}
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
