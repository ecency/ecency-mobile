import React, { Component } from 'react';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';

// Services and Actions
// import { Buffer } from 'buffer';
import { uploadImage } from '../../../providers/esteem/esteem';
import { postContent } from '../../../providers/steem/dsteem';
import { setDraftPost, getDraftPost } from '../../../realm/realm';
import { getDigitPinCode } from '../../../providers/steem/auth';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities
import { generatePermlink } from '../../../utils/editor';
import { decryptKey } from '../../../utils/crypto';
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
      isPostSending: false,
      isDraftSaving: false,
      isDraftSaved: false,
      draftPost: null,
      isCameraOrPickerOpen: false,
      autoFocusText: false,
      uploadedImage: null,
    };
  }

  // Component Life Cycle Functions

  // Component Functions
  componentWillMount() {
    const { currentAccount, navigation } = this.props;
    const username = currentAccount && currentAccount.name ? currentAccount.name : '';
    const routingAction = navigation.state && navigation.state.params;

    // Routing action state ex if coming for video or image or only text
    if (routingAction && routingAction.action) {
      this._handleRoutingAction(routingAction.action);
    } else {
      this.setState({ autoFocusText: true });
    }

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
      width: 1500,
      height: 800,
      cropping: true,
      // writeTempFile: true,
      // includeBase64: true,
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
      width: 300,
      height: 400,
      cropping: true,
      //  includeBase64: true,
    })
      .then((image) => {
        this._handleMediaOnSelected(image);
      })
      .catch((e) => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleMediaOnSelected = (media) => {
    this.setState({ isCameraOrPickerOpen: false }, () => {
      this._uploadImage(media);
    });
    // For new image api
    // const { currentAccount } = this.props;
    // const digitPinCode = await getDigitPinCode();
    // const privateKey = decryptKey(currentAccount.realm_object.postingKey, digitPinCode);
    // const sign = generateSignature(media, privateKey);
    // const data = new Buffer(media.data, 'base64');
  };

  _uploadImage = (media) => {
    const file = {
      uri: media.path,
      type: media.mime,
      name: media.filename,
      size: media.size,
      source: media.sourceURL,
      // data: `data:${media.mime};base64,${media.data}`,
      // base64: media.data,
    };

    uploadImage(file)
      .then((res) => {
        if (res.data) {
          this.setState({ uploadedImage: res.data });
        }
      })
      .catch((error) => {
        alert(error);
      });
  };

  _handleMediaOnSelectFailure = (error) => {
    // const { navigation } = this.props;
    this.setState({ isCameraOrPickerOpen: false });
    // navigation.navigate(ROUTES.SCREENS.HOME);
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
    this.setState({ isPostSending: true });

    const { navigation, currentAccount } = this.props;
    const permlink = generatePermlink(fields.title);
    const digitPinCode = await getDigitPinCode();

    const postingKey = decryptKey(currentAccount.realm_object.postingKey, digitPinCode);

    if (currentAccount) {
      const post = {
        ...fields,
        permlink,
        author: currentAccount.name,
      };

      postContent(post, postingKey)
        .then((result) => {
          alert('Your post succesfully shared');
          navigation.navigate(ROUTES.SCREENS.HOME);
        })
        .catch((error) => {
          alert(`Opps! there is a problem${error}`);
          this.setState({ isPostSending: false });
        });
    }
  };

  _handleSubmit = (form) => {
    this._submitPost(form);
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
      draftPost,
      isDraftSaved,
      isDraftSaving,
      isOpenCamera,
      isCameraOrPickerOpen,
      autoFocusText,
      uploadedImage,
      isPostSending,
    } = this.state;

    return (
      <EditorScreen
        autoFocusText={autoFocusText}
        draftPost={draftPost}
        handleFormChanged={this._handleFormChanged}
        handleOnImagePicker={this._handleOpenImagePicker}
        handleOnSaveButtonPress={this._handleOnSaveButtonPress}
        handleOnSubmit={this._handleSubmit}
        isCameraOrPickerOpen={isCameraOrPickerOpen}
        isDarkTheme={isDarkTheme}
        isDraftSaved={isDraftSaved}
        isPostSending={isPostSending}
        isDraftSaving={isDraftSaving}
        isLoggedIn={isLoggedIn}
        isOpenCamera={isOpenCamera}
        uploadedImage={uploadedImage}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,

  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(EditorContainer);
