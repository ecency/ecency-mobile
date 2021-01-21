import React from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

import { UserAvatar } from '../../../userAvatar';
import Tag from '../tag/tagView';
import styles from './userListItemStyles';

const UserListItem = ({
  rightText,
  description,
  descriptionStyle,
  username,
  subRightText,
  index,
  isRightColor,
  isHasRightItem,
  isBlackRightColor,
  itemIndex,
  handleOnPress,
  handleOnLongPress,
  isClickable = true,
  text,
  middleText,
  rightTextStyle,
  onPressRightText,
  isFollowing = false,
  isLoadingRightAction = false,
  isLoggedIn,
}) => {
  const _handleSubscribeButtonPress = () => {
    const _data = {};
    _data.following = username;

    onPressRightText(_data, isFollowing);
  };

  return (
    <TouchableOpacity
      onLongPress={() => handleOnLongPress && handleOnLongPress()}
      disabled={!isClickable}
      onPress={() => handleOnPress && handleOnPress(username)}
    >
      <View style={[styles.voteItemWrapper, index % 2 === 1 && styles.voteItemWrapperGray]}>
        {itemIndex && <Text style={styles.itemIndex}>{itemIndex}</Text>}
        <UserAvatar noAction={true} style={styles.avatar} username={username} />
        <View style={styles.userDescription}>
          <Text style={styles.name}>{text || username}</Text>
          {description && <Text style={[styles.date, descriptionStyle]}>{description}</Text>}
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
        {isHasRightItem &&
          isLoggedIn &&
          (isLoadingRightAction ? (
            <View style={styles.rightWrapper}>
              <ActivityIndicator style={{ width: 30 }} />
            </View>
          ) : (
            <TouchableOpacity style={styles.rightWrapper} onPress={_handleSubscribeButtonPress}>
              {isFollowing ? (
                <Tag value="Unfollow" isPostCardTag={false} disabled />
              ) : (
                <>
                  <Text
                    style={[styles.value, isBlackRightColor && styles.valueBlack, rightTextStyle]}
                  >
                    {rightText}
                  </Text>
                  {subRightText && <Text style={styles.text}>{subRightText}</Text>}
                </>
              )}
            </TouchableOpacity>
          ))}
      </View>
    </TouchableOpacity>
  );
};

export default UserListItem;
