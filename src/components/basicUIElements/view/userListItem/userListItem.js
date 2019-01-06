import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import styles from './userListItemStyles';

const UserListItem = ({
  avatar,
  rightText,
  description,
  username,
  subRightText,
  index,
  isRightColor,
  isHasRightItem,
  handleOnUserPress,
  isBlackRightColor,
  itemIndex,
}) => (
  <View style={[styles.voteItemWrapper, index % 2 !== 0 && styles.voteItemWrapperGray]}>
    {itemIndex && <Text style={styles.itemIndex}>{itemIndex}</Text>}
    <TouchableOpacity onPress={() => handleOnUserPress(username)}>
      <FastImage style={[styles.avatar]} source={{ uri: avatar }} />
    </TouchableOpacity>
    <View style={styles.userDescription}>
      <Text style={styles.name}>{username}</Text>
      {description && <Text style={styles.date}>{description}</Text>}
    </View>
    {isHasRightItem && (
      <View style={styles.rightWrapper}>
        <Text
          style={[
            styles.value,
            isRightColor && styles.valueGray,
            isBlackRightColor && styles.valueBlack,
          ]}
        >
          {rightText}
        </Text>
        {subRightText && <Text style={styles.text}>{subRightText}</Text>}
      </View>
    )}
  </View>
);

export default UserListItem;
