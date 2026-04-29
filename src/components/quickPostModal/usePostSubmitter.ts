import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { useComment } from '@ecency/sdk';
import { SheetManager } from 'react-native-actions-sheet';
import { useAppSelector, useStateWithRef } from '../../hooks';
import { shouldPromptPostingAuthority, getDigitPinCode } from '../../providers/hive/hive';
import { extractMetadata, generateUniquePermlink, makeJsonMetadata } from '../../utils/editor';
import { toastNotification } from '../../redux/actions/uiAction';
import { wavesQueries } from '../../providers/queries';
import { PollDraft } from '../../providers/ecency/ecency.types';
import { usePublishWaveMutation } from '../../providers/queries/postQueries/wavesQueries';
import { PostTypes } from '../../constants/postTypes';
import extractHashTags from '../../utils/extractHashTags';
import { deriveDiscussionRoot } from '../../utils/discussionRoot';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { SheetNames } from '../../navigation/sheets';
import { useAuthContext } from '../../providers/sdk';
import {
  addOptimisticComment,
  removeOptimisticComment,
} from '../../providers/queries/postQueries/commentQueries';
import {
  enforceThreeSpeakBeneficiary,
  hasThreeSpeakEmbed,
} from '../../providers/speak/beneficiary';
import { extractPermlink, linkVideoToHive } from '../../providers/speak/speak';
import { decryptKey } from '../../utils/crypto';

export const usePostSubmitter = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const pusblishWaveMutation = usePublishWaveMutation();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);
  const authContext = useAuthContext();
  const commentMutation = useComment(currentAccount?.name, authContext, 'async');
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
    videoThumbUrls?: string[],
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
            videoThumbUrls,
          );
        } catch (error) {
          // Error granting posting authority - surface through outer handler
          console.warn('Failed to grant posting authority:', error);
          throw error;
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
        videoThumbUrls,
        fetchRatios: true,
        postType,
        pollDraft,
      });
      const jsonMetadata = makeJsonMetadata(meta, tags);

      // Derive root author/permlink for proper cache invalidation and optimistic updates
      const { rootAuthor, rootPermlink } = deriveDiscussionRoot(
        parentPost,
        parentAuthor,
        parentPermlink,
      );

      // Build cache entry for wave optimistic prepend
      const _cacheCommentData = {
        author,
        permlink,
        url,
        parent_author: parentAuthor,
        parent_permlink: parentPermlink,
        markdownBody: commentBody,
        json_metadata: jsonMetadata,
      };

      try {
        // Add optimistic entry to discussions cache for immediate UI feedback
        addOptimisticComment({
          author,
          permlink,
          parentAuthor,
          parentPermlink,
          rootAuthor,
          rootPermlink,
          body: commentBody,
          jsonMetadata,
          authorReputation: currentAccount.reputation,
        });

        // Build mutation params, adding beneficiary options for 3Speak video waves
        const mutationParams: any = {
          author,
          permlink,
          parentAuthor,
          parentPermlink,
          title: '',
          body: commentBody,
          jsonMetadata,
          rootAuthor,
          rootPermlink,
        };

        if (hasThreeSpeakEmbed(commentBody)) {
          const beneficiaries = enforceThreeSpeakBeneficiary([], commentBody);
          if (beneficiaries.length > 0) {
            mutationParams.options = {
              beneficiaries: beneficiaries.map((b) => ({
                account: b.account,
                weight: b.weight,
              })),
            };
          }
        }

        await commentMutation.mutateAsync(mutationParams);

        // Link video to Hive post for 3Speak feeds (fire-and-forget)
        if (hasThreeSpeakEmbed(commentBody)) {
          const embedMatch = commentBody.match(/https?:\/\/[a-z.]*3speak\.tv\/embed[?/][^\s<"']*/);
          if (embedMatch) {
            const videoPermlink = extractPermlink(embedMatch[0]);
            if (videoPermlink && pinHash && currentAccount?.local?.accessToken) {
              const digitPinCode = getDigitPinCode(pinHash);
              const accessToken = decryptKey(
                currentAccount.local.accessToken,
                digitPinCode as string,
              );
              if (accessToken) {
                linkVideoToHive({
                  videoPermlink,
                  hiveAuthor: author,
                  hivePermlink: permlink,
                  hiveTags: tags,
                  accessToken,
                }).catch(() => {}); // non-critical
              }
            }
          }
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
        // Roll back optimistic entry on failure
        removeOptimisticComment(
          author,
          permlink,
          rootAuthor,
          rootPermlink,
          parentAuthor,
          parentPermlink,
        );

        console.log(error);

        let errMsg = error?.message || '';
        if (!errMsg) {
          try {
            errMsg = JSON.stringify(error);
          } catch {
            errMsg = String(error ?? '');
          }
        }

        Alert.alert(
          intl.formatMessage({
            id: 'alert.something_wrong',
          }),
          errMsg,
        );

        return false;
      }
    } catch (error: any) {
      let errMsg = error?.message || '';
      if (!errMsg) {
        try {
          errMsg = JSON.stringify(error);
        } catch {
          errMsg = String(error ?? '');
        }
      }
      Alert.alert(
        intl.formatMessage({
          id: 'alert.something_wrong',
        }),
        errMsg,
      );
      return false;
    } finally {
      if (manageSubmittingState) {
        setIsSubmitting(false);
      }
    }
  };

  // fetch latest waves container and post wave to it
  const _submitWave = async (body: string, pollDraft: PollDraft, videoThumbUrl?: string | null) => {
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
        videoThumbUrl ? [videoThumbUrl] : undefined,
      );

      if (_cacheCommentData) {
        pusblishWaveMutation.mutate(_cacheCommentData);
      }

      return _cacheCommentData;
    } catch (err) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err && typeof err === 'object' && 'message' in err
          ? String((err as any).message || 'Unknown error')
          : String(err || 'Unknown error');
      Alert.alert('Fail', errorMessage);
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
