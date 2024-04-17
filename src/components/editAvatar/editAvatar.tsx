import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { UserAvatar } from '../userAvatar';
import { IconButton } from '../iconButton';

// Styles
import styles from './editAvatarStyles';

const EditAvatar = ({
  username,
  name,
  reputation,
  avatarUrl,
  showImageUploadActions,
  isUploading,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.wrapper}>
        <TouchableOpacity onPress={showImageUploadActions}>
          <UserAvatar
            key={`${avatarUrl}-${username}`}
            noAction
            size="xxl"
            username={username}
            avatarUrl={avatarUrl}
            isLoading={isUploading}
          />
          <IconButton
            iconStyle={styles.addIcon}
            style={styles.addButton}
            iconType="MaterialIcons"
            name="edit"
            onPress={showImageUploadActions}
            size={18}
          />
        </TouchableOpacity>

        <View style={styles.textWrapper}>
          {!!name && <Text style={styles.name}>{name}</Text>}
          <Text style={styles.username}>{`@${username} (${reputation})`}</Text>
        </View>
      </View>
    </View>
  );
};
export default EditAvatar;
