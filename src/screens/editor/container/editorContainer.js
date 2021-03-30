import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Alert } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import get from 'lodash/get';
import AsyncStorage from '@react-native-community/async-storage';

// Services and Actions
import { Buffer } from 'buffer';
import {
  uploadImage,
  addDraft,
  updateDraft,
  schedule,
  getDrafts,
} from '../../../providers/ecency/ecency';
import { toastNotification, setRcOffer } from '../../../redux/actions/uiAction';
import {
  postContent,
  getPurePost,
  grantPostingPermission,
  signImage,
} from '../../../providers/hive/dhive';
import { setDraftPost, getDraftPost } from '../../../realm/realm';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
// Utilities
import {
  generatePermlink,
  generateReplyPermlink,
  makeJsonMetadata,
  makeOptions,
  extractMetadata,
  makeJsonMetadataReply,
  makeJsonMetadataForUpdate,
  createPatch,
} from '../../../utils/editor';
// import { generateSignature } from '../../../utils/image';
// Component
import EditorScreen from '../screen/editorScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class EditorContainer extends Component {
  _isMounted = false;

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
      isUploading: false,
      post: null,
      uploadedImage: null,
      isDraft: false,
      community: [],
      rewardType: 'default',
      beneficiaries: [],
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._isMounted = true;
    const { currentAccount, navigation } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';
    let isReply;
    let isEdit;
    let post;
    let _draft;

    if (navigation.state && navigation.state.params) {
      const navigationParams = navigation.state.params;

      if (navigationParams.draft) {
        _draft = navigationParams.draft;
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
      if (navigationParams.upload) {
        const { upload } = navigationParams;

        upload.forEach((el) => {
          if (el.filePath && el.fileName) {
            this.setState({ isUploading: true });
            const _media = {
              path: el.filePath,
              mime: el.mimeType,
              filename: el.fileName || `img_${Math.random()}.jpg`,
            };

            this._uploadImage(_media);
          } else if (el.text) {
            this.setState({
              draftPost: {
                title: '',
                body: el.text,
                tags: [],
              },
            });
          }
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
        this.setState({
          isReply,
        });
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
    } else {
      this.setState({
        autoFocusText: true,
      });
    }

    if (!isEdit && !_draft) {
      this._fetchDraftsForComparison(isReply);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  _getStorageDraft = async (username, isReply, paramDraft) => {
    if (isReply) {
      const draftReply = await AsyncStorage.getItem('temp-reply');

      if (draftReply) {
        this.setState({
          draftPost: {
            body: draftReply,
          },
        });
      }
    } else {
      getDraftPost(username, paramDraft && paramDraft._id).then((result) => {
        //if result is return and param draft available, compare timestamp, use latest
        //if no draft, use result anayways
        if (result && (!paramDraft || paramDraft.timestamp < result.timestamp)) {
          this.setState({
            draftPost: {
              body: get(result, 'body', ''),
              title: get(result, 'title', ''),
              tags: get(result, 'tags', '').split(','),
              isDraft: paramDraft ? true : false,
              draftId: paramDraft ? paramDraft._id : null,
            },
          });
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
            },
            isDraft: true,
            draftId: paramDraft._id,
          });
        }
      });
    }
  };

  /**
   * this fucntion is run if editor is access used mid tab or reply section
   * it fetches fresh drafts and run some comparions to load one of following
   * empty editor, load non-remote draft or most recent remote draft based on timestamps
   * prompts user as well
   * @param isReply
   **/
  _fetchDraftsForComparison = async (isReply) => {
    const { currentAccount, isLoggedIn, intl } = this.props;
    const username = get(currentAccount, 'name', '');

    //initilizes editor with reply or non remote id less draft
    const _getStorageDraftGeneral = () => {
      this._getStorageDraft(username, isReply);
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

      const drafts = await getDrafts(username);
      const idLessDraft = await getDraftPost(username);

      const loadRecentDraft = () => {
        //if no draft available means local draft is recent
        if (drafts.length == 0) {
          _getStorageDraftGeneral();
          return;
        }

        //sort darts based on timestamps
        drafts.sort((d1, d2) => (d1.timestamp < d2.timestamp ? 1 : -1));
        const _draft = drafts[0];

        //if unsaved local draft is more latest then remote draft, use that instead
        //if editor was opened from draft screens, this code will be skipped anyways.
        if (idLessDraft && _draft.timestamp < idLessDraft.timestamp) {
          _getStorageDraftGeneral();
          return;
        }

        //initilize editor as draft
        this.setState({
          draftId: _draft._id,
          isDraft: true,
        });
        this._getStorageDraft(username, isReply, _draft);
      };

      const leaveEmpty = () => {
        console.log('Leaving editor empty');
      };

      if (drafts.length > 0 || (idLessDraft && idLessDraft.timestamp > 0)) {
        Alert.alert(
          intl.formatMessage({
            id: 'editor.alert_init_title',
          }),
          intl.formatMessage({
            id: 'editor.alert_init_body',
          }),
          [
            {
              text: intl.formatMessage({ id: 'editor.alert_btn_draft' }),
              onPress: loadRecentDraft,
            },
            { text: intl.formatMessage({ id: 'editor.alert_btn_new' }), onPress: leaveEmpty },
          ],
        );
      }
    } catch (err) {
      console.warn('Failed to compare drafts, load general', err);
      _getStorageDraftGeneral();
    }
  };

  _handleRoutingAction = (routingAction) => {
    if (routingAction === 'camera') {
      this._handleOpenCamera();
    } else if (routingAction === 'image') {
      this._handleOpenImagePicker();
    }
  };

  _handleOpenImagePicker = () => {
    ImagePicker.openPicker({
      includeBase64: true,
      multiple: true,
      mediaType: 'photo',
      smartAlbums: ['UserLibrary', 'Favorites', 'PhotoStream', 'Panoramas', 'Bursts'],
    })
      .then((images) => {
        this._handleMediaOnSelected(images);
      })
      .catch((e) => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleOpenCamera = () => {
    ImagePicker.openCamera({
      includeBase64: true,
      mediaType: 'photo',
    })
      .then((image) => {
        this._handleMediaOnSelected(image);
      })
      .catch((e) => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleMediaOnSelected = (media) => {
    this.setState(
      {
        isUploading: true,
      },
      async () => {
        if (media.length > 0) {
          for (let index = 0; index < media.length; index++) {
            const element = media[index];
            await this._uploadImage(element);
          }
        } else {
          await this._uploadImage(media);
        }
      },
    );
    // For new image api
    // const { currentAccount } = this.props;
    // const digitPinCode = await getPinCode();
    // const privateKey = decryptKey(currentAccount.local.postingKey, digitPinCode);
    // const sign = generateSignature(media, privateKey);
    // const data = new Buffer(media.data, 'base64');
  };

  _uploadImage = async (media) => {
    const { intl, currentAccount, pinCode, isLoggedIn } = this.props;

    if (!isLoggedIn) return;

    let sign = await signImage(media, currentAccount, pinCode);

    uploadImage(media, currentAccount.name, sign)
      .then((res) => {
        if (res.data && res.data.url) {
          res.data.hash = res.data.url.split('/').pop();
          this.setState({
            uploadedImage: res.data,
            isUploading: false,
          });
        }
      })
      .catch((error) => {
        console.log(error, error.message);
        if (error.toString().includes('code 413')) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            intl.formatMessage({
              id: 'alert.payloadTooLarge',
            }),
          );
        } else if (error.toString().includes('code 429')) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            intl.formatMessage({
              id: 'alert.quotaExceeded',
            }),
          );
        } else if (error.toString().includes('code 400')) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            intl.formatMessage({
              id: 'alert.invalidImage',
            }),
          );
        } else {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            error.message || error.toString(),
          );
        }
        this.setState({
          isUploading: false,
        });
      });
  };

  _handleMediaOnSelectFailure = (error) => {
    const { intl } = this.props;

    if (get(error, 'code') === 'E_PERMISSION_MISSING') {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.permission_denied',
        }),
        intl.formatMessage({
          id: 'alert.permission_text',
        }),
      );
    }
  };

  _saveDraftToDB = async (fields) => {
    const { isDraftSaved, draftId } = this.state;
    const { currentAccount, dispatch, intl } = this.props;

    try {
      if (!isDraftSaved) {
        const username = get(currentAccount, 'name', '');
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
            username,
          };
        }

        //update draft is draftId is present
        if (draftId && draftField) {
          await updateDraft({
            ...draftField,
            draftId,
          });

          if (this._isMounted) {
            this.setState({
              isDraftSaved: true,
              isDraftSaving: false,
            });
          }
        }

        //create new darft otherwise
        else if (draftField) {
          const response = await addDraft(draftField);

          if (this._isMounted) {
            this.setState({
              isDraftSaved: true,
              isDraftSaving: false,
              draftId: response._id,
            });
          }

          //clear local copy is darft save is successful
          setDraftPost(
            {
              title: '',
              body: '',
              tags: '',
              timestamp: 0,
            },
            username,
          );
        }

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'editor.draft_save_success',
            }),
          ),
        );
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

  _saveCurrentDraft = async (fields) => {
    const { draftId, isReply, isEdit, isPostSending } = this.state;

    const { currentAccount } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';

    const draftField = {
      ...fields,
      tags: fields.tags && fields.tags.length > 0 ? fields.tags.toString() : '',
    };

    if (!isPostSending) {
      //save reply data
      if (isReply && draftField.body !== null) {
        await AsyncStorage.setItem('temp-reply', draftField.body);

        //save existing draft data locally
      } else if (draftId) {
        setDraftPost(draftField, username, draftId);
      }

      //update editor data locally
      else if (!isReply) {
        setDraftPost(draftField, username);
      }
    }
  };

  _submitPost = async (fields, scheduleDate) => {
    const {
      currentAccount,
      dispatch,
      intl,
      navigation,
      pinCode,
      // isDefaultFooter,
    } = this.props;
    const { rewardType, beneficiaries } = this.state;

    if (currentAccount) {
      this.setState({
        isPostSending: true,
      });

      const meta = extractMetadata(fields.body);
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

      if (dublicatePost && dublicatePost.id) {
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
        await this._setScheduledPost({
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
          .then(async () => {
            setDraftPost(
              {
                title: '',
                body: '',
                tags: '',
                timestamp: 0,
              },
              currentAccount.name,
            );
            await AsyncStorage.setItem('temp-beneficiaries', '');

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
              navigation.navigate({
                routeName: ROUTES.SCREENS.PROFILE,
                params: {
                  username: get(currentAccount, 'name'),
                },
                key: get(currentAccount, 'name'),
              });
            }, 3000);
          })
          .catch((error) => {
            this._handleSubmitFailure(error);
          });
      }
    }
  };

  _submitReply = async (fields) => {
    const { currentAccount, pinCode } = this.props;
    const { rewardType, beneficiaries } = this.state;

    if (currentAccount) {
      this.setState({
        isPostSending: true,
      });

      const { post } = this.state;

      const jsonMeta = makeJsonMetadataReply(post.json_metadata.tags || ['ecency']);
      const permlink = generateReplyPermlink(post.author);
      const author = currentAccount.name;
      const options = null;

      const parentAuthor = post.author;
      const parentPermlink = post.permlink;
      const voteWeight = null;

      await postContent(
        currentAccount,
        pinCode,
        parentAuthor,
        parentPermlink,
        permlink,
        '',
        fields.body,
        jsonMeta,
        options,
        voteWeight,
      )
        .then(() => {
          AsyncStorage.setItem('temp-reply', '');
          this._handleSubmitSuccess();
        })
        .catch((error) => {
          this._handleSubmitFailure(error);
        });
    }
  };

  _submitEdit = async (fields) => {
    const { currentAccount, pinCode } = this.props;
    const { post, isEdit } = this.state;
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

      const meta = extractMetadata(fields.body);

      let jsonMeta = {};

      try {
        const oldJson = JSON.parse(jsonMetadata);
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
          AsyncStorage.setItem('temp-reply', '');
          this._handleSubmitSuccess();
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
    } else if (error && error.jse_shortmsg && error.jse_shortmsg.includes('wait to transact')) {
      //when RC is not enough, offer boosting account
      dispatch(setRcOffer(true));
    } else {
      //when other errors
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error.toString(),
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

    this.stateTimer = setTimeout(() => {
      if (navigation) {
        navigation.goBack();
        navigation.state.params.fetchPost();
      }
      this.setState({
        isPostSending: false,
      });
      clearTimeout(this.stateTimer);
    }, 3000);
  };

  _handleOnBackPress = () => {
    const { navigation } = this.props;
    const { isDraft } = this.state;

    if (isDraft) {
      navigation.state.params.fetchPost();
    }
  };

  _handleSubmit = (form) => {
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
            onPress: () => this._submitPost(form.fields),
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

  _handleDatePickerChange = async (datePickerValue, fields) => {
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
        this._submitPost(fields, datePickerValue);
      } else {
        await grantPostingPermission(json, pinCode, currentAccount)
          .then(() => {
            this._submitPost(fields, datePickerValue);
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
    const { rewardType, beneficiaries } = this.state;

    const options = makeOptions({
      author: data.author,
      permlink: data.permlink,
      operationType: rewardType,
      beneficiaries: beneficiaries,
    });

    schedule(
      data.author,
      data.fields.title,
      data.permlink,
      data.jsonMeta,
      data.fields.tags,
      data.fields.body,
      '',
      '',
      data.scheduleDate,
      options,
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
        setDraftPost(
          {
            title: '',
            body: '',
            tags: '',
            timestamp: 0,
          },
          currentAccount.name,
        );
        setTimeout(() => {
          navigation.navigate({
            routeName: ROUTES.SCREENS.DRAFTS,
            key: currentAccount.name,
          });
        }, 3000);
      })
      .catch((err) => {
        this.setState({
          isPostSending: false,
        });
      });
  };

  _initialEditor = () => {
    const {
      currentAccount: { name },
    } = this.props;

    setDraftPost(
      {
        title: '',
        body: '',
        tags: '',
        timestamp: 0,
      },
      name,
    );

    this.setState({
      uploadedImage: null,
    });
  };

  _handleRewardChange = (value) => {
    this.setState({ rewardType: value });
  };

  _handleBeneficiaries = async (value) => {
    this.setState({ beneficiaries: value });
    await AsyncStorage.setItem('temp-beneficiaries', JSON.stringify(value));
  };

  render() {
    const { isLoggedIn, isDarkTheme, navigation, currentAccount } = this.props;
    const {
      autoFocusText,
      draftPost,
      isDraftSaved,
      isDraftSaving,
      isEdit,
      isOpenCamera,
      isPostSending,
      isReply,
      isUploading,
      post,
      uploadedImage,
      community,
      isDraft,
    } = this.state;

    const tags = navigation.state.params && navigation.state.params.tags;

    return (
      <EditorScreen
        autoFocusText={autoFocusText}
        draftPost={draftPost}
        handleRewardChange={this._handleRewardChange}
        handleBeneficiaries={this._handleBeneficiaries}
        handleDatePickerChange={this._handleDatePickerChange}
        handleFormChanged={this._handleFormChanged}
        handleOnBackPress={this._handleOnBackPress}
        handleOnImagePicker={this._handleRoutingAction}
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
        isUploading={isUploading}
        post={post}
        saveCurrentDraft={this._saveCurrentDraft}
        saveDraftToDB={this._saveDraftToDB}
        uploadedImage={uploadedImage}
        tags={tags}
        community={community}
        currentAccount={currentAccount}
        isDraft={isDraft}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  isDefaultFooter: state.account.isDefaultFooter,
  isLoggedIn: state.application.isLoggedIn,
  pinCode: state.application.pin,
});

export default connect(mapStateToProps)(injectIntl(EditorContainer));
