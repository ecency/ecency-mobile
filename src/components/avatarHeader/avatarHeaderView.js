import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { UserAvatar } from '../userAvatar';
import { IconButton } from '../iconButton';

// Styles
import styles from './avatarHeaderStyles';

const AvatarHeader = ({
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
            size="xl"
            username={username}
            avatarUrl={avatarUrl}
            isLoading={isUploading}
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

        <View style={styles.textWrapper}>
          {!!name && <Text style={styles.name}>{name}</Text>}
          <Text style={styles.username}>{`@${username} (${reputation})`}</Text>
        </View>
      </View>
    </View>
  );
};
export default AvatarHeader;
