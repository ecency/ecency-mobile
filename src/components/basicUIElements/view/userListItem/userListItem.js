import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserAvatar } from '../../../userAvatar';
import styles from './userListItemStyles';

const UserListItem = ({
  rightText,
  description,
  username,
  subRightText,
  index,
  isRightColor,
  isHasRightItem,
  isBlackRightColor,
  itemIndex,
  userCanPress,
  handleOnPress,
  handleOnLongPress,
  isClickable,
  text,
}) => (
  <TouchableOpacity
    onLongPress={() => handleOnLongPress && handleOnLongPress()}
    disabled={!isClickable}
    onPress={() => handleOnPress && handleOnPress()}
  >
    <View style={[styles.voteItemWrapper, index % 2 !== 0 && styles.voteItemWrapperGray]}>
      {itemIndex && <Text style={styles.itemIndex}>{itemIndex}</Text>}
      <UserAvatar noAction={userCanPress} style={styles.avatar} username={username} />
      <View style={styles.userDescription}>
        <Text style={styles.name}>{text || username}</Text>
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
  </TouchableOpacity>
);

export default UserListItem;
