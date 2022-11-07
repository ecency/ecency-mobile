import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import UserAvatar from '../userAvatar';
import styles from './userRibbonStyles';

interface UserRibbonProps {
  username: string;
  containerStyle?: ViewStyle;
}
const UserRibbon = ({ username, containerStyle }: UserRibbonProps) => {
  return (
    <View style={[styles.userContainer, containerStyle]}>
      <UserAvatar username={username} style={styles.avatarStyle} disableSize />
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameText}>{`@${username}`}</Text>
      </View>
    </View>
  );
};

export default UserRibbon;
