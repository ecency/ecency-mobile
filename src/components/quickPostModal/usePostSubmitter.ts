import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { useQueryClient } from '@tanstack/react-query';
import { SheetManager } from 'react-native-actions-sheet';
import { useAppSelector, useStateWithRef } from '../../hooks';
import { postComment, shouldPromptPostingAuthority } from '../../providers/hive/dhive';
import { extractMetadata, generateUniquePermlink, makeJsonMetadata } from '../../utils/editor';
import { updateCommentCache, deleteCommentCacheEntry } from '../../redux/actions/cacheActions';
import { toastNotification } from '../../redux/actions/uiAction';
import { useUserActivityMutation, wavesQueries } from '../../providers/queries';
import { PointActivityIds, PollDraft } from '../../providers/ecency/ecency.types';
import { usePublishWaveMutation } from '../../providers/queries/postQueries/wavesQueries';
import { PostTypes } from '../../constants/postTypes';
import extractHashTags from '../../utils/extractHashTags';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { SheetNames } from '../../navigation/sheets';

export const usePostSubmitter = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const queryClient = useQueryClient();

  const pusblishWaveMutation = usePublishWaveMutation();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinCode = useAppSelector(selectPin);
  const userActivityMutation = useUserActivityMutation();
  const [isSubmitting, setIsSubmitting, getIsSubmittingCurrent] = useStateWithRef(false);
  const [
    _postingAuthorityPromptShown,
    setPostingAuthorityPromptShown,
    getPostingAuthorityPromptShown,
  ] = useStateWithRef(false);

  // handle submit reply
  const _submitReply = async (
    commentBody: string,
    parentPost: any,
    postType: PostTypes = PostTypes.COMMENT,
    pollDraft?: PollDraft,
    manageSubmittingState = true,
  ) => {
    if (!commentBody) {
      return false;
    }
    if (manageSubmittingState && getIsSubmittingCurrent()) {
      return false;
    }

    if (manageSubmittingState) {
      setIsSubmitting(true);
    }

    try {
      if (!currentAccount) {
        return false;
      }

      // Check if we should prompt for posting authority (HiveAuth users without authority)
      if (shouldPromptPostingAuthority(currentAccount)) {
        // Guard against infinite recursion - use ref getter to read latest value
        if (getPostingAuthorityPromptShown()) {
          console.warn('Posting authority prompt already shown, preventing recursion');
          return false;
        }

        setPostingAuthorityPromptShown(true);
        if (manageSubmittingState) {
          setIsSubmitting(false);
        }

        try {
          await new Promise<void>((resolve, reject) => {
            SheetManager.show(SheetNames.POSTING_AUTHORITY_PROMPT, {
              payload: {
                onGranted: () => resolve(),
                onSkipped: () => resolve(),
                onError: (error) => reject(error),
              },
            });
          });

          // Recursive call after prompt is handled
          return await _submitReply(
            commentBody,
            parentPost,
            postType,
            pollDraft,
            manageSubmittingState,
          );
        } catch (error) {
          // Error granting posting authority - don't retry
          console.warn('Failed to grant posting authority:', error);
          return false;
        } finally {
          setPostingAuthorityPromptShown(false);
        }
      }

      const _prefix =
        postType === PostTypes.WAVE ? postType : `re-${parentPost.author.replace(/\./g, '')}`;
      const permlink = generateUniquePermlink(_prefix);

      const author = currentAccount.name;
      const parentAuthor = parentPost.author;
      const parentPermlink = parentPost.permlink;
      const parentTags = parentPost.json_metadata.tags || ['ecency'];
      const category = parentPost.category || '';
      const url = `/${category}/@${parentAuthor}/${parentPermlink}#@${author}/${permlink}`;

      const hashtags = postType === PostTypes.WAVE ? extractHashTags(commentBody) : [];
      const tags = [...parentTags, ...hashtags];

      // adding jsonmeta with image ratios here....
      const meta = await extractMetadata({
        body: commentBody,
        fetchRatios: true,
        postType,
        pollDraft,
      });
      const jsonMetadata = makeJsonMetadata(meta, tags);

      console.log(
        currentAccount,
        pinCode,
        parentAuthor,
        parentPermlink,
        permlink,
        commentBody,
        jsonMetadata,
      );

      // Build cache entry for optimistic update
      const _cacheCommentData = {
        author,
        permlink,
        url,
        parent_author: parentAuthor,
        parent_permlink: parentPermlink,
        markdownBody: commentBody,
        json_metadata: jsonMetadata,
      };

      // Optimistic: dispatch cache BEFORE blockchain call
      // useDiscussionQuery's useEffect depends on cachedComments and will
      // re-run injectPostCache to show the comment immediately via Redux
      dispatch(
        updateCommentCache(`${author}/${permlink}`, _cacheCommentData, {
          parentTags: parentTags || ['ecency'],
        }),
      );

      try {
        const response = await postComment(
          currentAccount,
          pinCode,
          parentAuthor,
          parentPermlink,
          permlink,
          commentBody,
          jsonMetadata,
        );

        userActivityMutation.mutate({
          pointsTy: PointActivityIds.COMMENT,
          transactionId: response.id,
        });

        // Invalidate discussion queries to refetch with real blockchain data
        if (postType !== PostTypes.WAVE) {
          queryClient.invalidateQueries({ queryKey: ['posts', 'discussions'] });
        }

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success',
            }),
          ),
        );

        return _cacheCommentData;
      } catch (error) {
        console.log(error);

        // Rollback: remove optimistic cache entry and invalidate to clean up
        dispatch(deleteCommentCacheEntry(`${author}/${permlink}`));
        if (postType !== PostTypes.WAVE) {
          queryClient.invalidateQueries({ queryKey: ['posts', 'discussions'] });
        }

        Alert.alert(
          intl.formatMessage({
            id: 'alert.something_wrong',
          }),
          error?.message || JSON.stringify(error),
        );

        return false;
      }
    } catch (error: any) {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.something_wrong',
        }),
        error?.message || JSON.stringify(error),
      );
      return false;
    } finally {
      if (manageSubmittingState) {
        setIsSubmitting(false);
      }
    }
  };

  // feteced lates wafves container and  wave to that container
  const _submitWave = async (body: string, pollDraft: PollDraft) => {
    if (getIsSubmittingCurrent()) {
      return false;
    }

    try {
      setIsSubmitting(true);

      const _wavesHost = 'ecency.waves'; // TODO: make waves host selection dynamic
      const latestWavesPost = await wavesQueries.fetchLatestWavesContainer(_wavesHost);

      const _cacheCommentData = await _submitReply(
        body,
        latestWavesPost,
        PostTypes.WAVE,
        pollDraft,
        false,
      );

      if (_cacheCommentData) {
        pusblishWaveMutation.mutate(_cacheCommentData);
      }

      return _cacheCommentData;
    } catch (err) {
      Alert.alert('Fail', err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitReply: _submitReply,
    submitWave: _submitWave,
    isSubmitting,
  };
};
