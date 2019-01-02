import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

// Services and Actions
// import { Buffer } from 'buffer';
import { uploadImage } from '../../../providers/esteem/esteem';
import { postContent } from '../../../providers/steem/dsteem';
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
      draftPost: null,
      isCameraOrPickerOpen: false,
      isDraftSaved: false,
      isDraftSaving: false,
      isPostSending: false,
      isReply: false,
      isUploading: false,
      post: null,
      uploadedImage: null,
    };
  }

  // Component Life Cycle Functions

  componentWillMount() {
    const { currentAccount, navigation } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';
    let isReply;
    let post;

    if (navigation.state && navigation.state.params) {
      const navigationParams = navigation.state.params;

      if (navigationParams.isReply) {
        isReply = navigationParams.isReply;
        post = navigationParams.post;
        this.setState({ isReply, post });
      }

      if (navigationParams.action) {
        this._handleRoutingAction(navigationParams.action);
      }
    } else {
      this.setState({ autoFocusText: true });
    }

    if (!isReply) {
      getDraftPost(username)
        .then((result) => {
          this.setState({
            draftPost: { body: result.body, title: result.title, tags: result.tags.split(',') },
          });
        })
        .catch((error) => {
          // alert(error);
        });
    }
  }

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
      // width: 300,
      // height: 400,
      // cropping: true,
      // writeTempFile: true,
      includeBase64: true,
      // multiple: true,
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
      // width: 300,
      // height: 400,
      // cropping: true,
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
        alert(error);
        this.setState({ isUploading: false });
      });
  };

  _handleMediaOnSelectFailure = (error) => {
    this.setState({ isCameraOrPickerOpen: false });

    if (error.code === 'E_PERMISSION_MISSING') {
      Alert.alert(
        'Permission Denied',
        'Please, go to phone Settings and change eSteem app permissions.',
      );
    }
  };

  // Media select functions <- END ->

  _handleOnSaveButtonPress = (fields) => {
    const { isDraftSaved } = this.state;
    if (!isDraftSaved) {
      const { currentAccount } = this.props;
      const username = currentAccount && currentAccount.name ? currentAccount.name : '';

      this.setState({ isDraftSaving: true });
      const draftField = {
        ...fields,
        tags: fields.tags.toString(),
      };

      setDraftPost(draftField, username)
        .then(() => {
          this.setState({
            isDraftSaving: false,
            isDraftSaved: true,
          });
        })
        .catch((error) => {
          alert(error);
        });
    }
  };

  _submitPost = async (fields) => {
    const { navigation, currentAccount, pinCode } = this.props;

    if (currentAccount) {
      this.setState({ isPostSending: true });

      const meta = extractMetadata(fields.body);
      const jsonMeta = makeJsonMetadata(meta, fields.tags);
      //TODO: check if permlink is available github: #314 https://github.com/esteemapp/esteem-mobile/pull/314
      const permlink = generatePermlink(fields.title);
      const author = currentAccount.name;
      const options = makeOptions(author, permlink);
      const parentPermlink = fields.tags[0];

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
        .then((result) => {
          Alert.alert('Success!', 'Your post succesfully shared');
          navigation.goBack();
        })
        .catch((error) => {
          this._handleSubmitFailure(error);
        });
    }
  };

  _submitReply = async (fields) => {
    const { currentAccount, pinCode } = this.props;

    if (currentAccount) {
      this.setState({ isPostSending: true });

      const { post } = this.state;

      const jsonMeta = makeJsonMetadataReply(post.json_metadata.tags || ['esteem']);
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
        fields.title || '',
        fields.body,
        jsonMeta,
        options,
        0,
      )
        .then((result) => {
          this._handleReplySuccess();
        })
        .catch((error) => {
          this._handleSubmitFailure(error);
        });
    }
  };

  _handleSubmitFailure = (error) => {
    Alert.alert('Fail!', `Opps! there is a problem${error}`);
    this.setState({ isPostSending: false });
  };

  _handleReplySuccess = () => {
    const { navigation } = this.props;

    navigation.goBack();
    navigation.state.params.fetchPost();
  };

  _handleSubmit = (form) => {
    const { isReply } = this.state;

    if (isReply) {
      this._submitReply(form.fields);
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

  render() {
    const { isLoggedIn, isDarkTheme } = this.props;
    const {
      autoFocusText,
      draftPost,
      isCameraOrPickerOpen,
      isDraftSaved,
      isDraftSaving,
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
        handleFormChanged={this._handleFormChanged}
        handleOnImagePicker={this._handleRoutingAction}
        handleOnSaveButtonPress={this._handleOnSaveButtonPress}
        handleOnSubmit={this._handleSubmit}
        isCameraOrPickerOpen={isCameraOrPickerOpen}
        isDarkTheme={isDarkTheme}
        isDraftSaved={isDraftSaved}
        isDraftSaving={isDraftSaving}
        isLoggedIn={isLoggedIn}
        isOpenCamera={isOpenCamera}
        isPostSending={isPostSending}
        isReply={isReply}
        isUploading={isUploading}
        post={post}
        uploadedImage={uploadedImage}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  pinCode: state.account.pin,
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(EditorContainer);
