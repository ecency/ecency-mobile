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
} from '@ecency/sdk';
import { SheetManager } from 'react-native-actions-sheet';
import * as Sentry from '@sentry/react-native';
import { toastNotification, setRcOffer } from '../../../redux/actions/uiAction';
import { getDigitPinCode, shouldPromptPostingAuthority } from '../../../providers/hive/hive';
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
} from '../../../utils/editor';

// Component
import EditorScreen from '../screen/editorScreen';
import {
  removeEditorCache,
  setAllowSpkPublishing,
  setBeneficiaries,
  setDraftCaret,
  setPollDraftAction,
} from '../../../redux/actions/editorActions';
import { maybeRequestReview } from '../../../redux/actions/applicationActions';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import {
  deleteDraftCacheEntry,
  deleteReplyCacheEntry,
  updateDraftCache,
  updateReplyCache,
} from '../../../redux/actions/cacheActions';
import { usePostsCachePrimer } from '../../../providers/queries/postQueries/postQueries';
import { deriveDiscussionRoot } from '../../../utils/discussionRoot';
import { isTemplateDraft } from '../../../utils/draftTemplates';
import {
  useCommentMutations,
  addOptimisticComment,
  removeOptimisticComment,
} from '../../../providers/queries/postQueries/commentQueries';
import {
  useReblogMutation,
  useGrantPostingPermissionMutation,
} from '../../../providers/sdk/mutations';
import {
  useAddScheduleMutation,
  useDraftDeleteMutation,
} from '../../../providers/queries/draftQueries';
import { PostTypes } from '../../../constants/postTypes';

import { enforceThreeSpeakBeneficiary } from '../../../providers/speak/beneficiary';
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

  // Set once a post is published so the unmount/autosave draft write is skipped
  // and can't recreate the server draft the publish flow just deleted.
  _isPublished = false;

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
    let hasSharedIntent = false;
    let hasTemplateDraft = false;

    if (route.params) {
      const navigationParams = route.params;
      const { hasSharedIntent: _hasShared, draftId: _draftId, templateDraft } = navigationParams;
      hasSharedIntent = _hasShared;
      hasTemplateDraft = !!templateDraft;

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

      if (templateDraft) {
        this._applyTemplateDraft(templateDraft);
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

    if (!isEdit && !draftId && !hasSharedIntent && !hasTemplateDraft) {
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
    // iOS emits 'inactive' when backgrounding; Android emits 'background'. Use exact
    // equality — a regex like /active/ also matches 'inactive', which would save
    // twice on iOS (active->inactive, then inactive->background). Only save when
    // there are pending edits, since _saveCurrentDraft dereferences the fields.
    const wasForeground = this._appState === 'active';
    const movingToBackground = nextAppState === 'inactive' || nextAppState === 'background';
    if (wasForeground && movingToBackground && this._updatedDraftFields) {
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

  // hydrates editor from a template draft as a NEW post; draftId is intentionally left
  // unset so the first save/autosave creates a new draft instead of editing the template
  _applyTemplateDraft = (templateDraft: any) => {
    const { dispatch, intl } = this.props;

    // SDK returns tags_arr (array) and tags (string)
    let _tags = [];
    if (templateDraft.tags_arr && Array.isArray(templateDraft.tags_arr)) {
      _tags = templateDraft.tags_arr;
    } else if (templateDraft.tags) {
      _tags = templateDraft.tags
        .split(/[,\s]+/)
        .map((tag) => tag.trim())
        .filter((tag) => !!tag);
    }

    // strip template markers so they don't carry over into the new post's draft
    const _meta = templateDraft.meta ? { ...templateDraft.meta } : null;
    if (_meta) {
      delete _meta.postTemplate;
      delete _meta.templateName;
    }

    this.setState({
      draftPost: {
        title: templateDraft.title || '',
        body: templateDraft.body || '',
        tags: _tags,
        meta: _meta,
      },
    });

    // no _id and no state.draftId here, so beneficiaries/poll land under the same
    // default key the new-post flow reads (DEFAULT_USER_DRAFT_ID + account name)
    this._loadMeta({ meta: _meta });

    dispatch(toastNotification(intl.formatMessage({ id: 'templates.applied' })));
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
      // templates are applied explicitly from the templates tab, never offered as recent draft
      const remoteDrafts = (Array.isArray(result) ? result : result?.data || []).filter(
        (draft) => !isTemplateDraft(draft),
      );

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

  _extractDraftCaret = () => {
    const { draftId } = this.state;
    const { caretMap, currentAccount } = this.props;

    // Use same draft ID logic as in _loadMeta to avoid key mismatch
    const _draftId = draftId || DEFAULT_USER_DRAFT_ID + currentAccount.name;

    return caretMap?.[_draftId];
  };

  _saveDraftToDB = async (fields, saveAsNew = false) => {
    // Once a post is published, skip any further draft save (e.g. the unmount
    // autosave) so the source draft is never silently re-written or recreated;
    // the user decides whether to delete it via the publish-success prompt.
    if (this._isPublished) {
      return;
    }

    const { isDraftSaved, draftId, thumbUrl, isReply, rewardType, postDescription } = this.state;
    const { currentAccount, dispatch, intl, queryClient, pinCode } = this.props;

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

    const beneficiaries = this._extractBeneficiaries();
    const pollDraft = this._extractPollDraft();
    // Captured before the draftId-changing setState below so it reads the temp
    // compose key; carried to the new draft id when a first server draft is made.
    const draftCaret = this._extractDraftCaret();
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
          fetchRatios: false,
        });

        const meta = Object.assign({}, _extractedMeta, {
          tags: draftField.tags,
          beneficiaries,
          poll: pollDraft,
          rewardType,
          description: postDescription || postBodySummaryContent,
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

          // Carry the caret to the new draft id too, so reopening the just-saved
          // draft before the next selection change still restores the position.
          if (typeof draftCaret === 'number') {
            dispatch(setDraftCaret(_resDraft._id, draftCaret));
          }

          // Per-account key: the temp compose entries (beneficiaries, poll,
          // caret) are stored under `DEFAULT_USER_DRAFT_ID + currentAccount.name`
          // (not the bare id), so clear them with the same key.
          dispatch(removeEditorCache(DEFAULT_USER_DRAFT_ID + currentAccount.name));

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

  // Saves the current compose state as a NEW template draft (meta.postTemplate +
  // meta.templateName, same convention as Ecency web). Always addDraft: it never
  // updates the draft being composed, never touches state.draftId/isDraftSaved/
  // isDraftSaving and never clears local draft caches, so the normal draft
  // autosave flow keeps working on whatever the user is writing.
  _saveAsTemplate = async (fields, templateName: string) => {
    const { isReply, isEdit, thumbUrl, rewardType, postDescription } = this.state;
    const { currentAccount, dispatch, intl, queryClient, pinCode } = this.props;

    if (isReply || isEdit || !fields) {
      return;
    }

    const beneficiaries = this._extractBeneficiaries();
    const pollDraft = this._extractPollDraft();

    try {
      const draftField = {
        ...fields,
        // a template can be a title-only scaffold; keep body a string throughout
        body: fields.body || '',
        tags: fields.tags && fields.tags.length > 0 ? fields.tags.join(' ') : '',
      };

      const _extractedMeta = await extractMetadata({
        body: draftField.body,
        thumbUrl,
        fetchRatios: false,
      });

      const postBodySummaryContent = postBodySummary(
        draftField.body || '',
        200,
        Platform.OS as any,
      );

      const meta = Object.assign({}, _extractedMeta, {
        tags: draftField.tags,
        beneficiaries,
        poll: pollDraft,
        rewardType,
        description: postDescription || postBodySummaryContent,
        postTemplate: true,
        templateName,
      });

      const jsonMeta = makeJsonMetadata(meta, draftField.tags);

      const accessToken = currentAccount?.local?.accessToken
        ? decryptKey(currentAccount.local.accessToken, getDigitPinCode(pinCode))
        : '';

      if (!accessToken) {
        dispatch(toastNotification(intl.formatMessage({ id: 'editor.draft_save_fail' })));
        return;
      }

      await addDraft(
        accessToken,
        draftField.title || '',
        draftField.body,
        draftField.tags,
        jsonMeta,
      );

      dispatch(toastNotification(intl.formatMessage({ id: 'templates.saved' })));

      // refresh drafts/templates lists so the new template shows up
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
    } catch (err) {
      console.warn('Failed to save template', err);
      dispatch(toastNotification(intl.formatMessage({ id: 'editor.draft_save_fail' })));
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
    const { currentAccount, dispatch, intl, navigation, queryClient } = this.props;
    const { rewardType, isPostSending, thumbUrl, draftId, shouldReblog } = this.state;

    const fields = Object.assign({}, _fieldsBase);
    let beneficiaries = this._extractBeneficiaries();
    const pollDraft = this._extractPollDraft();

    if (isPostSending) {
      // `_handleSubmit` set `_isSubmitting=true` to gate the confirm Alert;
      // bailing out here without clearing it would leave the editor wedged.
      this._isSubmitting = false;
      return;
    }

    if (!currentAccount) {
      this._isSubmitting = false;
      return;
    }

    // Re-arm the synchronous guard at function top (see matching comment in
    // `_submitEdit`). Idempotent on initial entry; required on recursive
    // entry after a HiveAuth prompt to undo the pre-await reset below.
    this._isSubmitting = true;

    // Enforce 3Speak beneficiary if post contains an embed URL
    beneficiaries = enforceThreeSpeakBeneficiary(beneficiaries, fields.body);

    this.setState({
      isPostSending: true,
    });

    // Check if we should prompt for posting authority (HiveAuth users without authority)
    if (shouldPromptPostingAuthority(currentAccount)) {
      // Guard against infinite recursion
      if (this._postingAuthorityPromptShown) {
        console.warn('Posting authority prompt already shown, preventing recursion');
        this.setState({ isPostSending: false });
        this._isSubmitting = false;
        return;
      }

      this._postingAuthorityPromptShown = true;
      this.setState({ isPostSending: false }); // Reset state before showing prompt
      // Release the synchronous guard *before* the await so a dismissed-
      // without-callback prompt sheet (swipe, app backgrounded, …) doesn't
      // permanently wedge the publish button. The recursive call below
      // re-arms it at function top.
      this._isSubmitting = false;

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

        // Recursive call re-enters at function top (which re-arms
        // `_isSubmitting`); eventually hits success/failure handlers.
        return this._submitPost({ fields, scheduleDate });
      } catch (error) {
        // Error granting posting authority - don't retry
        // (`_isSubmitting` already false from above.)
        console.warn('Failed to grant posting authority:', error);
        this.setState({ isPostSending: false });
        this._isSubmitting = false;
        return;
      } finally {
        this._postingAuthorityPromptShown = false;
      }
    }

    // Outer catch: route any error escaping the inner mutation try/catch
    // (extractMetadata reject, generatePermlink throw, _setScheduledPost
    // throw, etc.) through _handleSubmitFailure so `_isSubmitting`,
    // `isPostSending`, and the user-visible toast are all handled
    // consistently. Without this, an early failure would leave the editor
    // wedged on `_isSubmitting=true` until remount.
    try {
      const meta = await extractMetadata({
        body: fields.body,
        thumbUrl,
        fetchRatios: true,
        pollDraft,
      });
      const _tags = fields.tags.filter((tag) => tag && tag !== ' ');

      const jsonMeta = makeJsonMetadata(meta, _tags);

      let permlink = generatePermlink(fields.title || '');

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

        // Awaited so that any unhandled rejection from `_setScheduledPost`
        // (e.g., the internal catch itself throwing) propagates to the outer
        // `_submitPost` catch, which routes through `_handleSubmitFailure`
        // and resets `_isSubmitting`/`isPostSending`. The internal catch in
        // `_setScheduledPost` also resets `_isSubmitting` directly.
        await this._setScheduledPost({
          author,
          permlink,
          fields,
          scheduleDate,
          jsonMeta,
          beneficiaries,
        });
      } else {
        try {
          await this.props.commentMutation.mutateAsync({
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

          // reblog if flag is active
          if (shouldReblog) {
            this.props.reblogMutation.mutateAsync({ author, permlink }).catch((err) => {
              console.warn('Failed to reblog post', err);
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
            });
          }

          // post publish updates
          dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + currentAccount.name));

          // Per-account key so the new-compose editor cache (beneficiaries,
          // poll, caret) is actually cleared on publish — the temp entries are
          // stored under `DEFAULT_USER_DRAFT_ID + currentAccount.name`.
          dispatch(removeEditorCache(DEFAULT_USER_DRAFT_ID + currentAccount.name));
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

          // Publishing is a strong positive signal — offer the rating prompt to
          // engaged users (gated internally by maybeRequestReview).
          dispatch(maybeRequestReview());
          // Reset `_isSubmitting` synchronously on success; the screen will
          // navigate away and unmount shortly, but until then the field must
          // not stay true (or a fast in-window reentry would be blocked by
          // `_handleSubmit`).
          this._isSubmitting = false;
          // Mark published before the unmount so the draft autosave triggered by
          // `componentWillUnmount` is skipped and never re-writes the source
          // draft (the user decides its fate via the prompt below).
          this._isPublished = true;

          const _navigateToProfile = () => {
            this.setState({
              isPostSending: false,
            });
            navigation.replace(ROUTES.SCREENS.PROFILE, {
              username: get(currentAccount, 'name'),
              key: get(currentAccount, 'name'),
            });
          };

          if (draftId) {
            // The post was published from a saved draft. Offer to remove that
            // server draft so drafts don't pile up — but never delete it
            // without explicit confirmation. Either choice then navigates away.
            Alert.alert(
              intl.formatMessage({ id: 'editor.published_draft_delete_title' }),
              intl.formatMessage({ id: 'editor.published_draft_delete_body' }),
              [
                {
                  text: intl.formatMessage({ id: 'editor.published_draft_keep' }),
                  style: 'cancel',
                  onPress: _navigateToProfile,
                },
                {
                  text: intl.formatMessage({ id: 'alert.delete' }),
                  style: 'destructive',
                  onPress: () => {
                    this.props.deleteDraftMutation
                      .mutateAsync({ draftId })
                      .catch((err) => console.warn('Failed to delete published draft', err));
                    _navigateToProfile();
                  },
                },
              ],
              { cancelable: false },
            );
          } else {
            setTimeout(_navigateToProfile, 500);
          }
        } catch (error) {
          this._handleSubmitFailure(error);
        }
      }
    } catch (error) {
      this._handleSubmitFailure(error);
    }
  };

  _submitReply = async (fields) => {
    const { currentAccount, dispatch, replyCache, commentMutation } = this.props;
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

      let permlink;
      let parentAuthor;
      let parentPermlink;
      let draftId;
      let jsonMetadata;
      let author;
      let rootAuthor;
      let rootPermlink;

      try {
        const { post } = this.state;

        const _prefix = `re-${post.author.replace(/\./g, '')}`;
        permlink = generateUniquePermlink(_prefix);

        parentAuthor = post.author;
        parentPermlink = post.permlink;
        const parentTags = post.json_metadata.tags;
        draftId = `${currentAccount.name}/${parentAuthor}/${parentPermlink}`;

        const meta = await extractMetadata({
          body: fields.body,
          fetchRatios: true,
          postType: PostTypes.COMMENT,
        });
        jsonMetadata = makeJsonMetadata(meta, parentTags || ['ecency']);

        author = currentAccount.name;

        // Derive root author/permlink for proper cache invalidation and optimistic updates
        ({ rootAuthor, rootPermlink } = deriveDiscussionRoot(post, parentAuthor, parentPermlink));
      } catch (error) {
        // Building the reply (metadata fetch, malformed parent post, …) failed —
        // reset the sending flags so the reply editor isn't left permanently wedged.
        this._isSubmitting = false;
        this.setState({ isPostSending: false });
        this._handleSubmitFailure(error);
        return;
      }

      try {
        // Add optimistic entry to discussions cache for immediate UI feedback
        addOptimisticComment({
          author,
          permlink,
          parentAuthor,
          parentPermlink,
          rootAuthor,
          rootPermlink,
          body: fields.body,
          jsonMetadata,
          authorReputation: currentAccount.reputation,
        });

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
        // Roll back optimistic entry on failure
        removeOptimisticComment(
          author,
          permlink,
          rootAuthor,
          rootPermlink,
          parentAuthor,
          parentPermlink,
        );

        this._isSubmitting = false;
        this._handleSubmitFailure(error);
      }
    }
  };

  _submitEdit = async (fields) => {
    const { currentAccount, postCachePrimer, updateReplyMutation } = this.props;
    const { post, isPostSending, thumbUrl, isReply } = this.state;

    if (isPostSending) {
      // `_handleSubmit` set `_isSubmitting=true` to gate the confirm Alert;
      // bailing out here without clearing it would leave the editor wedged.
      this._isSubmitting = false;
      return;
    }

    if (!currentAccount) {
      this._isSubmitting = false;
      return;
    }

    // Re-arm the synchronous guard at function top. For initial entry from
    // `_handleSubmit`'s edit branch this is a no-op (already true). For
    // recursive entry after a HiveAuth prompt this re-arms after the
    // pre-await reset below — mirrors the `_submitReply` pattern so a
    // dismissed-without-callback prompt sheet doesn't permanently wedge the
    // publish button.
    this._isSubmitting = true;

    // Check if we should prompt for posting authority (HiveAuth users without authority)
    if (shouldPromptPostingAuthority(currentAccount)) {
      // Guard against infinite recursion
      if (this._postingAuthorityPromptShown) {
        console.warn('Posting authority prompt already shown, preventing recursion');
        this.setState({ isPostSending: false });
        this._isSubmitting = false;
        return;
      }

      this._postingAuthorityPromptShown = true;
      this.setState({ isPostSending: false }); // Reset state before showing prompt
      // Release the synchronous guard *before* the await. If the user
      // dismisses the prompt sheet (swipe, app backgrounded, …) without
      // triggering any of onGranted/onSkipped/onError, the promise stays
      // pending forever — but with `_isSubmitting=false` the publish
      // button is recoverable from the editor (tap publish again ↦
      // `_handleSubmit` re-enters cleanly). The recursive call below
      // re-arms the guard at function top.
      this._isSubmitting = false;

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

        // Recursive call re-enters at function top (which re-arms
        // `_isSubmitting`); eventually hits success/failure handlers.
        return this._submitEdit(fields);
      } catch (error) {
        // Error granting posting authority - don't retry
        console.warn('Failed to grant posting authority:', error);
        // Reset state and abort (`_isSubmitting` already false from above).
        this.setState({ isPostSending: false });
        this._isSubmitting = false;
        return;
      } finally {
        this._postingAuthorityPromptShown = false;
      }
    }

    // Outer catch: route any error escaping the inner mutation try/catch
    // (extractMetadata reject, createPatch / Buffer.from throw, post
    // destructure failure on a malformed `post`, etc.) through
    // _handleSubmitFailure so `_isSubmitting`, `isPostSending`, and the
    // user-visible toast are all handled consistently. Without this, an
    // early failure would leave the editor wedged on `_isSubmitting=true`
    // until remount.
    try {
      this.setState({
        isPostSending: true,
      });

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
          const { rootAuthor, rootPermlink } = deriveDiscussionRoot(
            post,
            parentAuthor,
            parentPermlink,
          );

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
    } catch (error) {
      this._handleSubmitFailure(error);
    }
  };

  _handleSubmitFailure = (error) => {
    const { intl, dispatch } = this.props;

    const msg =
      error && typeof error === 'object' && 'message' in error
        ? (error as any).message
        : typeof error === 'string'
        ? error
        : '';

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
          intl.formatMessage({ id: 'alert.something_wrong_msg' }, { message: msg || '' }),
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
      // _submitReply has its own synchronous `_isSubmitting`/`isPostSending`
      // guard; calling it directly means we must NOT set `_isSubmitting` here
      // or that guard would trip on the very first tap and the reply would
      // never submit.
      this._submitReply(form.fields);
    } else if (isEdit) {
      // Synchronous reentry guard for the edit/new-post branches only. Those
      // paths show a confirmation Alert before submitting, so without this a
      // fast double-tap can enqueue two alerts (and two submissions). Cleared
      // in the Alert "No" callbacks and in `_handleSubmitSuccess`/`_handleSubmitFailure`.
      if (this._isSubmitting) {
        return;
      }
      this._isSubmitting = true;
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
            onPress: () => {
              this._isSubmitting = false;
            },
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
      // Same Alert-stacking guard as the edit branch above.
      if (this._isSubmitting) {
        return;
      }
      this._isSubmitting = true;
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
            onPress: () => {
              this._isSubmitting = false;
            },
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

  _setScheduledPost = async (data) => {
    const { dispatch, currentAccount, navigation, addScheduleMutation } = this.props;
    const { rewardType } = this.state;

    const options = makeOptions({
      author: data.author,
      permlink: data.permlink,
      operationType: rewardType,
      beneficiaries: data.beneficiaries,
    });

    try {
      await addScheduleMutation.mutateAsync({
        permlink: data.permlink,
        title: data.fields.title || '',
        body: data.fields.body,
        meta: data.jsonMeta,
        options,
        schedule: data.scheduleDate,
        reblog: false,
      });

      this.setState({ isPostSending: false });
      // Clear the synchronous submit guard now — the success path uses a
      // 3 s setTimeout before navigating away, and we must not leave the
      // editor wedged on `_isSubmitting=true` during that window.
      this._isSubmitting = false;
      dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + currentAccount.name));

      setTimeout(() => {
        navigation.replace(ROUTES.SCREENS.DRAFTS, {
          showSchedules: true,
        });
      }, 3000);
    } catch (error) {
      console.warn('Failed to schedule post', error);
      // Route through `_handleSubmitFailure` so the user actually sees a
      // toast (the previous bare `console.warn` left scheduled-post failures
      // silent) and so `_isSubmitting`/`isPostSending` reset consistently
      // with every other failure path in this file.
      this._handleSubmitFailure(error);
    }
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
        saveAsTemplate={this._saveAsTemplate}
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
  caretMap: state.editor.caretMap,
  defaultRewardType: state.editor.defaultRewardType,
  draftsCollection: state.cache.draftsCollection,
  replyCache: state.cache.replyCache,
});

const useEditorQueryProps = () => ({
  queryClient: useQueryClient(),
  postCachePrimer: usePostsCachePrimer(),
  ...useCommentMutations(),
  reblogMutation: useReblogMutation(),
  grantPostingPermissionMutation: useGrantPostingPermissionMutation(),
  addScheduleMutation: useAddScheduleMutation(),
  // Deletes a published post's source draft, but only after the user confirms
  // (see the publish-success prompt) — never silently. Best-effort: by the time
  // it resolves the user has navigated away, so the failure toast is suppressed
  // (a failed delete just leaves the draft, which reappears in the drafts list).
  deleteDraftMutation: useDraftDeleteMutation({ showErrorToast: false }),
});

export default gestureHandlerRootHOC(
  connect(mapStateToProps)(
    injectIntl((props) => <EditorContainer {...props} {...useEditorQueryProps()} />),
  ),
);
