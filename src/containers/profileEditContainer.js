import { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import ImagePicker from 'react-native-image-crop-picker';
import get from 'lodash/get';

import { uploadImage } from '../providers/esteem/esteem';
// import ROUTES from '../constants/routeNames';

const FORM_DATA = [
  {
    valueKey: 'name',
    type: 'text',
    label: 'display_name',
    placeholder: '',
  },
  {
    valueKey: 'about',
    type: 'text',
    label: 'about',
    placeholder: '',
  },
  {
    valueKey: 'location',
    type: 'text',
    label: 'location',
    placeholder: '',
  },
  {
    valueKey: 'website',
    type: 'text',
    label: 'website',
    placeholder: '',
  },
];

class ProfileEditContainer extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isUploading: false,
      about: get(props.currentAccount, 'about.profile.about'),
      name: get(props.currentAccount, 'about.profile.name'),
      location: get(props.currentAccount, 'about.profile.location'),
      website: get(props.currentAccount, 'about.profile.website'),
      coverUrl: get(props.currentAccount, 'about.profile.cover_image'),
      avatarUrl: get(props.currentAccount, 'avatar'),
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleOnSave = () => {};

  _handleOnItemChange = (val, item) => {
    console.log(val, item);
  };

  _uploadImage = (media, action) => {
    const { intl } = this.props;
    uploadImage(media)
      .then(res => {
        if (res.data && res.data.url) {
          this.setState({ [action]: res.data.url, isUploading: false });
        }
      })
      .catch(error => {
        if (error) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            error.message || error.toString(),
          );
        }
        this.setState({ isUploading: false });
      });
  };

  _handleMediaAction = (type, uploadAction) => {
    if (type === 'camera') {
      this._handleOpenCamera(uploadAction);
    } else if (type === 'image') {
      this._handleOpenImagePicker(uploadAction);
    }
  };

  _handleOpenImagePicker = action => {
    ImagePicker.openPicker({
      includeBase64: true,
    })
      .then(image => {
        this._handleMediaOnSelected(image, action);
      })
      .catch(e => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleOpenCamera = action => {
    ImagePicker.openCamera({
      includeBase64: true,
    })
      .then(image => {
        this._handleMediaOnSelected(image, action);
      })
      .catch(e => {
        this._handleMediaOnSelectFailure(e);
      });
  };

  _handleMediaOnSelected = (media, action) => {
    this.setState({ isUploading: true }, () => {
      this._uploadImage(media, action);
    });
  };

  _handleMediaOnSelectFailure = error => {
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

  render() {
    const { children, currentAccount, isDarkTheme } = this.props;
    const { isUploading, name, location, website, about, coverUrl, avatarUrl } = this.state;

    return (
      children &&
      children({
        currentAccount,
        isDarkTheme,
        formData: FORM_DATA,
        isUploading,
        handleMediaAction: this._handleMediaAction,
        handleOnItemChange: this._handleOnItemChange,
        name,
        location,
        website,
        about,
        coverUrl,
        avatarUrl,
      })
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(injectIntl(ProfileEditContainer));
