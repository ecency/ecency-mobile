import Popover, { PopoverController } from 'react-native-modal-popover';
import React, { Fragment } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import Highlighter from 'react-native-highlight-words';

import EStyleSheet from 'react-native-extended-stylesheet';
import { UserAvatar } from '../../../userAvatar';
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
  searchValue,
  rightTooltipText,
  leftItemRenderer,
  rightItemRenderer,
}) => {
  const _handleRightButtonPress = () => {
    if (onPressRightText) {
      const _data = {};
      _data.following = username;
      onPressRightText();
    }
  };

  return (
    <TouchableOpacity
      onLongPress={() => handleOnLongPress && handleOnLongPress()}
      disabled={!isClickable}
      onPress={() => handleOnPress && handleOnPress(username)}
    >
      <View style={[styles.voteItemWrapper, index % 2 === 1 && styles.voteItemWrapperGray]}>
        {leftItemRenderer && leftItemRenderer()}
        {!!itemIndex && <Text style={styles.itemIndex}>{itemIndex}</Text>}
        <UserAvatar noAction={true} style={styles.avatar} username={username} />
        <View style={styles.userDescription}>
          {!searchValue && <Text style={styles.name}>{text || username}</Text>}
          {!!searchValue && !!text && (
            <Highlighter
              highlightStyle={{
                backgroundColor: EStyleSheet.value('$darkGrayBackground'),
                color: EStyleSheet.value('$white'),
              }}
              searchWords={[searchValue]}
              textToHighlight={text || username}
              style={styles.name}
            />
          )}
          {!!searchValue && !!description && (
            <Highlighter
              highlightStyle={{
                backgroundColor: EStyleSheet.value('$darkGrayBackground'),
                color: EStyleSheet.value('$white'),
              }}
              searchWords={[searchValue]}
              textToHighlight={description}
              style={styles.summary}
              numberOfLines={3}
            />
          )}
          {!!description && !searchValue && (
            <Text style={[styles.date, descriptionStyle]}>{description}</Text>
          )}
        </View>
        {!!middleText && (
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

        {rightItemRenderer && rightItemRenderer()}
        {isHasRightItem &&
          isLoggedIn &&
          (isLoadingRightAction ? (
            <View style={styles.rightWrapper}>
              <ActivityIndicator style={{ width: 30 }} color={EStyleSheet.value('$primaryBlue')} />
            </View>
          ) : (
            <PopoverController>
              {({
                openPopover,
                closePopover,
                popoverVisible,
                setPopoverAnchor,
                popoverAnchorRect,
              }) => (
                <Fragment>
                  <TouchableOpacity
                    ref={setPopoverAnchor}
                    style={styles.rightWrapper}
                    onPress={() => {
                      if (rightTooltipText) {
                        openPopover();
                      }
                      _handleRightButtonPress();
                    }}
                  >
                    <>
                      <Text
                        style={[
                          styles.value,
                          isBlackRightColor && styles.valueBlack,
                          rightTextStyle,
                          isFollowing && styles.unfollowText,
                        ]}
                      >
                        {rightText}
                      </Text>
                      {!!subRightText && <Text style={styles.text}>{subRightText}</Text>}
                    </>
                  </TouchableOpacity>
                  <Popover
                    contentStyle={styles.popoverDetails}
                    arrowStyle={styles.arrow}
                    backgroundStyle={styles.overlay}
                    visible={popoverVisible}
                    onClose={closePopover}
                    fromRect={popoverAnchorRect}
                    supportedOrientations={['portrait', 'landscape']}
                  >
                    <Text style={styles.tooltipText}>{rightTooltipText}</Text>
                  </Popover>
                </Fragment>
              )}
            </PopoverController>
          ))}
      </View>
    </TouchableOpacity>
  );
};

export default UserListItem;
