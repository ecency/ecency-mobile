import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { useQueryClient } from '@tanstack/react-query';
import { getDiscussionsQueryOptions } from '@ecency/sdk';
import { useAppSelector, useStateWithRef } from '../../hooks';
import { postComment } from '../../providers/hive/dhive';
import { extractMetadata, generateUniquePermlink, makeJsonMetadata } from '../../utils/editor';
import { updateCommentCache } from '../../redux/actions/cacheActions';
import { toastNotification } from '../../redux/actions/uiAction';
import { useUserActivityMutation, wavesQueries } from '../../providers/queries';
import { PointActivityIds, PollDraft } from '../../providers/ecency/ecency.types';
import { usePublishWaveMutation } from '../../providers/queries/postQueries/wavesQueries';
import { PostTypes } from '../../constants/postTypes';
import extractHashTags from '../../utils/extractHashTags';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';

export const usePostSubmitter = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const queryClient = useQueryClient();

  const pusblishWaveMutation = usePublishWaveMutation();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinCode = useAppSelector(selectPin);
  const userActivityMutation = useUserActivityMutation();
  const [isSubmitting, setIsSubmitting, getIsSubmittingCurrent] = useStateWithRef(false);

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

    if (currentAccount) {
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
        if (manageSubmittingState) {
          setIsSubmitting(false);
        }

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success',
            }),
          ),
        );

        // add comment cache entry
        const _cacheCommentData = {
          author,
          permlink,
          url,
          parent_author: parentAuthor,
          parent_permlink: parentPermlink,
          markdownBody: commentBody,
          json_metadata: jsonMetadata,
        };

        dispatch(
          updateCommentCache(`${author}/${permlink}`, _cacheCommentData, {
            parentTags: parentTags || ['ecency'],
          }),
        );

        // Invalidate discussion query cache to show new comment immediately
        // For comments, invalidate parent post's discussion
        // For waves, parentPost is the waves container
        if (postType !== PostTypes.WAVE) {
          queryClient.invalidateQueries({
            queryKey: getDiscussionsQueryOptions(
              { author: parentAuthor, permlink: parentPermlink } as any,
              'created' as any,
            ).queryKey,
          });
        }

        return _cacheCommentData;
      } catch (error) {
        console.log(error);
        Alert.alert(
          intl.formatMessage({
            id: 'alert.something_wrong',
          }),
          error.message || JSON.stringify(error),
        );

        if (manageSubmittingState) {
          setIsSubmitting(false);
        }
        return false;
      }
    }

    return false;
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
