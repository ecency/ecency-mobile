import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import Animated, { BounceInRight } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { injectIntl, useIntl } from 'react-intl';

// Images
import { Image as ExpoImage } from 'expo-image';
import LIGHT_COVER_IMAGE from '../../assets/default_cover_image.png';
import DARK_COVER_IMAGE from '../../assets/dark_cover_image.png';

// Components
import { FormInput } from '../formInput';
import { IconButton } from '../iconButton';

// Utils
import { getResizedImage } from '../../utils/image';

// Styles
import styles from './profileEditFormStyles';
import { MainButton } from '../mainButton';

interface ProfileEditFormProps {
  coverUrl: string;
  formData: any;
  handleOnItemChange: () => void;
  handleOnSubmit: ({ goBack }: { goBack: boolean }) => void;
  intl: any;
  isDarkTheme: boolean;
  isLoading: boolean;
  isUploading: boolean;
  showImageUploadActions: boolean;
  saveEnabled: boolean;
}

const ProfileEditFormView = ({
  coverUrl,
  formData,
  handleOnItemChange,
  handleOnSubmit,
  isDarkTheme,
  isLoading,
  isUploading,
  showImageUploadActions,
  saveEnabled,
  ...props
}: ProfileEditFormProps) => {
  const intl = useIntl();

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        enableAutoAutomaticScroll={Platform.OS === 'ios'}
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid={true}
      >
        <View style={styles.formItem}>
          <Text style={styles.imgLabel}>
            {intl.formatMessage({
              id: 'profile.edit.cover_img',
            })}
          </Text>
          <TouchableOpacity
            disabled={isUploading}
            style={styles.coverImgWrapper}
            onPress={showImageUploadActions}
          >
            <ExpoImage
              style={styles.coverImg}
              source={
                coverUrl
                  ? { uri: getResizedImage(coverUrl, 600) }
                  : isDarkTheme
                  ? DARK_COVER_IMAGE
                  : LIGHT_COVER_IMAGE
              }
            />
            <IconButton
              color="white"
              isLoading={isUploading}
              iconStyle={styles.addIcon}
              style={styles.addButton}
              onPress={showImageUploadActions}
              iconType="MaterialIcons"
              name="edit"
              size={18}
            />
          </TouchableOpacity>
        </View>
        {formData.map((item) => (
          <View style={styles.formItem} key={item.valueKey}>
            <Text style={styles.label}>
              {intl.formatMessage({
                id: `profile.edit.${item.label}`,
              })}
            </Text>
            <FormInput
              wrapperStyle={styles.formStyle}
              isValid
              height={40}
              onChange={(value) => handleOnItemChange(value, item.valueKey)}
              placeholder={item.placeholder}
              isEditable
              type="none"
              value={props[item.valueKey]}
              inputStyle={styles.input}
            />
          </View>
        ))}
      </KeyboardAwareScrollView>

      {saveEnabled && (
        <Animated.View style={styles.floatingContainer} entering={BounceInRight}>
          <MainButton
            style={{ width: isLoading ? null : 120, marginBottom: 24, alignSelf: 'flex-end' }}
            onPress={() => handleOnSubmit({ goBack: true })}
            iconName="save"
            iconType="MaterialIcons"
            iconColor="white"
            text="SAVE"
            isLoading={isLoading}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default injectIntl(ProfileEditFormView);
