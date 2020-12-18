import React, { useState } from 'react';
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
  userCanPress = false,
  handleOnPress,
  handleOnLongPress,
  isClickable = true,
  text,
  middleText,
  rightTextStyle,
  onPressRightText,
  isFollowing,
  handleFollowUserButtonPress,
}) => {
  const [following, setFollowing] = useState(isFollowing);

  const _handleSubscribeButtonPress = () => {
    const _data = {};
    _data.following = username;

    handleFollowUserButtonPress({ _data, isFollowing }).then(() => {
      setFollowing(!following);
    });
  };

  return (
    <TouchableOpacity
      onLongPress={() => handleOnLongPress && handleOnLongPress()}
      disabled={!isClickable}
      onPress={() => handleOnPress && handleOnPress()}
    >
      <View style={[styles.voteItemWrapper, index % 2 === 1 && styles.voteItemWrapperGray]}>
        {itemIndex && <Text style={styles.itemIndex}>{itemIndex}</Text>}
        <UserAvatar noAction={userCanPress} style={styles.avatar} username={username} />
        <View style={styles.userDescription}>
          <Text style={styles.name}>{text || username}</Text>
          {description && <Text style={styles.date}>{description}</Text>}
        </View>
        {middleText && (
          <View style={styles.middleWrapper}>
            <Text
              style={[
                styles.value,
                isRightColor && styles.valueGray,
                isBlackRightColor && styles.valueBlack,
              ]}
            >
              {middleText}
            </Text>
          </View>
        )}
        {isHasRightItem && (
          <TouchableOpacity style={styles.rightWrapper} onPress={_handleSubscribeButtonPress}>
            <Text
              style={[
                styles.value,
                isRightColor && styles.valueGray,
                isBlackRightColor && styles.valueBlack,
                rightTextStyle,
              ]}
              onPress={onPressRightText}
            >
              {rightText}
            </Text>
            {subRightText && <Text style={styles.text}>{subRightText}</Text>}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default UserListItem;
