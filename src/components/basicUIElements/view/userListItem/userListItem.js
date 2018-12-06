import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import styles from './userListItemStyles';

const UserListItem = ({
  avatar,
  reputation,
  rightText,
  description,
  username,
  subRightText,
  index,
  isRightColor,
  isHasRightItem,
  handleOnUserPress,
}) => (
  <View style={[styles.voteItemWrapper, index % 2 !== 0 && styles.voteItemWrapperGray]}>
    <TouchableOpacity onPress={() => handleOnUserPress(username)}>
      <FastImage style={[styles.avatar]} source={{ uri: avatar }} />
    </TouchableOpacity>
    <View style={styles.userDescription}>
      <Text style={styles.name}>
        {username}
        {reputation && (
        <Text style={styles.reputation}>
          {' '}
          {reputation}
        </Text>
        )}
      </Text>
      {description && <Text style={styles.date}>{description}</Text>}
    </View>
    {isHasRightItem && (
      <View style={styles.rightWrapper}>
        <Text style={[styles.value, isRightColor && styles.valueGray]}>{rightText}</Text>
        <Text style={styles.text}>{subRightText}</Text>
      </View>
    )}
  </View>
);

export default UserListItem;
