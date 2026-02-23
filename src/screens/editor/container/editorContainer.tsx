import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Alert, AppState, AppStateStatus, NativeEventSubscription, Platform } from 'react-native';
import get from 'lodash/get';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isArray } from 'lodash';

// Services and Actions
import { Buffer } from 'buffer';
import { useQueryClient } from '@tanstack/react-query';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { postBodySummary } from '@ecency/render-helper';
import {
  getDraftsInfiniteQueryOptions,
  getDraftsQueryOptions,
  getPostQueryOptions,
  addDraft,
  updateDraft,
  addSchedule,
} from '@ecency/sdk';
import { SheetManager } from 'react-native-actions-sheet';
import * as Sentry from '@sentry/react-native';
import { speakQueries } from '../../../providers/queries';
import { toastNotification, setRcOffer } from '../../../redux/actions/uiAction';
import { getDigitPinCode, shouldPromptPostingAuthority } from '../../../providers/hive/dhive';
import { decryptKey } from '../../../utils/crypto';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities
import {
  generatePermlink,
  generateUniquePermlink,
  makeJsonMetadata,
  makeOptions,
  extractMetadata,
  makeJsonMetadataForUpdate,
  createPatch,
  extract3SpeakIds,
} from '../../../utils/editor';

// Component
import EditorScreen from '../screen/editorScreen';
import {
  removeEditorCache,
  setAllowSpkPublishing,
  setBeneficiaries,
  setPollDraftAction,
} from '../../../redux/actions/editorActions';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import {
  deleteDraftCacheEntry,
  deleteReplyCacheEntry,
  updateDraftCache,
  updateReplyCache,
} from '../../../redux/actions/cacheActions';
import QUERIES from '../../../providers/queries/queryKeys';
import { useUserActivityMutation } from '../../../providers/queries/pointQueries';
import { PointActivityIds } from '../../../providers/ecency/ecency.types';
import { usePostsCachePrimer } from '../../../providers/queries/postQueries/postQueries';
import { useCommentMutations } from '../../../providers/queries/postQueries/commentQueries';
import {
  useReblogMutation,
  useGrantPostingPermissionMutation,
} from '../../../providers/sdk/mutations';
import { PostTypes } from '../../../constants/postTypes';

import {
  BENEFICIARY_SRC_ENCODER,
  DEFAULT_SPEAK_BENEFICIARIES,
} from '../../../providers/speak/constants';
import { ThreeSpeakVideo } from '../../../providers/speak/speak.types';
import { SheetNames } from '../../../navigation/sheets';
import {
  selectCurrentAccount,
  selectIsLoggedIn,
  selectPin,
  selectIsDefaultFooter,
} from '../../../redux/selectors';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class EditorContainer extends Component<EditorContainerProps, any> {
  _isMounted = false;

  _updatedDraftFields = null;

  _appStateSub: NativeEventSubscription | null = null;

  _appState = AppState.currentState;

  _isSubmitting = false;

  _postingAuthorityPromptShown = false;

  constructor(props) {
    super(props);
    this.state = {
      autoFocusText: false,
      draftId: null,
      draftPost: null,
      isDraftSaved: false,
      isDraftSaving: false,
      isEdit: false,
      isPostSending: false,
      isReply: false,
      quickReplyText: '',
      isUploading: false,
      uploadProgress: 0,
      post: null,
      uploadedImage: null,
      community: [],
      rewardType: props?.defaultRewardType ? props.defaultRewardType : 'default',
      sharedSnippetText: null,
      onLoadDraftPress: false,
      thumbUrl: '',
      shouldReblog: false,
      postDescription: '',
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._isMounted = true;
    const { currentAccount, route, queryClient, dispatch, pinCode, intl } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';
    const accessToken = currentAccount?.local?.accessToken
      ? decryptKey(currentAccount.local.accessToken, getDigitPinCode(pinCode))
      : '';
    let isReply;
    let draftId;
    let isEdit;
    let post;
    let _draft;
    let hasSharedIntent = false;

    if (route.params) {
      const navigationParams = route.params;
      const { hasSharedIntent: _hasShared, draftId: _draftId } = navigationParams;
      hasSharedIntent = _hasShared;

      if (_draftId) {
        draftId = _draftId;

        // Try to get draft from infinite query cache (SDK structure)
        // Search through all loaded pages
        let paramDraft = null;
        const { queryKey: infiniteQueryKey } = getDraftsInfiniteQueryOptions(
          username,
          accessToken,
          20,
        );
        const infiniteQueryData: any = queryClient.getQueryData(infiniteQueryKey);

        if (infiniteQueryData?.pages) {
          const allDrafts = infiniteQueryData.pages.flatMap((page) => page?.data || []);
          paramDraft = allDrafts.find((draft) => draft._id === draftId) || null;
        }

        // Set the draftId in state immediately
        this.setState({
          draftId,
        });

        // If draft is in cache, load it immediately
        if (paramDraft) {
          this._getStorageDraft(username, isReply, paramDraft);
        }
        // If not in cache, fetch from API to get the specific draft
        // This handles cases where the draft is on a page that hasn't been loaded yet
        else {
          const draftsQueryOptions = getDraftsQueryOptions(username, accessToken);
          queryClient
            .fetchQuery(draftsQueryOptions)
            .then((result) => {
              const drafts = Array.isArray(result) ? result : result?.data || [];
              const fetchedDraft = drafts.find((d) => d._id === draftId);
              if (fetchedDraft) {
                this._getStorageDraft(username, isReply, fetchedDraft);
              }
            })
            .catch((err) => {
              console.warn('Failed to fetch draft from API', err);
              dispatch(
                toastNotification(
                  intl.formatMessage({
                    id: 'alert.fail',
                    defaultMessage: 'Fetch failed.',
                  }),
                ),
              );
            });
        }
      }

      if (navigationParams.community) {
        this.setState({
          community: navigationParams.community,
        });
      }

      if (navigationParams.post) {
        ({ post } = navigationParams);
        this.setState({
          post,
        });
      }

      if (navigationParams.isReply) {
        ({ isReply } = navigationParams);
        let _draftBody = '';

        if (post) {
          draftId = `${currentAccount.name}/${post.author}/${post.permlink}`;
          // For replies, use replyCache instead of draftsCollection
          const { replyCache } = this.props;
          const _replyDraft = replyCache && replyCache[draftId];

          if (_replyDraft && !!_replyDraft.body) {
            const cachedMediaUrls = _replyDraft.meta?.image;
            const _mediaUrls =
              navigationParams.replyMediaUrls?.length > 0
                ? navigationParams.replyMediaUrls
                : Array.isArray(cachedMediaUrls)
                ? cachedMediaUrls
                : [];
            _draftBody =
              _mediaUrls.length > 0
                ? `${_replyDraft.body}\n\n ![](${_mediaUrls[0]})`
                : _replyDraft.body;
          }
        }

        this.setState({
          draftPost: {
            body: _draftBody,
          },
          isReply,
          draftId,
          autoFocusText: true,
        });
      }

      if (navigationParams.isEdit) {
        ({ isEdit } = navigationParams);
        // For comments, markdownBody might not be set, so fall back to body
        const postBody = get(post, 'markdownBody', '') || get(post, 'body', '');
        this.setState({
          isEdit,
          draftPost: {
            title: get(post, 'title', ''),
            body: postBody,
            tags: get(post, 'json_metadata.tags', []),
          },
        });
      }

      if (navigationParams.action) {
        this._handleRoutingAction(navigationParams.action);
      }

      // handle file/text shared from ReceiveSharingIntent
      if (hasSharedIntent) {
        const { files } = navigationParams;
        console.log('files : ', files);

        files.forEach((el) => {
          if (el.text) {
            this.setState({
              sharedSnippetText: el.text,
            });
          }
        });
      }
    }

    if (!isEdit && !_draft && !draftId && !hasSharedIntent) {
      this._fetchDraftsForComparison(isReply);
    }
    this._requestKeyboardFocus();

    this._appStateSub = AppState.addEventListener('change', this._handleAppStateChange);

    // dispatch spk publishing status
    dispatch(setAllowSpkPublishing(!isReply && !isEdit));
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>): void {
    if (
      prevState.rewardType !== this.state.rewardType ||
      prevProps.beneficiariesMap !== this.props.beneficiariesMap ||
      prevProps.pollDraftsMap !== this.props.pollDraftsMap ||
      prevState.postDescription !== this.state.postDescription
    ) {
      // update isDraftSaved when reward type or beneficiaries are changed in post options
      this._handleFormChanged();
    }
  }

  componentWillUnmount() {
    if (this._appStateSub) {
      this._appStateSub.remove();
    }
    this._isMounted = false;
  }

  _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (this._appState.match(/active|forground/) && nextAppState === 'inactive') {
      this._saveCurrentDraft(this._updatedDraftFields);
    }
    this._appState = nextAppState;
  };

  _getStorageDraft = async (username, isReply, paramDraft) => {
    const { draftsCollection, replyCache } = this.props;
    if (isReply) {
      // For replies, use replyCache instead of draftsCollection
      const replyId = paramDraft?._id || this.state.draftId;
      if (!replyId) {
        return;
      }
      const _draft = replyCache && replyCache[replyId];
      if (_draft && !!_draft.body) {
        const cachedMedia = _draft.meta?.image;
        const mediaUrls = Array.isArray(cachedMedia) ? cachedMedia : [];
        const bodyWithMedia =
          mediaUrls.length > 0 ? `${_draft.body}\n\n ![](${mediaUrls[0]})` : _draft.body;
        this.setState({
          draftPost: {
            body: bodyWithMedia,
          },
        });
      }
    } else {
      const _draftId = paramDraft ? paramDraft._id : DEFAULT_USER_DRAFT_ID + username;
      const _localDraft = draftsCollection && draftsCollection[_draftId];

      // if _draft is returned and param draft is available, compare timestamp, use latest
      // if no draft, use result anayways

      const _remoteDraftModifiedAt = paramDraft ? new Date(paramDraft.modified).getTime() : 0;
      const _useLocalDraft =
        _remoteDraftModifiedAt < (_localDraft?.updated || 0) && !!_localDraft.body;
      if (_useLocalDraft) {
        this.setState({
          draftPost: {
            body: get(_localDraft, 'body', ''),
            title: get(_localDraft, 'title', ''),
            tags: get(_localDraft, 'tags', '').split(','),
            draftId: paramDraft ? paramDraft._id : null,
            meta: _localDraft.meta ? _localDraft.meta : null,
          },
        });
        this._loadMeta(_localDraft); // load meta from local draft
      }

      // if above fails with either no result returned or timestamp is old,
      // and use draft form nav param if available.
      else if (paramDraft) {
        // SDK returns tags_arr (array) and tags (string)
        // Prefer tags_arr if available, otherwise parse tags string
        let _tags = [];
        if (paramDraft.tags_arr && Array.isArray(paramDraft.tags_arr)) {
          _tags = paramDraft.tags_arr;
        } else if (paramDraft.tags) {
          _tags = paramDraft.tags
            .split(/[,\s]+/)
            .map((tag) => tag.trim())
            .filter((tag) => !!tag);
        }

        this.setState({
          draftPost: {
            title: paramDraft.title || '',
            body: paramDraft.body || '',
            tags: _tags || [],
            meta: paramDraft.meta ? paramDraft.meta : null,
          },
          draftId: paramDraft._id,
        });

        this._loadMeta(paramDraft); // load meta from param draft
      }
    }
  };

  // load meta from local/param drfat into state
  _loadMeta = (draft: any) => {
    const { dispatch, currentAccount } = this.props;
    const { draftId } = this.state;

    // if meta exist on draft, get the index of 1st image in meta from images urls in body
    // const body = draft.body;
    if (draft.meta && draft.meta.image) {
      // const urls = extractImageUrls({ body });
      this.setState({
        thumbUrl: draft.meta.image[0],
      });
    }

    // load beneficiaries and rewards data from meta field of draft
    if (draft.meta && draft.meta.rewardType) {
      this.setState({
        rewardType: draft.meta.rewardType,
      });
    }

    if (draft.meta && draft.meta.description) {
      this.setState({
        postDescription: draft.meta.description,
      });
    }

    // Use draft._id if available, otherwise use draftId from state, or fallback to DEFAULT_USER_DRAFT_ID
    const _draftId = draft._id || draftId || DEFAULT_USER_DRAFT_ID + currentAccount.name;

    if (isArray(draft.meta?.beneficiaries)) {
      const filteredBeneficiaries = draft.meta.beneficiaries.filter(
        (item) => item.account !== currentAccount.name,
      ); // remove default beneficiary from array while saving

      dispatch(setBeneficiaries(_draftId, filteredBeneficiaries));
    }

    if (draft.meta?.poll) {
      dispatch(setPollDraftAction(_draftId, draft.meta.poll));
    }
  };

  _requestKeyboardFocus = () => {
    // 50 ms timeout is added to avoid keyboard not showing up on android
    setTimeout(() => {
      // request keyboard focus
      this.setState({
        autoFocusText: true,
      });
    }, 50);
  };

  /**
   * this fucntion is run if editor is access fused mid tab or reply section
   * it fetches fresh drafts and run some comparions to load one of following
   * empty editor, load non-remote draft or most recent remote draft based on timestamps
   * prompts user as well
   * @param isReply
   * */
  _fetchDraftsForComparison = async (isReply) => {
    const { currentAccount, isLoggedIn, draftsCollection, pinCode } = this.props;
    const username = get(currentAccount, 'name', '');

    // initilizes editor with reply or non remote id less draft
    const _getStorageDraftGeneral = async (requestFocus = true) => {
      await this._getStorageDraft(username, isReply);
      if (requestFocus) {
        this._requestKeyboardFocus();
      }
    };

    // skip comparison if its a reply and run general function
    if (isReply) {
      _getStorageDraftGeneral();
      return;
    }

    try {
      // if not logged in use non remote draft
      if (!isLoggedIn) {
        _getStorageDraftGeneral();
        return;
      }

      // if idless unsaved draft exist load that first.
      const idLessDraft = draftsCollection && draftsCollection[DEFAULT_USER_DRAFT_ID + username];
      if (
        idLessDraft &&
        idLessDraft.updated > 0 &&
        (idLessDraft.title !== '' || idLessDraft.tags !== '' || idLessDraft.body !== '')
      ) {
        _getStorageDraftGeneral();
        return;
      }

      const accessToken = currentAccount?.local?.accessToken
        ? decryptKey(currentAccount.local.accessToken, getDigitPinCode(pinCode))
        : '';
      const draftsQueryOptions = getDraftsQueryOptions(username, accessToken);
      const { queryClient } = this.props;
      const result = await queryClient.fetchQuery(draftsQueryOptions);
      const remoteDrafts = Array.isArray(result) ? result : result?.data || [];

      const loadRecentDraft = () => {
        // if no draft available means local draft is recent
        if (remoteDrafts.length == 0) {
          _getStorageDraftGeneral(false);
          return;
        }

        // sort darts based on timestamps
        remoteDrafts.sort((d1, d2) =>
          new Date(d1.modified).getTime() < new Date(d2.modified).getTime() ? 1 : -1,
        );
        const _draft = remoteDrafts[0];

        // initilize editor as draft
        this.setState({
          draftId: _draft._id,
        });
        this._getStorageDraft(username, isReply, _draft);
      };

      if (remoteDrafts.length > 0) {
        this.setState({
          onLoadDraftPress: loadRecentDraft,
        });
      }
    } catch (err) {
      console.warn('Failed to compare drafts, load general', err);
      _getStorageDraftGeneral();
    }
  };

  _extractBeneficiaries = () => {
    const { draftId } = this.state;
    const { beneficiariesMap, currentAccount } = this.props;

    // Use same draft ID logic as in _loadMeta to avoid key mismatch
    const _draftId = draftId || DEFAULT_USER_DRAFT_ID + currentAccount.name;

    return beneficiariesMap[_draftId] || [];
  };

  _extractPollDraft = () => {
    const { draftId } = this.state;
    const { pollDraftsMap, currentAccount } = this.props;

    // Use same draft ID logic as in _loadMeta to avoid key mismatch
    const _draftId = draftId || DEFAULT_USER_DRAFT_ID + currentAccount.name;

    return pollDraftsMap[_draftId];
  };

  _saveDraftToDB = async (fields, saveAsNew = false) => {
    const { isDraftSaved, draftId, thumbUrl, isReply, rewardType, postDescription } = this.state;
    const { currentAccount, dispatch, intl, queryClient, speakContentBuilder, pinCode } =
      this.props;

    try {
      // saves draft locallly
      this._saveCurrentDraft(this._updatedDraftFields);
    } catch (err) {
      console.warn('local draft safe failed, skipping for remote only', err);
      Sentry.captureException(err);
    }

    if (isReply) {
      return;
    }

    speakContentBuilder.build(fields.body);

    const beneficiaries = this._extractBeneficiaries();
    const pollDraft = this._extractPollDraft();
    const postBodySummaryContent = postBodySummary(
      get(fields, 'body', ''),
      200,
      Platform.OS as any,
    );
    this._handlePostDescriptionChange(postBodySummaryContent);
    try {
      if (!isDraftSaved) {
        let draftField;

        if (this._isMounted) {
          this.setState({
            isDraftSaving: true,
          });
        }

        if (fields) {
          draftField = {
            ...fields,
            tags: fields.tags.join(' '),
          };
        }

        const _extractedMeta = await extractMetadata({
          body: draftField.body,
          thumbUrl,
          videoThumbUrls: speakContentBuilder.thumbUrlsRef.current,
          fetchRatios: false,
        });

        // inject video meta for draft
        const speakIds = extract3SpeakIds({ body: draftField.body });
        const videos: any = {};
        const videosCache: any = queryClient.getQueryData([QUERIES.MEDIA.GET_VIDEOS]);

        if (videosCache) {
          speakIds.forEach((_id) => {
            const videoItem = videosCache.find((item) => item._id === _id);
            if (videoItem?.speakData) {
              videos[_id] = videoItem.speakData;
            }
          });
        }

        const meta = Object.assign({}, _extractedMeta, {
          tags: draftField.tags,
          beneficiaries,
          poll: pollDraft,
          rewardType,
          description: postDescription || postBodySummaryContent,
          videos: Object.keys(videos).length > 0 && videos,
        });

        const jsonMeta = makeJsonMetadata(meta, draftField.tags);

        const username = currentAccount.name;
        const accessToken = currentAccount?.local?.accessToken
          ? decryptKey(currentAccount.local.accessToken, getDigitPinCode(pinCode))
          : '';

        // If no access token, skip remote save (local cache already updated)
        if (!accessToken) {
          if (this._isMounted) {
            this.setState({
              isDraftSaving: false,
            });
          }
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'editor.draft_save_fail',
              }),
            ),
          );
          return;
        }

        // update draft is draftId is present
        if (draftId && draftField && !saveAsNew) {
          await updateDraft(
            accessToken,
            draftId,
            draftField.title || '',
            draftField.body,
            draftField.tags,
            jsonMeta,
          );

          if (this._isMounted) {
            this.setState({
              isDraftSaved: true,
              isDraftSaving: false,
            });
          }
        }

        // create new darft otherwise
        else if (draftField) {
          const { title, body, tags } = draftField;
          const response = await addDraft(accessToken, title, body, tags, jsonMeta);
          const _resDraft =
            response?.drafts?.[0] || // array wrapper format
            response?.[0] || // direct array format
            (response?._id ? response : null); // single object format

          if (!_resDraft) {
            throw new Error('newly saved draft not returned in response');
          }

          if (this._isMounted) {
            this.setState({
              isDraftSaved: true,
              isDraftSaving: false,
              draftId: _resDraft._id,
            });
          }
          const filteredBeneficiaries = beneficiaries.filter(
            (item) => item.account !== currentAccount.name,
          ); // remove default beneficiary from array while saving
          dispatch(setBeneficiaries(_resDraft._id, filteredBeneficiaries));

          if (pollDraft) {
            dispatch(setPollDraftAction(_resDraft._id, pollDraft));
          }

          dispatch(removeEditorCache(DEFAULT_USER_DRAFT_ID));

          // clear local copy if draft save is successful
          dispatch(deleteDraftCacheEntry(draftId || DEFAULT_USER_DRAFT_ID + username));
        }

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'editor.draft_save_success',
            }),
          ),
        );

        // call fetch post to drafts screen
        if (queryClient) {
          const { queryKey: draftsQueryKey } = getDraftsQueryOptions(
            currentAccount.name,
            accessToken,
          );
          const { queryKey: draftsInfiniteKey } = getDraftsInfiniteQueryOptions(
            currentAccount.name,
            accessToken,
            20,
          );
          queryClient.invalidateQueries({ queryKey: draftsQueryKey });
          queryClient.invalidateQueries({ queryKey: draftsInfiniteKey });
        }
      }
    } catch (err) {
      console.warn('Failed to save draft to DB: ', err);
      if (this._isMounted) {
        this.setState({
          isDraftSaving: false,
          isDraftSaved: false,
        });
      }

      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'editor.draft_save_fail',
          }),
        ),
      );
    }
  };

  _updateDraftFields = (fields) => {
    this._updatedDraftFields = fields;
  };

  _saveCurrentDraft = async (fields) => {
    const { draftId, isReply, isEdit, isPostSending, rewardType, postDescription, thumbUrl } =
      this.state;

    // skip draft save in case post is sending or is post beign edited
    if (isPostSending || isEdit) {
      return;
    }

    const { currentAccount, dispatch } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';

    // Extract beneficiaries and poll data to store in meta
    const beneficiaries = this._extractBeneficiaries();
    const pollDraft = this._extractPollDraft();

    // Build meta object with beneficiaries and other settings
    const meta: any = {};

    if (isArray(beneficiaries) && beneficiaries.length > 0) {
      meta.beneficiaries = beneficiaries;
    }

    if (pollDraft) {
      meta.poll = pollDraft;
    }

    if (rewardType) {
      meta.rewardType = rewardType;
    }

    if (postDescription) {
      meta.description = postDescription;
    }

    if (thumbUrl) {
      meta.image = [thumbUrl];
    }

    const draftField = {
      title: fields.title || '',
      body: fields.body || '',
      tags: fields.tags && fields.tags.length > 0 ? fields.tags.toString() : '',
      author: username,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    };

    // save reply data to replyCache, draft data to draftsCollection
    if (isReply) {
      // Replies go to replyCache - use fallback if draftId is undefined
      const replyId = draftId || DEFAULT_USER_DRAFT_ID + username;
      dispatch(updateReplyCache(replyId, draftField));
    } else if (draftId) {
      // Editing existing draft goes to draftsCollection
      dispatch(updateDraftCache(draftId, draftField));
    } else {
      // New post autosave goes to draftsCollection
      dispatch(updateDraftCache(DEFAULT_USER_DRAFT_ID + username, draftField));
    }
  };

  _submitPost = async ({
    fields: _fieldsBase,
    scheduleDate,
  }: {
    fields: any;
    scheduleDate?: string;
  }) => {
    const {
      currentAccount,
      dispatch,
      intl,
      navigation,
      userActivityMutation,
      speakContentBuilder,
      speakMutations,
      queryClient,
    } = this.props;
    const { rewardType, isPostSending, thumbUrl, draftId, shouldReblog } = this.state;

    const fields = Object.assign({}, _fieldsBase);
    let beneficiaries = this._extractBeneficiaries();
    const pollDraft = this._extractPollDraft();
    let videoPublishMeta: ThreeSpeakVideo | undefined;

    if (isPostSending) {
      return;
    }

    if (currentAccount) {
      // build speak video body
      try {
        fields.body = speakContentBuilder.build(fields.body);
        videoPublishMeta = speakContentBuilder.videoPublishMetaRef.current;

        // verify and make video beneficiaries redundent
        beneficiaries = beneficiaries.filter((item) => item.src !== BENEFICIARY_SRC_ENCODER);
        if (videoPublishMeta) {
          const encoderBene = [
            ...JSON.parse(videoPublishMeta.beneficiaries || '[]'),
            ...DEFAULT_SPEAK_BENEFICIARIES,
          ];
          beneficiaries = [...encoderBene, ...beneficiaries];
        }
      } catch (err) {
        console.warn('fail', err);
        return;
      }

      if (scheduleDate && videoPublishMeta) {
        SheetManager.show(SheetNames.ACTION_MODAL, {
          payload: {
            title: intl.formatMessage({ id: 'alert.notice' }),
            body: intl.formatMessage({ id: 'editor.schedule_video_unsupported' }),
          },
        });

        return;
      }

      this.setState({
        isPostSending: true,
      });

      // Check if we should prompt for posting authority (HiveAuth users without authority)
      if (shouldPromptPostingAuthority(currentAccount)) {
        // Guard against infinite recursion
        if (this._postingAuthorityPromptShown) {
          console.warn('Posting authority prompt already shown, preventing recursion');
          this.setState({ isPostSending: false });
          return;
        }

        this._postingAuthorityPromptShown = true;
        this.setState({ isPostSending: false }); // Reset state before showing prompt

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

          // Recursive call after prompt is handled - use original fields parameter
          return this._submitPost({ fields, scheduleDate });
        } catch (error) {
          // Error granting posting authority - don't retry
          console.warn('Failed to grant posting authority:', error);
          this.setState({ isPostSending: false });
          return;
        } finally {
          this._postingAuthorityPromptShown = false;
        }
      }

      // only require video meta for unpublished video, it will always be one
      const meta = await extractMetadata({
        body: fields.body,
        thumbUrl,
        videoThumbUrls: speakContentBuilder.thumbUrlsRef.current,
        fetchRatios: true,
        videoPublishMeta,
        pollDraft,
      });
      const _tags = fields.tags.filter((tag) => tag && tag !== ' ');

      const jsonMeta = makeJsonMetadata(meta, _tags);

      let permlink = videoPublishMeta
        ? videoPublishMeta.permlink
        : generatePermlink(fields.title || '');

      let duplicatePost;
      try {
        duplicatePost = await queryClient.fetchQuery(
          getPostQueryOptions(currentAccount.name, permlink, ''),
        );
      } catch (e) {
        duplicatePost = null;
      }

      if (duplicatePost && duplicatePost.permlink === permlink) {
        permlink = generatePermlink(fields.title || '', true);
      }

      const author = currentAccount.name;
      const options = makeOptions({
        author,
        permlink,
        operationType: rewardType,
        beneficiaries,
      });
      const parentPermlink = _tags[0] || 'hive-125125';

      if (scheduleDate) {
        if (fields.tags.length === 0) {
          fields.tags = ['hive-125125'];
        }

        this._setScheduledPost({
          author,
          permlink,
          fields,
          scheduleDate,
          jsonMeta,
          beneficiaries,
        });
      } else {
        try {
          const response = await this.props.commentMutation.mutateAsync({
            author,
            permlink,
            parentAuthor: '',
            parentPermlink,
            title: fields.title || '',
            body: fields.body,
            jsonMetadata: jsonMeta,
            options: options
              ? {
                  maxAcceptedPayout: options.max_accepted_payout,
                  percentHbd: options.percent_hbd,
                  allowVotes: options.allow_votes,
                  allowCurationRewards: options.allow_curation_rewards,
                  beneficiaries: Array.isArray(options.extensions?.[0]?.[1]?.beneficiaries)
                    ? options.extensions[0][1].beneficiaries
                    : beneficiaries,
                }
              : undefined,
          });

          // track user activity for points
          userActivityMutation.mutate({
            pointsTy: PointActivityIds.POST,
            transactionId: response.id,
          });

          // reblog if flag is active
          if (shouldReblog) {
            this.props.reblogMutation
              .mutateAsync({ author, permlink })
              .then((resp) => {
                // track user activity for points on reblog
                userActivityMutation.mutate({
                  pointsTy: PointActivityIds.REBLOG,
                  transactionId: resp.id,
                });
              })
              .catch((err) => {
                console.warn('Failed to reblog post', err);
                dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
              });
          }

          // mark unpublished video as published on 3speak if that is the case
          if (videoPublishMeta) {
            console.log('marking inserted video as published');
            speakMutations.updateInfoMutation.mutate({
              id: videoPublishMeta._id,
              title: fields.title,
              body: fields.body,
              tags: fields.tags,
            });
            speakMutations.markAsPublishedMutation.mutate(videoPublishMeta._id);
          }

          // post publish updates
          dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + currentAccount.name));

          dispatch(removeEditorCache(DEFAULT_USER_DRAFT_ID));
          if (draftId) {
            dispatch(removeEditorCache(draftId));
          }

          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.success_shared',
              }),
            ),
          );
          setTimeout(() => {
            this.setState({
              isPostSending: false,
            });
            navigation.replace(
              ROUTES.SCREENS.PROFILE,
              {
                username: get(currentAccount, 'name'),
              },
              {
                key: get(currentAccount, 'name'),
              },
            );
          }, 500);
        } catch (error) {
          this._handleSubmitFailure(error);
        }
      }
    }
  };

  _submitReply = async (fields) => {
    const { currentAccount, dispatch, replyCache, speakContentBuilder, commentMutation } =
      this.props;
    const { isPostSending } = this.state;

    if (isPostSending || this._isSubmitting) {
      return;
    }

    if (currentAccount) {
      // Set both flags immediately to prevent race conditions and show spinner
      this._isSubmitting = true;
      this.setState({ isPostSending: true });

      // Check if we should prompt for posting authority (HiveAuth users without authority)
      if (shouldPromptPostingAuthority(currentAccount)) {
        // Guard against infinite recursion
        if (this._postingAuthorityPromptShown) {
          console.warn('Posting authority prompt already shown, preventing recursion');
          this._isSubmitting = false;
          this.setState({ isPostSending: false });
          return;
        }

        this._postingAuthorityPromptShown = true;
        this._isSubmitting = false; // Reset before showing prompt
        this.setState({ isPostSending: false }); // Reset state before showing prompt

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

          // Recursive call after prompt is handled - the recursive call will set _isSubmitting again
          return this._submitReply(fields);
        } catch (error) {
          // Error granting posting authority - don't retry
          console.warn('Failed to grant posting authority:', error);
          // Reset state and abort
          this.setState({ isPostSending: false });
          return;
        } finally {
          this._postingAuthorityPromptShown = false;
        }
      }

      this.setState({
        isPostSending: true,
      });

      const { post } = this.state;

      fields.body = speakContentBuilder.build(fields.body);

      const _prefix = `re-${post.author.replace(/\./g, '')}`;
      const permlink = generateUniquePermlink(_prefix);

      const parentAuthor = post.author;
      const parentPermlink = post.permlink;
      const parentTags = post.json_metadata.tags;
      const draftId = `${currentAccount.name}/${parentAuthor}/${parentPermlink}`;

      const meta = await extractMetadata({
        body: fields.body,
        fetchRatios: true,
        postType: PostTypes.COMMENT,
      });
      const jsonMetadata = makeJsonMetadata(meta, parentTags || ['ecency']);

      const author = currentAccount.name;

      // Derive root author/permlink for proper cache invalidation
      const rootAuthor = post.root_author || parentAuthor;
      const rootPermlink = post.root_permlink || parentPermlink;

      try {
        await commentMutation.mutateAsync({
          author,
          permlink,
          parentAuthor,
          parentPermlink,
          title: '',
          body: fields.body,
          jsonMetadata,
          rootAuthor,
          rootPermlink,
        });

        AsyncStorage.setItem('temp-reply', '');
        this._handleSubmitSuccess();

        // delete quick comment draft cache if it exist (from replyCache)
        if (replyCache && replyCache[draftId]) {
          dispatch(deleteReplyCacheEntry(draftId));
        }

        this._isSubmitting = false;
      } catch (error) {
        this._isSubmitting = false;
        this._handleSubmitFailure(error);
      }
    }
  };

  _submitEdit = async (fields) => {
    const { currentAccount, postCachePrimer, speakContentBuilder, updateReplyMutation } =
      this.props;
    const { post, isPostSending, thumbUrl, isReply } = this.state;

    if (isPostSending) {
      return;
    }

    if (currentAccount) {
      // Check if we should prompt for posting authority (HiveAuth users without authority)
      if (shouldPromptPostingAuthority(currentAccount)) {
        // Guard against infinite recursion
        if (this._postingAuthorityPromptShown) {
          console.warn('Posting authority prompt already shown, preventing recursion');
          this.setState({ isPostSending: false });
          return;
        }

        this._postingAuthorityPromptShown = true;
        this.setState({ isPostSending: false }); // Reset state before showing prompt

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
          return this._submitEdit(fields);
        } catch (error) {
          // Error granting posting authority - don't retry
          console.warn('Failed to grant posting authority:', error);
          // Reset state and abort
          this.setState({ isPostSending: false });
          return;
        } finally {
          this._postingAuthorityPromptShown = false;
        }
      }

      this.setState({
        isPostSending: true,
      });

      // build speak video body
      fields.body = speakContentBuilder.build(fields.body);

      const { tags, body, title } = fields;
      const {
        markdownBody: oldBody,
        parent_permlink: parentPermlink,
        permlink,
        json_metadata: jsonMetadata,
        parent_author: parentAuthor,
      } = post;

      let newBody = body;
      const patch = createPatch(oldBody, newBody.trim());

      if (patch && patch.length < Buffer.from(oldBody, 'utf-8').length) {
        newBody = patch;
      }

      const meta = await extractMetadata({
        body: fields.body,
        videoThumbUrls: speakContentBuilder.thumbUrlsRef.current,
        thumbUrl,
        fetchRatios: true,
        postType: jsonMetadata.type,
        contentType: jsonMetadata.content_type,
      });

      let jsonMeta = {};

      try {
        const oldJson = jsonMetadata; // already parsed in postParser.js
        jsonMeta = makeJsonMetadataForUpdate(oldJson, meta, tags);
      } catch (e) {
        jsonMeta = makeJsonMetadata(meta, tags);
      }

      try {
        if (isReply) {
          // Use SDK updateReplyMutation for reply edits
          const author = currentAccount.name;
          const rootAuthor = post.root_author || parentAuthor;
          const rootPermlink = post.root_permlink || parentPermlink;

          await updateReplyMutation.mutateAsync({
            author,
            permlink,
            parentAuthor: parentAuthor || '',
            parentPermlink: parentPermlink || '',
            title: '',
            body: newBody,
            jsonMetadata: jsonMeta,
            rootAuthor,
            rootPermlink,
          });

          // Update local cache for immediate UI feedback
          postCachePrimer.cachePost({
            ...post,
            body,
            json_metadata: jsonMeta,
            markdownBody: body,
            updated: new Date().toISOString(),
          });

          AsyncStorage.setItem('temp-reply', '');
          this._handleSubmitSuccess();
        } else {
          // Use SDK comment mutation for post edits (non-reply)
          await this.props.commentMutation.mutateAsync({
            author: currentAccount.name,
            permlink,
            parentAuthor: parentAuthor || '',
            parentPermlink: parentPermlink || '',
            title: title || '',
            body: newBody,
            jsonMetadata: jsonMeta,
          });

          this._handleSubmitSuccess();
          // update post query data
          postCachePrimer.cachePost({
            ...post,
            title,
            body,
            json_metadata: jsonMeta,
            markdownBody: body,
            updated: new Date().toISOString(),
          });
        }
      } catch (error) {
        this._handleSubmitFailure(error);
      }
    }
  };

  _handleSubmitFailure = (error) => {
    const { intl, dispatch } = this.props;
    console.log(error);

    this._isSubmitting = false;
    if (
      error &&
      error.response &&
      error.response.jse_shortmsg &&
      error.response.jse_shortmsg.includes('wait to transact')
    ) {
      // when RC is not enough, offer boosting account
      dispatch(setRcOffer(true));
    } else if (error && error.jse_shortmsg && error.jse_shortmsg.includes('wait to transact')) {
      // when RC is not enough, offer boosting account
      dispatch(setRcOffer(true));
    } else {
      // when other errors
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'alert.something_wrong_msg' }, { message: error.message }),
        ),
      );
    }

    this.stateTimer = setTimeout(() => {
      this.setState({
        isPostSending: false,
      });
      clearTimeout(this.stateTimer);
    }, 500);
  };

  _handleSubmitSuccess = () => {
    const { navigation } = this.props;

    this._isSubmitting = false;

    if (navigation) {
      navigation.goBack();
    }
    this.setState({
      isPostSending: false,
    });
  };

  _handleSubmit = (form: any) => {
    const { isReply, isEdit } = this.state;
    const { intl } = this.props;

    if (isReply && !isEdit) {
      this._submitReply(form.fields);
    } else if (isEdit) {
      Alert.alert(
        intl.formatMessage({
          id: 'editor.alert_pub_edit_title',
        }),
        intl.formatMessage({
          id: 'editor.alert_pub_body',
        }),
        [
          {
            text: intl.formatMessage({
              id: 'editor.alert_btn_no',
            }),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: intl.formatMessage({
              id: 'editor.alert_btn_yes',
            }),
            onPress: () => this._submitEdit(form.fields),
          },
        ],
        { cancelable: false },
      );
    } else {
      Alert.alert(
        intl.formatMessage({
          id: 'editor.alert_pub_new_title',
        }),
        intl.formatMessage({
          id: 'editor.alert_pub_body',
        }),
        [
          {
            text: intl.formatMessage({
              id: 'editor.alert_btn_no',
            }),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: intl.formatMessage({
              id: 'editor.alert_btn_yes',
            }),
            onPress: () => this._submitPost({ fields: form.fields }),
          },
        ],
        { cancelable: false },
      );
    }
  };

  _handleFormChanged = () => {
    const { isDraftSaved } = this.state;

    if (isDraftSaved) {
      this.setState({
        isDraftSaved: false,
      });
    }
  };

  _handleSchedulePress = async (datePickerValue, fields) => {
    const { currentAccount, intl, dispatch } = this.props;

    if (fields.title === '' || fields.body === '') {
      const timer = setTimeout(() => {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.something_wrong',
          }),
          intl.formatMessage({
            id: 'alert.can_not_be_empty',
          }),
        );
        clearTimeout(timer);
      }, 100);
    } else {
      const json = get(currentAccount, 'posting_json_metadata', '');

      let hasPostingPerm = false;

      if (currentAccount && currentAccount.posting) {
        hasPostingPerm =
          currentAccount.posting.account_auths.filter((x) => x[0] === 'ecency.app').length > 0;
      }

      if (hasPostingPerm) {
        this._submitPost({ fields, scheduleDate: datePickerValue });
      } else {
        try {
          await this.props.grantPostingPermissionMutation.mutateAsync({
            currentPosting: currentAccount.posting,
            grantedAccount: 'ecency.app',
            weightThreshold: currentAccount.posting.weight_threshold,
            memoKey: currentAccount.memo_key,
            jsonMetadata: json,
          });
          this._submitPost({ fields, scheduleDate: datePickerValue });
        } catch (error) {
          dispatch(
            toastNotification(
              intl.formatMessage(
                { id: 'alert.something_wrong_msg' },
                { message: error?.message || '' },
              ),
            ),
          );
        }
      }
    }
  };

  _setScheduledPost = (data) => {
    const { dispatch, intl, currentAccount, navigation, pinCode } = this.props;
    const { rewardType } = this.state;

    const options = makeOptions({
      author: data.author,
      permlink: data.permlink,
      operationType: rewardType,
      beneficiaries: data.beneficiaries,
    });

    const accessToken = currentAccount?.local?.accessToken
      ? decryptKey(currentAccount.local.accessToken, getDigitPinCode(pinCode))
      : '';

    if (!accessToken) {
      this.setState({ isPostSending: false });
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.fail',
            defaultMessage: 'Schedule failed.',
          }),
        ),
      );
      return;
    }

    addSchedule(
      accessToken,
      data.permlink,
      data.fields.title || '',
      data.fields.body,
      data.jsonMeta,
      options,
      data.scheduleDate,
      false,
    )
      .then(() => {
        this.setState({
          isPostSending: false,
        });
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success',
            }),
          ),
        );

        dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + currentAccount.name));

        setTimeout(() => {
          navigation.replace(ROUTES.SCREENS.DRAFTS, {
            showSchedules: true,
          });
        }, 3000);
      })
      .catch((error) => {
        console.warn('Failed to schedule post', error);
        this.setState({
          isPostSending: false,
        });
        dispatch(
          toastNotification(
            intl.formatMessage(
              { id: 'alert.something_wrong_msg' },
              { message: error?.message || '' },
            ),
          ),
        );
      });
  };

  _initialEditor = () => {
    const {
      currentAccount: { name },
      dispatch,
    } = this.props;

    dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + name));

    this.setState({
      uploadedImage: null,
    });
  };

  _handleRewardChange = (value) => {
    this.setState({ rewardType: value });
  };

  _handlePostDescriptionChange = (value: string) => {
    this.setState({ postDescription: value });
  };

  _handleShouldReblogChange = (value: boolean) => {
    this.setState({
      shouldReblog: value,
    });
  };

  _handleSetThumbUrl = (url: string) => {
    this.setState({
      thumbUrl: url,
    });
  };

  _setIsUploading = (status: boolean) => {
    this.setState({
      isUploading: status,
    });
  };

  render() {
    const { isLoggedIn, isDarkTheme, currentAccount, route } = this.props;
    const {
      autoFocusText,
      draftPost,
      isDraftSaved,
      isDraftSaving,
      draftId,
      isEdit,
      isOpenCamera,
      isPostSending,
      isReply,
      quickReplyText,
      isUploading,
      post,
      uploadedImage,
      community,
      sharedSnippetText,
      onLoadDraftPress,
      thumbUrl,
      uploadProgress,
      rewardType,
      postDescription,
    } = this.state;

    const tags = route.params?.tags;
    const paramFiles = route.params?.files;

    return (
      <EditorScreen
        paramFiles={paramFiles}
        autoFocusText={autoFocusText}
        draftPost={draftPost}
        handleRewardChange={this._handleRewardChange}
        handleShouldReblogChange={this._handleShouldReblogChange}
        handleSchedulePress={this._handleSchedulePress}
        handleFormChanged={this._handleFormChanged}
        handleOnBackPress={() => {
          console.log('cancel pressed');
        }}
        handleOnSubmit={this._handleSubmit}
        initialEditor={this._initialEditor}
        isDarkTheme={isDarkTheme}
        isDraftSaved={isDraftSaved}
        isDraftSaving={isDraftSaving}
        isEdit={isEdit}
        isLoggedIn={isLoggedIn}
        isOpenCamera={isOpenCamera}
        isPostSending={isPostSending}
        isReply={isReply}
        quickReplyText={quickReplyText}
        isUploading={isUploading}
        post={post}
        updateDraftFields={this._updateDraftFields}
        saveCurrentDraft={this._saveCurrentDraft}
        saveDraftToDB={this._saveDraftToDB}
        uploadedImage={uploadedImage}
        tags={tags}
        community={community}
        currentAccount={currentAccount}
        draftId={draftId}
        sharedSnippetText={sharedSnippetText}
        onLoadDraftPress={onLoadDraftPress}
        thumbUrl={thumbUrl}
        setThumbUrl={this._handleSetThumbUrl}
        uploadProgress={uploadProgress}
        rewardType={rewardType}
        postDescription={postDescription}
        handlePostDescriptionChange={this._handlePostDescriptionChange}
        getBeneficiaries={this._extractBeneficiaries}
        setIsUploading={this._setIsUploading}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccount: selectCurrentAccount(state),
  isDefaultFooter: selectIsDefaultFooter(state),
  isLoggedIn: selectIsLoggedIn(state),
  pinCode: selectPin(state),
  beneficiariesMap: state.editor.beneficiariesMap,
  pollDraftsMap: state.editor.pollDraftsMap,
  defaultRewardType: state.editor.defaultRewardType,
  draftsCollection: state.cache.draftsCollection,
  replyCache: state.cache.replyCache,
});

const mapQueriesToProps = () => ({
  queryClient: useQueryClient(),
  speakContentBuilder: speakQueries.useSpeakContentBuilder(),
  speakMutations: speakQueries.useSpeakMutations(),
  userActivityMutation: useUserActivityMutation(),
  postCachePrimer: usePostsCachePrimer(),
  ...useCommentMutations(),
  reblogMutation: useReblogMutation(),
  grantPostingPermissionMutation: useGrantPostingPermissionMutation(),
});

export default gestureHandlerRootHOC(
  connect(mapStateToProps)(
    injectIntl((props) => <EditorContainer {...props} {...mapQueriesToProps()} />),
  ),
);
