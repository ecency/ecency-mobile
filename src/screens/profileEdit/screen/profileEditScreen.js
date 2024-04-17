import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { ProfileEditContainer } from '../../../containers';

import { EditAvatar, ProfileEditForm } from '../../../components/index';
import { OptionsModal } from '../../../components/atoms';
import styles from './profileEditScreenStyles';
import { BasicHeader } from '../../../components/index';

class ProfileEditScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      selectedUploadAction: '',
    };

    this.galleryRef = React.createRef();
  }

  // Component Life Cycles

  // Component Functions
  _showImageUploadActions = (action) => {
    this.setState({ selectedUploadAction: action }, () => {
      this.galleryRef.current.show();
    });
  };

  render() {
    const { intl, route } = this.props;
    const { selectedUploadAction } = this.state;

    return (
      <ProfileEditContainer route={route}>
        {({
          currentAccount,
          isDarkTheme,
          formData,
          handleOnItemChange,
          handleMediaAction,
          name,
          location,
          website,
          about,
          avatarUrl,
          coverUrl,
          isLoading,
          isUploading,
          saveEnabled,
          handleOnSubmit,
        }) => (
          <View style={styles.container}>
            <BasicHeader title={intl.formatMessage({ id: 'profile.edit.edit_profile' })} />
            <EditAvatar
              username={get(currentAccount, 'name')}
              name={name}
              reputation={get(currentAccount, 'reputation')}
              avatarUrl={avatarUrl}
              showImageUploadActions={() => this._showImageUploadActions('avatarUrl')}
              isUploading={isUploading && selectedUploadAction === 'avatarUrl'}
            />
            <ProfileEditForm
              formData={formData}
              isDarkTheme={isDarkTheme}
              about={about}
              name={name}
              location={location}
              website={website}
              coverUrl={coverUrl}
              showImageUploadActions={() => this._showImageUploadActions('coverUrl')}
              handleOnItemChange={handleOnItemChange}
              isLoading={isLoading}
              isUploading={isUploading && selectedUploadAction === 'coverUrl'}
              saveEnabled={saveEnabled}
              handleOnSubmit={handleOnSubmit}
            />

            <OptionsModal
              ref={this.galleryRef}
              options={[
                intl.formatMessage({
                  id: 'editor.open_gallery',
                }),
                intl.formatMessage({
                  id: 'editor.capture_photo',
                }),
                intl.formatMessage({
                  id: 'alert.cancel',
                }),
              ]}
              cancelButtonIndex={2}
              onPress={(index) => {
                handleMediaAction(
                  index === 0 ? 'image' : index === 1 && 'camera',
                  selectedUploadAction,
                );
              }}
            />
          </View>
        )}
      </ProfileEditContainer>
    );
  }
}

export default gestureHandlerRootHOC(injectIntl(ProfileEditScreen));
