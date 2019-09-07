import React from 'react';
import { withNavigation } from 'react-navigation';
import { View, TouchableOpacity, Image, Text, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { injectIntl } from 'react-intl';

// Images
import LIGHT_COVER_IMAGE from '../../assets/default_cover_image.png';
import DARK_COVER_IMAGE from '../../assets/dark_cover_image.png';

// Components
import { FormInput } from '../formInput';
import { IconButton } from '../iconButton';
// Styles
import styles from './profileEditFormStyles';

const ProfileEditFormView = ({ avatarUrl, coverUrl, isDarkTheme, formData, intl, ...props }) => (
  <View style={styles.container}>
    <IconButton
      iconStyle={styles.saveIcon}
      style={styles.saveButton}
      iconType="MaterialIcons"
      name="save"
      onPress={() => alert('upload')}
      size={30}
    />
    <KeyboardAwareScrollView
      enableAutoAutomaticScroll={Platform.OS === 'ios'}
      contentContainerStyle={{ flexGrow: 1 }}
    >
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

      {formData.map(item => (
        <View style={styles.formItem}>
          <Text style={styles.label}>
            {intl.formatMessage({
              id: `profile.edit.${item.label}`,
            })}
          </Text>
          <FormInput
            wrapperStyle={styles.formStyle}
            isValid
            height={30}
            onChange={value => console.log(value, item.valueKey)}
            placeholder={item.placeholder}
            isEditable
            type={item.type}
            value={props[item.valueKey]}
            inputStyle={styles.input}
          />
        </View>
      ))}
      {/*
      <View style={styles.formItem}>
        <Text style={styles.label}>About</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => console.log('changed')}
          placeholder="About"
          isEditable
          type="text"
          value={about}
          inputStyle={styles.input}
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Location</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => console.log('changed')}
          placeholder="Location"
          isEditable
          type="text"
          value={location}
          inputStyle={styles.input}
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Website</Text>
        <FormInput
          wrapperStyle={styles.formStyle}
          isValid
          height={30}
          onChange={value => console.log('changed')}
          placeholder="Website"
          isEditable
          type="text"
          value={website}
          inputStyle={styles.input}
        />
</View> */}
    </KeyboardAwareScrollView>
  </View>
);

export default injectIntl(withNavigation(ProfileEditFormView));
