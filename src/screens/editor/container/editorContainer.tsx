import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Alert } from 'react-native';
import get from 'lodash/get';
import AsyncStorage from '@react-native-community/async-storage';
import { isArray } from 'lodash';

// Services and Actions
import { Buffer } from 'buffer';

import {
  addDraft,
  updateDraft,
  getDrafts,
  addSchedule,
} from '../../../providers/ecency/ecency';
import { toastNotification, setRcOffer } from '../../../redux/actions/uiAction';
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
  generateReplyPermlink,
  makeJsonMetadata,
  makeOptions,
  extractMetadata,
  makeJsonMetadataForUpdate,
  createPatch,
  extractImageUrls,
} from '../../../utils/editor';
// import { generateSignature } from '../../../utils/image';
// Component
import EditorScreen from '../screen/editorScreen';
import { removeBeneficiaries, setBeneficiaries } from '../../../redux/actions/editorActions';
import { DEFAULT_USER_DRAFT_ID, TEMP_BENEFICIARIES_ID } from '../../../redux/constants/constants';
import { deleteDraftCacheEntry, updateCommentCache, updateDraftCache } from '../../../redux/actions/cacheActions';
import QUERIES from '../../../providers/queries/queryKeys';
import { QueryClient } from '@tanstack/react-query';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class EditorContainer extends Component<any, any> {
  _isMounted = false;
  _updatedDraftFields = null;

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
      isDraft: false,
      community: [],
      rewardType: 'default',
      sharedSnippetText: null,
      onLoadDraftPress: false,
      thumbIndex: 0,
      shouldReblog: false,
      failedImageUploads: 0,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._isMounted = true;
    const { currentAccount, route } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';
    let isReply;
    let draftId;
    let isEdit;
    let post;
    let _draft;
    let hasSharedIntent = false;

    if (route.params) {
      const navigationParams = route.params;
      hasSharedIntent = navigationParams.hasSharedIntent;

      if (navigationParams.draft) {
        _draft = navigationParams.draft;

        // this._loadMeta(_draft);

        this.setState({
          draftId: _draft._id,
          isDraft: true,
        });
        this._getStorageDraft(username, isReply, _draft);
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
        if(post){
          draftId = `${currentAccount.name}/${post.author}/${post.permlink}`
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
      if(hasSharedIntent){
        const files = navigationParams.files;
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
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
    if(prevState.rewardType !== this.state.rewardType || prevProps.beneficiariesMap !== this.props.beneficiariesMap){
      // update isDraftSaved when reward type or beneficiaries are changed in post options
      this._handleFormChanged();
    }
  }
  _getStorageDraft = async (username, isReply, paramDraft) => {
    const { drafts, dispatch } = this.props;
    if (isReply) {
      const _draft = drafts.get(paramDraft._id);
      if (_draft && _draft.body) {
        this.setState({
          draftPost: {
            body: _draft.body,
          },
        });
      }
    } else {
      //TOOD: get draft from redux after reply side is complete
      const _draftId = paramDraft ? paramDraft._id : DEFAULT_USER_DRAFT_ID + username;
      const _localDraft = drafts.get(_draftId);

      //if _draft is returned and param draft is available, compare timestamp, use latest
      //if no draft, use result anayways

      if (_localDraft && (!paramDraft || paramDraft.timestamp < _localDraft.updated)) {
        this.setState({
          draftPost: {
            body: get(_localDraft, 'body', ''),
            title: get(_localDraft, 'title', ''),
            tags: get(_localDraft, 'tags', '').split(','),
            isDraft: paramDraft ? true : false,
            draftId: paramDraft ? paramDraft._id : null,
            meta: _localDraft.meta ? _localDraft.meta : null
          },
        });
        this._loadMeta(_localDraft); //load meta from local draft
      }

      //if above fails with either no result returned or timestamp is old,
      // and use draft form nav param if available.
      else if (paramDraft) {
        const _tags = paramDraft.tags.includes(' ')
          ? paramDraft.tags.split(' ')
          : paramDraft.tags.split(',');
        this.setState({
          draftPost: {
            title: paramDraft.title,
            body: paramDraft.body,
            tags: _tags,
            meta: paramDraft.meta ? paramDraft.meta : null
          },
          isDraft: true,
          draftId: paramDraft._id,
        });

        this._loadMeta(paramDraft); //load meta from param draft
      }

    }
  };

  // load meta from local/param drfat into state
  _loadMeta = (draft: any) => {
    const { dispatch, currentAccount } = this.props;
    // if meta exist on draft, get the index of 1st image in meta from images urls in body
    const body = draft.body;
    if (draft.meta && draft.meta.image) {
      const urls = extractImageUrls({ body });
      const draftThumbIndex = urls.indexOf(draft.meta.image[0]);
      this.setState({
        thumbIndex: draftThumbIndex,
      });
    }

    // load beneficiaries and rewards data from meta field of draft
    if (draft.meta && draft.meta.rewardType) {
      this.setState({
        rewardType: draft.meta.rewardType,
      });
    }

    if (draft._id && draft.meta && draft.meta.beneficiaries) {
      if(isArray(draft.meta.beneficiaries)){
        const filteredBeneficiaries = draft.meta.beneficiaries.filter((item) => item.account !== currentAccount.username); //remove default beneficiary from array while saving
        dispatch(setBeneficiaries(draft._id || TEMP_BENEFICIARIES_ID, filteredBeneficiaries));
      }
    }
  }
  _requestKeyboardFocus = () => {
    //50 ms timeout is added to avoid keyboard not showing up on android
    setTimeout(() => {
      //request keyboard focus
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
   **/
  _fetchDraftsForComparison = async (isReply) => {
    const { currentAccount, isLoggedIn, intl, dispatch, drafts } = this.props;
    const username = get(currentAccount, 'name', '');

    //initilizes editor with reply or non remote id less draft
    const _getStorageDraftGeneral = async (requestFocus = true) => {
      await this._getStorageDraft(username, isReply);
      if (requestFocus) {
        this._requestKeyboardFocus();
      }
    };

    //skip comparison if its a reply and run general function
    if (isReply) {
      _getStorageDraftGeneral();
      return;
    }

    try {
      //if not logged in use non remote draft
      if (!isLoggedIn) {
        _getStorageDraftGeneral();
        return;
      }

      const remoteDrafts = await getDrafts(username);
      
      const idLessDraft = drafts.get(DEFAULT_USER_DRAFT_ID + username)

      const loadRecentDraft = () => {
        //if no draft available means local draft is recent
        if (remoteDrafts.length == 0) {
          _getStorageDraftGeneral(false);
          return;
        }

        //sort darts based on timestamps
        remoteDrafts.sort((d1, d2) =>
          new Date(d1.modified).getTime() < new Date(d2.modified).getTime() ? 1 : -1,
        );
        const _draft = remoteDrafts[0];

        //if unsaved local draft is more latest then remote draft, use that instead
        //if editor was opened from draft screens, this code will be skipped anyways.
        if (
          idLessDraft &&
          (idLessDraft.title !== '' || idLessDraft.tags !== '' || idLessDraft.body !== '') &&
          new Date(_draft.modified).getTime() < idLessDraft.updated
        ) {
          _getStorageDraftGeneral(false);
          return;
        }

        //initilize editor as draft
        this.setState({
          draftId: _draft._id,
          isDraft: true,
        });
        this._getStorageDraft(username, isReply, _draft);
      };

      if (remoteDrafts.length > 0 || (idLessDraft && idLessDraft.updated > 0)) {
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

    return beneficiariesMap[draftId || TEMP_BENEFICIARIES_ID]
      || [{ account: currentAccount.name, weight: 10000 }];
  }


  _saveDraftToDB = async (fields, saveAsNew = false) => {
    const { isDraftSaved, draftId, thumbIndex, isReply, rewardType } = this.state;
    const { currentAccount, dispatch, intl, route } = this.props;

    const queryClient = route.params?.queryClient;

    if (isReply) { 
      this._saveCurrentDraft(this._updatedDraftFields)
      return;
    }


    const beneficiaries = this._extractBeneficiaries();

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
        
        const meta = Object.assign({}, extractMetadata(draftField.body, thumbIndex), {
          tags: draftField.tags,
          beneficiaries,
          rewardType
        });
        const jsonMeta = makeJsonMetadata(meta, draftField.tags);
        
        //update draft is draftId is present
        if (draftId && draftField && !saveAsNew) {
          await updateDraft(draftId, draftField.title, draftField.body, draftField.tags, jsonMeta);

          if (this._isMounted) {
            this.setState({
              isDraftSaved: true,
              isDraftSaving: false,
            });
          }
        }

        //create new darft otherwise
        else if (draftField) {
          const response = await addDraft(draftField.title, draftField.body, draftField.tags, jsonMeta);

          if (this._isMounted) {
            this.setState({
              isDraftSaved: true,
              isDraftSaving: false,
              draftId: response._id,
            });
          }
          const filteredBeneficiaries = beneficiaries.filter((item) => item.account !== currentAccount.username); //remove default beneficiary from array while saving
          dispatch(setBeneficiaries(response._id, filteredBeneficiaries));
          dispatch(removeBeneficiaries(TEMP_BENEFICIARIES_ID));

          //clear local copy if darft save is successful
          const username = get(currentAccount, 'name', '');

          dispatch(deleteDraftCacheEntry(draftId || (DEFAULT_USER_DRAFT_ID + username)))
        }


        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'editor.draft_save_success',
            }),
          ),
        );


        //call fetch post to drafts screen
        if(queryClient){
          queryClient.invalidateQueries([QUERIES.DRAFTS.GET])
        }
      }
    } catch (err) {
      console.warn('Failed to save draft to DB: ', err);
      if (this._isMounted) {
        this.setState({
          isDraftSaving: false,
          isDraftSaved: false,
        });

        //saves draft locally if remote draft save fails
        this._saveCurrentDraft(this._updatedDraftFields)
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
  }


  _saveCurrentDraft = async (fields) => {
    const { draftId, isReply, isEdit, isPostSending } = this.state;

    //skip draft save in case post is sending or is post beign edited
    if (isPostSending || isEdit) {
      return;
    }

    const { currentAccount, dispatch } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';

    const draftField = {
      title: fields.title,
      body: fields.body,
      tags: fields.tags && fields.tags.length > 0 ? fields.tags.toString() : '',
      author: username,
      meta: fields.meta && fields.meta,
    }

    //save reply data
    if (isReply && draftField.body !== null) {
      dispatch(updateDraftCache(draftId, draftField))

      //save existing draft data locally
    } else if (draftId) {
      dispatch(updateDraftCache(draftId, draftField))
    }

    //update editor data locally
    else if (!isReply) {
      dispatch(updateDraftCache(DEFAULT_USER_DRAFT_ID + username, draftField));
    }
  };





  _submitPost = async ({ fields, scheduleDate }: { fields: any, scheduleDate?: string }) => {

    const {
      currentAccount,
      dispatch,
      intl,
      navigation,
      pinCode,
      // isDefaultFooter,
    } = this.props;
    const { rewardType, isPostSending, thumbIndex, draftId, shouldReblog } = this.state;

    const beneficiaries = this._extractBeneficiaries();


    if (isPostSending) {
      return;
    }

    if (currentAccount) {
      this.setState({
        isPostSending: true,
      });

      const meta = extractMetadata(fields.body, thumbIndex);
      const _tags = fields.tags.filter((tag) => tag && tag !== ' ');

      const jsonMeta = makeJsonMetadata(meta, _tags);
      // TODO: check if permlink is available github: #314 https://github.com/ecency/ecency-mobile/pull/314
      let permlink = generatePermlink(fields.title);

      let dublicatePost;
      try {
        dublicatePost = await getPurePost(currentAccount.name, permlink);
      } catch (e) {
        dublicatePost = null;
      }

      if (dublicatePost && (dublicatePost.permlink === permlink)) {
        permlink = generatePermlink(fields.title, true);
      }

      const author = currentAccount.name;
      const options = makeOptions({
        author: author,
        permlink: permlink,
        operationType: rewardType,
        beneficiaries: beneficiaries,
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
          fields.title,
          fields.body,
          jsonMeta,
          options,
          voteWeight,
        )
          .then((response) => {

            console.log(response);

            //reblog if flag is active
            if (shouldReblog) {
              reblog(
                currentAccount,
                pinCode,
                author,
                permlink
              ).then((resp) => {
                console.log("Successfully reblogged post", resp)
              }).catch((err) => {
                console.warn("Failed to reblog post", err)
              })
            }

            //post publish updates
            dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + currentAccount.name))

            dispatch(removeBeneficiaries(TEMP_BENEFICIARIES_ID))
            if (draftId) {
              dispatch(removeBeneficiaries(draftId))
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
                }, {
                key: get(currentAccount, 'name')
              }
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
    const { currentAccount, pinCode, dispatch } = this.props;
    const { isPostSending } = this.state;

    if (isPostSending) {
      return;
    }

    if (currentAccount) {
      this.setState({
        isPostSending: true,
      });

      const { post } = this.state;
      const permlink = generateReplyPermlink(post.author);

      const parentAuthor = post.author;
      const parentPermlink = post.permlink;
      const parentTags = post.json_metadata.tags;


      await postComment(
        currentAccount,
        pinCode,
        parentAuthor,
        parentPermlink,
        permlink,
        fields.body,
        parentTags,
      )
        .then(() => {
          AsyncStorage.setItem('temp-reply', '');
          this._handleSubmitSuccess();

          //create a cache entry
          dispatch(
            updateCommentCache(
              `${parentAuthor}/${parentPermlink}`,
              {
                author: currentAccount.name,
                permlink,
                parent_author: parentAuthor,
                parent_permlink: parentPermlink,
                markdownBody: fields.body,
              },
              {
                parentTags: parentTags || ['ecency']
              }
            )
          )

        })
        .catch((error) => {
          this._handleSubmitFailure(error);
        });
    }
  };

  _submitEdit = async (fields) => {
    const { currentAccount, pinCode, dispatch } = this.props;
    const { post, isEdit, isPostSending, thumbIndex, isReply } = this.state;

    if (isPostSending) {
      return;
    }

    if (currentAccount) {
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

      const meta = extractMetadata(fields.body, thumbIndex);

      let jsonMeta = {};

      try {
        const oldJson = jsonMetadata; //already parsed in postParser.js
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
        title,
        newBody,
        jsonMeta,
        null,
        null,
        isEdit,
      )
        .then(() => {
          this._handleSubmitSuccess();
          if (isReply) {
            AsyncStorage.setItem('temp-reply', '');
            dispatch(
              updateCommentCache(
                `${parentAuthor}/${parentPermlink}`,
                {
                  author: currentAccount.name,
                  permlink,
                  parent_author: parentAuthor,
                  parent_permlink: parentPermlink,
                  markdownBody: body,
                  active_votes: post.active_votes,
                  net_rshares: post.net_rshares,
                  author_reputation: post.author_reputation,
                  total_payout: post.total_payout,
                  created: post.created,
                  json_metadata: jsonMeta
                },
                {
                  isUpdate: true
                }
              )
            )
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
      //when RC is not enough, offer boosting account
      dispatch(setRcOffer(true));
    } else if (
      error &&
      error.jse_shortmsg &&
      error.jse_shortmsg.includes('wait to transact')) {
      //when RC is not enough, offer boosting account
      dispatch(setRcOffer(true));
    } else {
      //when other errors
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error.message || JSON.stringify(error),
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
    const { navigation, route } = this.props;

    this.stateTimer = setTimeout(() => {
      if (navigation) {
        navigation.goBack();
      }
      if (route.params?.fetchPost) {
        route.params.fetchPost();
      }
      this.setState({
        isPostSending: false,
      });
      clearTimeout(this.stateTimer);
    }, 3000);
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
    const { currentAccount, pinCode, intl } = this.props;

    if (fields.title === '' || fields.body === '') {
      const timer = setTimeout(() => {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.fail',
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
            Alert.alert(
              intl.formatMessage({
                id: 'alert.fail',
              }),
              get(error, 'message', error.toString()),
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
      beneficiaries: beneficiaries,
    });

    addSchedule(
      data.permlink,
      data.fields.title,
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

        dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + currentAccount.name))

        setTimeout(() => {
          navigation.replace(ROUTES.SCREENS.DRAFTS,
            {
              showSchedules: true
            })
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
      dispatch
    } = this.props;

    dispatch(deleteDraftCacheEntry(DEFAULT_USER_DRAFT_ID + name))

    this.setState({
      uploadedImage: null,
    });
  };

  _handleRewardChange = (value) => {
    this.setState({ rewardType: value });
  };


  _handleShouldReblogChange = (value: boolean) => {
    this.setState({
      shouldReblog: value
    })
  }


  _handleSetThumbIndex = (index: number) => {
    this.setState({
      thumbIndex: index
    })
  }

  _setIsUploading = (status:boolean) => {
    this.setState({
      isUploading:status
    })
  }


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
      thumbIndex,
      uploadProgress,
      rewardType,
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
        handleOnBackPress={() => { }}
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
        updateDraftFields = {this._updateDraftFields}
        saveCurrentDraft={this._saveCurrentDraft}
        saveDraftToDB={this._saveDraftToDB}
        uploadedImage={uploadedImage}
        tags={tags}
        community={community}
        currentAccount={currentAccount}
        draftId={draftId}
        sharedSnippetText={sharedSnippetText}
        onLoadDraftPress={onLoadDraftPress}
        thumbIndex={thumbIndex}
        setThumbIndex={this._handleSetThumbIndex}
        uploadProgress={uploadProgress}
        rewardType={rewardType}
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
  drafts: state.cache.drafts,
});

export default connect(mapStateToProps)(injectIntl(EditorContainer));
