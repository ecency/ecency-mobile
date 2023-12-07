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
import { addDraft, updateDraft, getDrafts, addSchedule } from '../../../providers/ecency/ecency';
import { toastNotification, setRcOffer, showActionModal } from '../../../redux/actions/uiAction';
import {
  postContent,
  getPurePost,
  grantPostingPermission,
  reblog,
  postComment,
} from '../../../providers/hive/dhive';

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
  removeBeneficiaries,
  setAllowSpkPublishing,
  setBeneficiaries,
} from '../../../redux/actions/editorActions';
import { DEFAULT_USER_DRAFT_ID, TEMP_BENEFICIARIES_ID } from '../../../redux/constants/constants';
import {
  deleteDraftCacheEntry,
  updateCommentCache,
  updateDraftCache,
} from '../../../redux/actions/cacheActions';
import QUERIES from '../../../providers/queries/queryKeys';
import bugsnapInstance from '../../../config/bugsnag';
import { useUserActivityMutation } from '../../../providers/queries/pointQueries';
import { PointActivityIds } from '../../../providers/ecency/ecency.types';
import { usePostsCachePrimer } from '../../../providers/queries/postQueries/postQueries';
import { PostTypes } from '../../../constants/postTypes';
import { speakQueries } from '../../../providers/queries';
import {
  BENEFICIARY_SRC_ENCODER,
  DEFAULT_SPEAK_BENEFICIARIES,
} from '../../../providers/speak/constants';
import { ThreeSpeakVideo } from '../../../providers/speak/speak.types';

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
      rewardType: 'default',
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
    const { currentAccount, route, queryClient, dispatch } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';
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
        const cachedDrafts: any = queryClient.getQueryData([QUERIES.DRAFTS.GET]);

        if (cachedDrafts && cachedDrafts.length) {
          // get draft from query cache
          const _draft = cachedDrafts.find((draft) => draft._id === draftId);

          this.setState({
            draftId,
          });

          this._getStorageDraft(username, isReply, _draft);
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
        if (post) {
          draftId = `${currentAccount.name}/${post.author}/${post.permlink}`;
        }

        this.setState({
          isReply,
          draftId,
          autoFocusText: true,
        });
        if (draftId) {
          this._getStorageDraft(username, isReply, { _id: draftId });
        }
      }

      if (navigationParams.isEdit) {
        ({ isEdit } = navigationParams);
        this.setState({
          isEdit,
          draftPost: {
            title: get(post, 'title', ''),
            body: get(post, 'markdownBody', ''),
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
    const { draftsCollection } = this.props;
    if (isReply) {
      const _draft = draftsCollection && draftsCollection[paramDraft._id];
      if (_draft && !!_draft.body) {
        this.setState({
          draftPost: {
            body: _draft.body,
          },
        });
      }
    } else {
      // TOOD: get draft from redux after reply side is complete
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
        const _tags = paramDraft.tags.includes(' ')
          ? paramDraft.tags.split(' ')
          : paramDraft.tags.split(',');
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

    if (draft._id && draft.meta && draft.meta.beneficiaries) {
      if (isArray(draft.meta.beneficiaries)) {
        const filteredBeneficiaries = draft.meta.beneficiaries.filter(
          (item) => item.account !== currentAccount.username,
        ); // remove default beneficiary from array while saving

        dispatch(setBeneficiaries(draft._id || TEMP_BENEFICIARIES_ID, filteredBeneficiaries));
      }
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
    const { currentAccount, isLoggedIn, draftsCollection } = this.props;
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

      const remoteDrafts = await getDrafts();

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
    const { beneficiariesMap } = this.props;

    return (
      beneficiariesMap[draftId || TEMP_BENEFICIARIES_ID] || []
    );
  };

  _saveDraftToDB = async (fields, saveAsNew = false) => {
    const { isDraftSaved, draftId, thumbUrl, isReply, rewardType, postDescription } = this.state;
    const { currentAccount, dispatch, intl, queryClient, speakContentBuilder } = this.props;

    try {
      // saves draft locallly
      this._saveCurrentDraft(this._updatedDraftFields);
    } catch (err) {
      console.warn('local draft safe failed, skipping for remote only', err);
      bugsnapInstance.notify(err);
    }

    if (isReply) {
      return;
    }

    speakContentBuilder.build(fields.body);

    const beneficiaries = this._extractBeneficiaries();
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

        speakIds.forEach((_id) => {
          const videoItem = videosCache.find((item) => item._id === _id);
          if (videoItem?.speakData) {
            videos[_id] = videoItem.speakData;
          }
        });

        const meta = Object.assign({}, _extractedMeta, {
          tags: draftField.tags,
          beneficiaries,
          rewardType,
          description: postDescription || postBodySummaryContent,
          videos: Object.keys(videos).length > 0 && videos,
        });

        const jsonMeta = makeJsonMetadata(meta, draftField.tags);

        // update draft is draftId is present
        if (draftId && draftField && !saveAsNew) {
          await updateDraft(
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
          const draft = { title, body, tags, meta: jsonMeta };
          const response = await addDraft(draft);
          const _resDraft = response.pop();

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
            (item) => item.account !== currentAccount.username,
          ); // remove default beneficiary from array while saving
          dispatch(setBeneficiaries(_resDraft._id, filteredBeneficiaries));
          dispatch(removeBeneficiaries(TEMP_BENEFICIARIES_ID));

          // clear local copy if darft save is successful
          const username = get(currentAccount, 'name', '');

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
          queryClient.invalidateQueries([QUERIES.DRAFTS.GET]);
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
    const { draftId, isReply, isEdit, isPostSending } = this.state;

    // skip draft save in case post is sending or is post beign edited
    if (isPostSending || isEdit) {
      return;
    }

    const { currentAccount, dispatch } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';

    const draftField = {
      title: fields.title || '',
      body: fields.body || '',
      tags: fields.tags && fields.tags.length > 0 ? fields.tags.toString() : '',
      author: username,
      meta: fields.meta && fields.meta,
    };

    // save reply data or save existing draft data locall
    if (isReply || draftId) {
      dispatch(updateDraftCache(draftId, draftField));
    }
    // update editor data locally
    else if (!isReply) {
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
      pinCode,
      userActivityMutation,
      speakContentBuilder,
      speakMutations,
    } = this.props;
    const { rewardType, isPostSending, thumbUrl, draftId, shouldReblog } = this.state;

    const fields = Object.assign({}, _fieldsBase);
    let beneficiaries = this._extractBeneficiaries();
    let videoPublishMeta: ThreeSpeakVideo | undefined = undefined;

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
        dispatch(showActionModal({
          title: intl.formatMessage({id:'alert.notice'}),
          body: intl.formatMessage({id:'editor.schedule_video_unsupported'})
        }))
        return;
      }

      this.setState({
        isPostSending: true,
      });

      // only require video meta for unpublished video, it will always be one
      const meta = await extractMetadata({
        body: fields.body,
        thumbUrl,
        videoThumbUrls: speakContentBuilder.thumbUrlsRef.current,
        fetchRatios: true,
        videoPublishMeta,
      });
      const _tags = fields.tags.filter((tag) => tag && tag !== ' ');

      const jsonMeta = makeJsonMetadata(meta, _tags);

      // TODO: check if permlink is available github: #314 https://github.com/ecency/ecency-mobile/pull/314
      let permlink = videoPublishMeta
        ? videoPublishMeta.permlink
        : generatePermlink(fields.title || '');

      let dublicatePost;
      try {
        dublicatePost = await getPurePost(currentAccount.name, permlink);
      } catch (e) {
        dublicatePost = null;
      }

      if (dublicatePost && dublicatePost.permlink === permlink) {
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
      const voteWeight = null;

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
        });
      } else {
        await postContent(
          currentAccount,
          pinCode,
          '',
          parentPermlink,
          permlink,
          fields.title || '',
          fields.body,
          jsonMeta,
          options,
          voteWeight,
        )
          .then((response) => {
            console.log(response);

            // track user activity for points
            userActivityMutation.mutate({
              pointsTy: PointActivityIds.POST,
              transactionId: response.id,
            });

            // reblog if flag is active
            if (shouldReblog) {
              reblog(currentAccount, pinCode, author, permlink)
                .then((resp) => {
                  // track user activity for points on reblog
                  userActivityMutation.mutate({
                    pointsTy: PointActivityIds.REBLOG,
                    transactionId: resp.id,
                  });
                  console.log('Successfully reblogged post', resp);
                })
                .catch((err) => {
                  console.warn('Failed to reblog post', err);
                });
            }

            // mark unpublished video as published on 3speak if that is the case
            if (videoPublishMeta) {
              console.log('marking inserted video as published');
              speakMutations.updateInfoMutation.mutate({
                id:videoPublishMeta._id,
                title:fields.title,
                body:fields.body,
                tags:fields.tags
              })
              speakMutations.markAsPublishedMutation.mutate(videoPublishMeta._id);
            }

            // post publish updates
            dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + currentAccount.name));

            dispatch(removeBeneficiaries(TEMP_BENEFICIARIES_ID));
            if (draftId) {
              dispatch(removeBeneficiaries(draftId));
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
            }, 3000);
          })
          .catch((error) => {
            this._handleSubmitFailure(error);
          });
      }
    }
  };

  _submitReply = async (fields) => {
    const {
      currentAccount,
      pinCode,
      dispatch,
      userActivityMutation,
      draftsCollection,
      speakContentBuilder,
    } = this.props;
    const { isPostSending } = this.state;

    if (isPostSending) {
      return;
    }

    if (currentAccount) {
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
      const draftId = `${currentAccount.name}/${parentAuthor}/${parentPermlink}`; // different draftId for each user acount

      const meta = await extractMetadata({
        body: fields.body,
        fetchRatios: true,
        postType: PostTypes.COMMENT,
      });
      const jsonMetadata = makeJsonMetadata(meta, parentTags || ['ecency']);

      await postComment(
        currentAccount,
        pinCode,
        parentAuthor,
        parentPermlink,
        permlink,
        fields.body,
        jsonMetadata,
      )
        .then((response) => {
          // record user activity for points
          userActivityMutation.mutate({
            pointsTy: PointActivityIds.COMMENT,
            transactionId: response.id,
          });

          AsyncStorage.setItem('temp-reply', '');
          this._handleSubmitSuccess();

          // create a cache entry
          const author = currentAccount.name;
          dispatch(
            updateCommentCache(
              `${author}/${permlink}`,
              {
                author,
                permlink,
                parent_author: parentAuthor,
                parent_permlink: parentPermlink,
                markdownBody: fields.body,
              },
              {
                parentTags: parentTags || ['ecency'],
              },
            ),
          );

          // delete quick comment draft cache if it exist
          if (draftsCollection && draftsCollection[draftId]) {
            dispatch(deleteDraftCacheEntry(draftId));
          }
        })
        .catch((error) => {
          this._handleSubmitFailure(error);
        });
    }
  };

  _submitEdit = async (fields) => {
    const { currentAccount, pinCode, dispatch, postCachePrimer, speakContentBuilder } = this.props;
    const { post, isEdit, isPostSending, thumbUrl, isReply } = this.state;

    if (isPostSending) {
      return;
    }

    if (currentAccount) {
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
      });

      let jsonMeta = {};

      try {
        const oldJson = jsonMetadata; // already parsed in postParser.js
        jsonMeta = makeJsonMetadataForUpdate(oldJson, meta, tags);
      } catch (e) {
        jsonMeta = makeJsonMetadata(meta, tags);
      }

      await postContent(
        currentAccount,
        pinCode,
        parentAuthor || '',
        parentPermlink || '',
        permlink,
        title || '',
        newBody,
        jsonMeta,
        null,
        null,
        isEdit,
      )
        .then(() => {
          const author = currentAccount.name;
          this._handleSubmitSuccess();
          if (isReply) {
            AsyncStorage.setItem('temp-reply', '');
            dispatch(
              updateCommentCache(
                `${author}/${permlink}`,
                {
                  author,
                  permlink,
                  parent_author: parentAuthor,
                  parent_permlink: parentPermlink,
                  markdownBody: body,
                  active_votes: post.active_votes,
                  net_rshares: post.net_rshares,
                  author_reputation: post.author_reputation,
                  total_payout: post.total_payout,
                  created: post.created,
                  json_metadata: jsonMeta,
                },
                {
                  isUpdate: true,
                },
              ),
            );
          } else {
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
        })
        .catch((error) => {
          this._handleSubmitFailure(error);
        });
    }
  };

  _handleSubmitFailure = (error) => {
    const { intl, dispatch } = this.props;
    console.log(error);
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
    const { currentAccount, pinCode, intl, dispatch } = this.props;

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
        await grantPostingPermission(json, pinCode, currentAccount)
          .then(() => {
            this._submitPost({ fields, scheduleDate: datePickerValue });
          })
          .catch((error) => {
            dispatch(
              toastNotification(
                intl.formatMessage(
                  { id: 'alert.something_wrong_msg' },
                  { messsage: error.message },
                ),
              ),
            );
          });
      }
    }
  };

  _setScheduledPost = (data) => {
    const { dispatch, intl, currentAccount, navigation } = this.props;
    const { rewardType } = this.state;
    const beneficiaries = this._extractBeneficiaries();

    const options = makeOptions({
      author: data.author,
      permlink: data.permlink,
      operationType: rewardType,
      beneficiaries,
    });

    addSchedule(
      data.permlink,
      data.fields.title || '',
      data.fields.body,
      data.jsonMeta,
      options,
      data.scheduleDate,
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
  currentAccount: state.account.currentAccount,
  isDefaultFooter: state.account.isDefaultFooter,
  isLoggedIn: state.application.isLoggedIn,
  pinCode: state.application.pin,
  beneficiariesMap: state.editor.beneficiariesMap,
  draftsCollection: state.cache.draftsCollection,
});

const mapQueriesToProps = () => ({
  queryClient: useQueryClient(),
  speakContentBuilder: speakQueries.useSpeakContentBuilder(),
  speakMutations: speakQueries.useSpeakMutations(),
  userActivityMutation: useUserActivityMutation(),
  postCachePrimer: usePostsCachePrimer(),
});

export default gestureHandlerRootHOC(
  connect(mapStateToProps)(
    injectIntl((props) => <EditorContainer {...props} {...mapQueriesToProps()} />),
  ),
);
