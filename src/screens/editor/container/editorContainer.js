import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Alert, AsyncStorage } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import get from 'lodash/get';

// Services and Actions
import { Buffer } from 'buffer';
import {
  uploadImage,
  addDraft,
  updateDraft,
  schedule,
} from '../../../providers/esteem/esteem';
import { toastNotification } from '../../../redux/actions/uiAction';
import { postContent, getPurePost } from '../../../providers/steem/dsteem';
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
  constructor(props) {
    super(props);
    this.state = {
      autoFocusText: false,
      draftId: null,
      draftPost: null,
      isCameraOrPickerOpen: false,
      isDraftSaved: false,
      isDraftSaving: false,
      isEdit: false,
      isPostSending: false,
      isReply: false,
      isUploading: false,
      post: null,
      uploadedImage: null,
      isDraft: false,
    };
  }

  // Component Life Cycle Functions

  componentWillMount() {
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
          draftPost: {
            title: _draft.title,
            body: _draft.body,
            tags: _draft.tags.includes(' ') ? _draft.tags.split(' ') : _draft.tags.split(','),
          },
          draftId: _draft._id,
          isDraft: true,
        });
      }

      if (navigationParams.post) {
        ({ post } = navigationParams);
        this.setState({ post });
      }

      if (navigationParams.isReply) {
        ({ isReply } = navigationParams);
        this.setState({ isReply });
      }

      if (navigationParams.isEdit) {
        ({ isEdit } = navigationParams);
        this.setState({
          isEdit,
          draftPost: {
            title: post.title,
            body: post.markdownBody,
            tags: post.json_metadata.tags,
          },
        });
      }

      if (navigationParams.action) {
        this._handleRoutingAction(navigationParams.action);
      }
    } else {
      this.setState({ autoFocusText: true });
    }

    if (!isEdit && !_draft) {
      this._getDraft(username, isReply);
    }
  }

  _getDraft = async (username, isReply) => {
    if (isReply) {
      const draftReply = await AsyncStorage.getItem('temp-reply');

      if (draftReply) {
        this.setState({
          draftPost: { body: draftReply },
        });
      }
    } else {
      await getDraftPost(username)
        .then((result) => {
          this.setState({
            draftPost: {
              body: result.body,
              title: result.title,
              tags: result.tags.split(','),
            },
          });
        });
    }
  };

  _handleRoutingAction = (routingAction) => {
    this.setState({ isCameraOrPickerOpen: true });

    if (routingAction === 'camera') {
      this._handleOpenCamera();
    } else if (routingAction === 'image') {
      this._handleOpenImagePicker();
    }
  };

  // Media select functions <- START ->

  _handleOpenImagePicker = () => {
    ImagePicker.openPicker({
      includeBase64: true,
    })
      .then((image) => {
        this._handleMediaOnSelected(image);
      })
      .catch((e) => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleOpenCamera = () => {
    ImagePicker.openCamera({
      includeBase64: true,
    })
      .then((image) => {
        this._handleMediaOnSelected(image);
      })
      .catch((e) => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleMediaOnSelected = (media) => {
    this.setState({ isCameraOrPickerOpen: false, isUploading: true }, () => {
      this._uploadImage(media);
    });
    // For new image api
    // const { currentAccount } = this.props;
    // const digitPinCode = await getPinCode();
    // const privateKey = decryptKey(currentAccount.local.postingKey, digitPinCode);
    // const sign = generateSignature(media, privateKey);
    // const data = new Buffer(media.data, 'base64');
  };

  _uploadImage = (media) => {
    const { intl } = this.props;

    const file = {
      uri: media.path,
      type: media.mime,
      name: media.filename || `IMG_${Math.random()}.JPG`,
      size: media.size,
    };

    uploadImage(file)
      .then((res) => {
        if (res.data && res.data.url) {
          this.setState({ uploadedImage: res.data, isUploading: false });
        }
      })
      .catch((error) => {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.fail',
          }),
          error,
        );
        this.setState({ isUploading: false });
      });
  };

  _handleMediaOnSelectFailure = (error) => {
    const { intl } = this.props;
    this.setState({ isCameraOrPickerOpen: false });

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

  _saveDraftToDB = (fields) => {
    const { isDraftSaved, draftId } = this.state;

    if (!isDraftSaved) {
      const { currentAccount } = this.props;
      const username = get(currentAccount, 'name', '');
      let draftField;

      this.setState({ isDraftSaving: true });
      if (fields) {
        draftField = {
          ...fields,
          tags: fields.tags.join(' '),
          username,
        };
      }

      if (draftId && draftField) {
        updateDraft({ ...draftField, draftId }).then(() => {
          this.setState({
            isDraftSaved: true,
          });
        });
      } else if (draftField) {
        addDraft(draftField).then((response) => {
          this.setState({
            isDraftSaved: true,
            draftId: response._id,
          });
        });
      }

      this.setState({
        isDraftSaving: false,
        isDraftSaved,
      });
    }
  };

  _saveCurrentDraft = async (fields) => {
    const { draftId, isReply, isEdit } = this.state;

    if (!draftId && !isEdit) {
      const { currentAccount } = this.props;
      const username = currentAccount && currentAccount.name ? currentAccount.name : '';

      const draftField = {
        ...fields,
        tags:
          fields.tags && fields.tags.length > 0 ? fields.tags.toString() : '',
      };

      if (isReply && draftField.body) {
        await AsyncStorage.setItem('temp-reply', draftField.body);
      } else {
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

    if (currentAccount) {
      this.setState({ isPostSending: true });

      const meta = extractMetadata(fields.body);
      const jsonMeta = makeJsonMetadata(meta, fields.tags);
      // TODO: check if permlink is available github: #314 https://github.com/esteemapp/esteem-mobile/pull/314
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
      const options = makeOptions(author, permlink);
      const parentPermlink = fields.tags[0];

      if (scheduleDate) {
        await this._setScheduledPost({
          author,
          permlink,
          fields,
          scheduleDate,
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
          0,
        )
          .then(() => {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.success_shared',
                }),
              ),
            );

            navigation.navigate({
              routeName: ROUTES.SCREENS.POST,
              params: {
                author: get(currentAccount, 'name'),
                permlink,
                isNewPost: true,
              },
              key: permlink,
            });

            setDraftPost(
              { title: '', body: '', tags: '' },
              currentAccount.name,
            );
          })
          .catch((error) => {
            this._handleSubmitFailure(error);
          });
      }
    }
  };

  _submitReply = async (fields) => {
    const { currentAccount, pinCode } = this.props;

    if (currentAccount) {
      this.setState({ isPostSending: true });

      const { post } = this.state;

      const jsonMeta = makeJsonMetadataReply(
        post.json_metadata.tags || ['esteem'],
      );
      const permlink = generateReplyPermlink(post.author);
      const author = currentAccount.name;
      const options = makeOptions(author, permlink);
      const parentAuthor = post.author;
      const parentPermlink = post.permlink;

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
        0,
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
    const { post } = this.state;
    if (currentAccount) {
      this.setState({ isPostSending: true });

      const {
        body: oldBody,
        parent_permlink: parentPermlink,
        permlink,
        parent_author: parentAuthor,
        json_metadata: oldMeta,
      } = post;

      let newBody = fields.body;
      let _oldMeta = oldMeta;
      const patch = createPatch(oldBody, newBody.trim());

      if (patch && patch.length < Buffer.from(oldBody, 'utf-8').length) {
        newBody = patch;
      }

      if (typeof _oldMeta === 'string') {
        _oldMeta = JSON.parse(_oldMeta);
      }

      const meta = extractMetadata(fields.body);
      const metadata = Object.assign({}, _oldMeta, meta);
      const jsonMeta = makeJsonMetadata(metadata, fields.tags);

      await postContent(
        currentAccount,
        pinCode,
        parentAuthor || '',
        parentPermlink,
        permlink,
        fields.title,
        newBody,
        jsonMeta,
      )
        .then(() => {
          this._handleSubmitSuccess();
        })
        .catch((error) => {
          this._handleSubmitFailure(error);
        });
    }
  };

  _handleSubmitFailure = (error) => {
    const { intl } = this.props;

    Alert.alert(
      intl.formatMessage({
        id: 'alert.fail',
      }),
      error.message || error.toString(),
    );
    this.setState({ isPostSending: false });
  };

  _handleSubmitSuccess = () => {
    const { navigation } = this.props;

    if (navigation) {
      navigation.goBack();
      navigation.state.params.fetchPost();
    }
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

    if (isReply && !isEdit) {
      this._submitReply(form.fields);
    } else if (isEdit) {
      this._submitEdit(form.fields);
    } else {
      this._submitPost(form.fields);
    }
  };

  _handleFormChanged = () => {
    const { isDraftSaved } = this.state;

    if (isDraftSaved) {
      this.setState({ isDraftSaved: false });
    }
  };

  _handleDatePickerChange = (datePickerValue, fields) => {
    this._submitPost(fields, datePickerValue);
  };

  _setScheduledPost = (data) => {
    const { dispatch, intl } = this.props;

    schedule(
      data.author,
      data.fields.title,
      data.permlink,
      '',
      data.fields.tags,
      data.fields.body,
      '',
      '',
      data.scheduleDate,
    ).then(() => {
      this.setState({ isPostSending: false });
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.success',
          }),
        ),
      );
    }).catch(() => {
      this.setState({ isPostSending: false });
    });
  }

  _initialEditor = () => {
    const { currentAccount: { name } } = this.props;

    setDraftPost(
      { title: '', body: '', tags: '' },
      name,
    );

    this.setState({ uploadedImage: null });
  }

  render() {
    const { isLoggedIn, isDarkTheme } = this.props;
    const {
      autoFocusText,
      draftPost,
      isCameraOrPickerOpen,
      isDraftSaved,
      isDraftSaving,
      isEdit,
      isOpenCamera,
      isPostSending,
      isReply,
      isUploading,
      post,
      uploadedImage,
    } = this.state;

    return (
      <EditorScreen
        autoFocusText={autoFocusText}
        draftPost={draftPost}
        handleDatePickerChange={this._handleDatePickerChange}
        handleFormChanged={this._handleFormChanged}
        handleOnBackPress={this._handleOnBackPress}
        handleOnImagePicker={this._handleRoutingAction}
        handleOnSubmit={this._handleSubmit}
        initialEditor={this._initialEditor}
        isCameraOrPickerOpen={isCameraOrPickerOpen}
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
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  isDefaultFooter: state.account.isDefaultFooter,
  isLoggedIn: state.application.isLoggedIn,
  pinCode: state.account.pin,
});

export default connect(mapStateToProps)(injectIntl(EditorContainer));
