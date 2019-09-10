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

const ProfileEditFormView = ({
  avatarUrl,
  coverUrl,
  formData,
  handleOnItemChange,
  handleOnSubmit,
  intl,
  isDarkTheme,
  isLoading,
  showImageUploadActions,
  ...props
}) => (
  <View style={styles.container}>
    <IconButton
      iconStyle={styles.saveIcon}
      style={styles.saveButton}
      iconType="MaterialIcons"
      name="save"
      onPress={handleOnSubmit}
      size={30}
      isLoading={isLoading}
    />
    <KeyboardAwareScrollView
      enableAutoAutomaticScroll={Platform.OS === 'ios'}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <TouchableOpacity style={styles.coverImgWrapper} onPress={showImageUploadActions}>
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
          onPress={showImageUploadActions}
          size={15}
        />
      </TouchableOpacity>

      {formData.map(item => (
        <View style={styles.formItem} key={item.valueKey}>
          <Text style={styles.label}>
            {intl.formatMessage({
              id: `profile.edit.${item.label}`,
            })}
          </Text>
          <FormInput
            wrapperStyle={styles.formStyle}
            isValid
            height={30}
            onChange={value => handleOnItemChange(value, item.valueKey)}
            placeholder={item.placeholder}
            isEditable
            type="none"
            value={props[item.valueKey]}
            inputStyle={styles.input}
          />
        </View>
      ))}
    </KeyboardAwareScrollView>
  </View>
);

export default injectIntl(withNavigation(ProfileEditFormView));
