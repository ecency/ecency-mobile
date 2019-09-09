import { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import ImagePicker from 'react-native-image-crop-picker';
import get from 'lodash/get';
import { withNavigation } from 'react-navigation';

import { uploadImage } from '../providers/esteem/esteem';

import { profileUpdate } from '../providers/steem/dsteem';
import { updateCurrentAccount } from '../redux/actions/accountAction';

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
      isLoading: false,
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
    this.setState({ [item]: val });
  };

  _uploadImage = (media, action) => {
    const { intl } = this.props;

    this.setState({ isLoading: true });
    uploadImage(media)
      .then(res => {
        if (res.data && res.data.url) {
          this.setState({ [action]: res.data.url, isLoading: false });
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
        this.setState({ isLoading: false });
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
    this.setState({ isLoading: true }, () => {
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

  _handleOnSubmit = async () => {
    const { currentAccount, pinCode, dispatch, navigation } = this.props;
    const { name, location, website, about, coverUrl, avatarUrl } = this.state;

    await this.setState({ isLoading: true });

    const params = {
      profile_image: avatarUrl,
      cover_image: coverUrl,
      name,
      website,
      about,
      location,
    };

    await profileUpdate(params, pinCode, currentAccount)
      .then(async () => {
        const _currentAccount = { ...currentAccount, display_name: name, avatar: avatarUrl };
        _currentAccount.about.profile = { ...params };

        dispatch(updateCurrentAccount(_currentAccount));

        navigation.state.params.fetchUser();
        navigation.goBack();
      })
      .catch(error => {
        Alert.alert(get(error, 'message'));
      });

    this.setState({ isLoading: false });
  };

  render() {
    const { children, currentAccount, isDarkTheme } = this.props;
    const { isLoading, name, location, website, about, coverUrl, avatarUrl } = this.state;

    return (
      children &&
      children({
        about,
        avatarUrl,
        coverUrl,
        currentAccount,
        formData: FORM_DATA,
        handleMediaAction: this._handleMediaAction,
        handleOnItemChange: this._handleOnItemChange,
        handleOnSubmit: this._handleOnSubmit,
        isDarkTheme,
        isLoading,
        location,
        name,
        website,
      })
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  isDarkTheme: state.application.isDarkTheme,
  pinCode: state.application.pin,
});

export default connect(mapStateToProps)(injectIntl(withNavigation(ProfileEditContainer)));
