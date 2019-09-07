import React from 'react';
import { withNavigation } from 'react-navigation';
import { View, TouchableOpacity, Image, Text, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Images
import LIGHT_COVER_IMAGE from '../../assets/default_cover_image.png';
import DARK_COVER_IMAGE from '../../assets/dark_cover_image.png';

// Components
import { FormInput } from '../formInput';
import { IconButton } from '../iconButton';
// Styles
import styles from './profileEditFormStyles';

const ProfileEditFormView = ({
  avatarUrl,
  coverUrl,
  name,
  about,
  location,
  website,
  isDarkTheme,
}) => (
  <View style={styles.container}>
    <KeyboardAwareScrollView
      enableAutoAutomaticScroll={Platform.OS === 'ios'}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.formItem}>
        <Text style={styles.label}>Profile picture URL</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => alert('changed')}
          placeholder="profile picture url"
          isEditable
          type="text"
          value={avatarUrl}
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Cover image URL</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => alert('changed')}
          placeholder="Cover image URL"
          isEditable
          type="text"
          value={coverUrl}
        />
      </View>

      <TouchableOpacity style={styles.coverImgWrapper} onPress={() => alert('upload')}>
        <Image
          style={styles.coverImg}
          source={{ uri: `https://steemitimages.com/400x0/${coverUrl}` }}
          defaultSource={isDarkTheme ? DARK_COVER_IMAGE : LIGHT_COVER_IMAGE}
        />

        <IconButton
          iconStyle={styles.addIcon}
          style={styles.addButton}
          iconType="MaterialCommunityIcons"
          name="plus"
          onPress={() => alert('upload')}
          size={15}
        />
      </TouchableOpacity>

      <View style={styles.formItem}>
        <Text style={styles.label}>Display Name</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => alert('changed')}
          placeholder="Display name"
          isEditable
          type="text"
          value={name}
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>About</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => alert('changed')}
          placeholder="About"
          isEditable
          type="text"
          value={about}
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Location</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => alert('changed')}
          placeholder="Location"
          isEditable
          type="text"
          value={location}
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Website</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => alert('changed')}
          placeholder="Website"
          isEditable
          type="text"
          value={website}
        />
      </View>
    </KeyboardAwareScrollView>
  </View>
);

export default withNavigation(ProfileEditFormView);

// placeholder={intl.formatMessage({
//   id: 'login.username',
// })}
