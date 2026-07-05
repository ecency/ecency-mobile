import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { useComment } from '@ecency/sdk';
import { SheetManager } from 'react-native-actions-sheet';
import { useAppSelector, useStateWithRef } from '../../hooks';
import {
  shouldPromptPostingAuthority,
  getDigitPinCode,
  isMissingEcencyPostingAuthorityError,
} from '../../providers/hive/hive';
import {
  extractMetadata,
  generateContentBasedPermlink,
  generateUniquePermlink,
  makeJsonMetadata,
} from '../../utils/editor';
import { toastNotification } from '../../redux/actions/uiAction';
import { wavesQueries } from '../../providers/queries';
import { PollDraft } from '../../providers/ecency/ecency.types';
import { usePublishWaveMutation } from '../../providers/queries/postQueries/wavesQueries';
import { PostTypes } from '../../constants/postTypes';
import { WAVES_HOSTS } from '../../constants/waves';
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

  // A HiveSigner token broadcast failed with `unauthorized_client` because
  // ecency.app is not authorised to post for this account. Open the grant /
  // re-authorise sheet (grants directly with the local key for key logins, or
  // routes through HiveSigner for token-only logins) instead of surfacing the
  // raw JSON error. Resolves `true` once the authority is granted, `false` if
  // the user skips, and rejects if the grant itself errors.
  const _promptPostingAuthorityRecovery = (): Promise<boolean> =>
    new Promise<boolean>((resolve, reject) => {
      SheetManager.show(SheetNames.POSTING_AUTHORITY_PROMPT, {
        payload: {
          onGranted: () => resolve(true),
          onSkipped: () => resolve(false),
          onError: (error) => reject(error),
        },
      });
    });

  // handle submit reply
  const _submitReply = async (
    commentBody: string,
    parentPost: any,
    postType: PostTypes = PostTypes.COMMENT,
    pollDraft?: PollDraft,
    manageSubmittingState = true,
    videoThumbUrls?: string[],
    isAuthorityRetry = false,
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

      // Check if we should prompt for posting authority (token-broadcast /
      // HiveAuth users without authority). Skipped on the authority-recovery
      // retry: the grant already happened, and `currentAccount` in this hook
      // render may still be the pre-grant snapshot, which would re-open the
      // prompt or trip the recursion guard.
      if (!isAuthorityRetry && shouldPromptPostingAuthority(currentAccount)) {
        // Guard against infinite recursion - use ref getter to read latest value
        if (getPostingAuthorityPromptShown()) {
          console.warn('Posting authority prompt already shown, preventing recursion');
          return false;
        }

        setPostingAuthorityPromptShown(true);
        // Always release the submit lock before the await, regardless of
        // `manageSubmittingState`. If the user dismisses the prompt sheet
        // without triggering onGranted/onSkipped/onError (swipe, app
        // backgrounded, system kill, …), the promise stays pending forever
        // and the outer `_submitWave`'s `finally` never runs — so without
        // this, isSubmitting would stay true for the component lifetime,
        // permanently wedging the publish button. Mirrors the equivalent
        // fix in `editorContainer.tsx`'s `_submitReply`.
        setIsSubmitting(false);

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

          // Prompt resolved: re-arm the lock before the recursive call ONLY
          // for the externally-managed (wave) path. The recursive call
          // passes `manageSubmittingState` through:
          // - manageSubmittingState=false (wave): the inner call won't set
          //   the lock itself, so we re-arm here. The recursive entry
          //   guard short-circuits on this branch and won't trip.
          // - manageSubmittingState=true (quick-post comment): the inner
          //   call's own `if (manageSubmittingState) setIsSubmitting(true)`
          //   re-arms the lock. Re-arming here would make the recursive
          //   call's entry guard (`manageSubmittingState && isSubmitting`)
          //   fire and silently drop the post.
          if (!manageSubmittingState) {
            setIsSubmitting(true);
          }
          return await _submitReply(
            commentBody,
            parentPost,
            postType,
            pollDraft,
            manageSubmittingState,
            videoThumbUrls,
            isAuthorityRetry,
          );
        } catch (error) {
          // Error granting posting authority - surface through outer handler.
          // Lock is already false from above; no action needed here.
          console.warn('Failed to grant posting authority:', error);
          throw error;
        } finally {
          setPostingAuthorityPromptShown(false);
        }
      }

      const _prefix =
        postType === PostTypes.WAVE ? postType : `re-${parentPost.author.replace(/\./g, '')}`;
      // For waves, derive the permlink from the content so an accidental
      // resubmit (network timeout, app crash mid-publish) produces the same
      // permlink — Hive then rejects the duplicate instead of creating a
      // second wave. Other reply types keep the timestamped form since they
      // aren't part of the "wave duplicate" flow.
      //
      // Intentionally excluded from the content key:
      // - videoThumbUrls: the 3Speak thumbnail is generated asynchronously
      //   after upload and can change between a failed first attempt and its
      //   retry; including it would defeat dedup for the exact case it's
      //   meant to handle. The video itself is already captured because
      //   `quickPostModalContent` concatenates the embed URL into the body
      //   before calling `submitWave`.
      const permlink =
        postType === PostTypes.WAVE
          ? generateContentBasedPermlink(
              _prefix,
              [
                currentAccount.name,
                parentPost.author,
                parentPost.permlink,
                commentBody,
                pollDraft ? JSON.stringify(pollDraft) : '',
              ].join('|'),
            )
          : generateUniquePermlink(_prefix);

      const author = currentAccount.name;
      const parentAuthor = parentPost.author;
      const parentPermlink = parentPost.permlink;
      const parentTags = parentPost.json_metadata.tags || ['ecency'];
      // Canonical ecency.com path: `/@root-author/root-permlink#@comment-author/comment-permlink`.
      // The legacy `/<category>/…` form still 302s to this on the web, but
      // emitting the canonical form keeps json_metadata.url consistent with
      // share/copy output and avoids the redirect hop in any client that
      // dereferences this field.
      const url = `/@${parentAuthor}/${parentPermlink}#@${author}/${permlink}`;

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

      // Build cache entry for wave optimistic prepend. Keep it WaveEntry-shaped:
      // `body` (parsePost derives markdownBody/rendered body from it for the
      // current author) and `created` (the card's timestamp). Without these the
      // optimistic card renders blank until the next feed refetch.
      const _cacheCommentData = {
        author,
        permlink,
        url,
        parent_author: parentAuthor,
        parent_permlink: parentPermlink,
        body: commentBody,
        markdownBody: commentBody,
        created: new Date().toISOString(),
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

        // Missing ecency.app posting authority: offer the grant/re-authorise
        // sheet and, once granted, retry once and return the retry's result so
        // the caller's success handling (e.g. `_submitWave`'s feed prepend)
        // still runs — rather than dumping the raw unauthorized_client JSON.
        // Guarded by `isAuthorityRetry` so a still-missing authority can't loop.
        if (isMissingEcencyPostingAuthorityError(error) && !isAuthorityRetry) {
          // Release the submit lock BEFORE awaiting the sheet. If the user
          // dismisses it without firing onGranted/onSkipped/onError (swipe,
          // app backgrounded, system kill), the promise never settles, this
          // await hangs and the outer `finally` never runs — so without this
          // `isSubmitting` would stay true and permanently wedge publish.
          // Mirrors the pre-flight guard above.
          setIsSubmitting(false);
          // A grant failure surfaces its own toast from the sheet, so treat a
          // rejection as "not granted" here.
          const granted = await _promptPostingAuthorityRecovery().catch(() => false);
          if (!granted) {
            return false;
          }
          // Re-arm only for the wave path: the quick-post retry re-arms via its
          // own `if (manageSubmittingState) setIsSubmitting(true)`, and re-arming
          // here would trip that retry's entry guard.
          if (!manageSubmittingState) {
            setIsSubmitting(true);
          }
          return await _submitReply(
            commentBody,
            parentPost,
            postType,
            pollDraft,
            manageSubmittingState,
            videoThumbUrls,
            true,
          );
        }

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
      if (isMissingEcencyPostingAuthorityError(error) && !isAuthorityRetry) {
        // Release before the await so a dismissed sheet can't wedge
        // `isSubmitting` (see inner catch for the full rationale).
        setIsSubmitting(false);
        const granted = await _promptPostingAuthorityRecovery().catch(() => false);
        if (!granted) {
          return false;
        }
        if (!manageSubmittingState) {
          setIsSubmitting(true);
        }
        return await _submitReply(
          commentBody,
          parentPost,
          postType,
          pollDraft,
          manageSubmittingState,
          videoThumbUrls,
          true,
        );
      }
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

      // Post into the first host that has a live container: hive.flow when
      // available, otherwise the legacy ecency.waves. This keeps a freshly
      // posted wave at the top of the hive.flow-primary feed.
      const latestWavesPost = await wavesQueries.fetchLatestWavesContainer(WAVES_HOSTS);

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
