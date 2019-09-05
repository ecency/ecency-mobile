import React from 'react';
import { withNavigation } from 'react-navigation';
import { View, Text, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Components
import { FormInput } from '../formInput';

// Styles
import styles from './profileEditFormStyles';

const ProfileEditFormView = ({ avatarUrl, coverUrl, name, about, location, website }) => (
  <View style={styles.container}>
    <KeyboardAwareScrollView
      enableAutoAutomaticScroll={Platform.OS === 'ios'}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Text>Profile picture URL</Text>
      <FormInput
        wrapperStyle={styles.formStyle}
        isValid
        height={30}
        onChange={value => alert('changed')}
        placeholder="profile picture url"
        isEditable
        type="username"
        isFirstImage
        value="sex"
      />
    </KeyboardAwareScrollView>
  </View>
);

export default withNavigation(ProfileEditFormView);

// placeholder={intl.formatMessage({
//   id: 'login.username',
// })}
