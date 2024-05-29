import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { UserAvatar } from '../userAvatar';
import { IconButton } from '../iconButton';
// Styles
import styles from './editAvatarStyles';

const EditAvatar = ({ username, avatarUrl, showImageUploadActions, isUploading }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.wrapper}>
        <TouchableOpacity disabled={isUploading} onPress={showImageUploadActions}>
          <UserAvatar
            key={`${avatarUrl}-${username}`}
            noAction
            size="xxl"
            username={username}
            avatarUrl={avatarUrl}
          />
          <IconButton
            isLoading={isUploading}
            color="white"
            iconStyle={styles.addIcon}
            style={styles.addButton}
            iconType="MaterialIcons"
            name="edit"
            onPress={showImageUploadActions}
            size={18}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default EditAvatar;
