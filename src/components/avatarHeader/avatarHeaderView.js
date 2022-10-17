import React from 'react';
import { withNavigation } from '@react-navigation/compat';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { UserAvatar } from '../userAvatar';
import { IconButton } from '../iconButton';

// Styles
import styles from './avatarHeaderStyles';

const AvatarHeader = ({
  username,
  name,
  reputation,
  navigation,
  avatarUrl,
  showImageUploadActions,
  isUploading,
}) => (
  <LinearGradient
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    colors={['#357ce6', '#2d5aa0']}
    style={styles.headerView}
  >
    <SafeAreaView>
      <View style={styles.headerContainer}>
        <IconButton
          iconStyle={styles.backIcon}
          iconType="MaterialIcons"
          name="arrow-back"
          onPress={navigation.goBack}
          size={25}
        />
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
    </SafeAreaView>
  </LinearGradient>
);

export default withNavigation(AvatarHeader);
