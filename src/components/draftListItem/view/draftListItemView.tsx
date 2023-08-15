import React, { useRef, useState, useEffect, Fragment } from 'react';
import { View, Text, TouchableOpacity, Alert, Pressable } from 'react-native';
import { injectIntl } from 'react-intl';

// Utils
import FastImage from 'react-native-fast-image';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription } from '../../postElements';
import { IconButton } from '../../iconButton';
import { OptionsModal } from '../../atoms';

// Styles
import styles from './draftListItemStyles';
import { ScheduledPostStatus } from '../../../providers/ecency/ecency.types';
import { PopoverWrapper } from '../../popoverWrapper/popoverWrapperView';
import ESStyleSheet from 'react-native-extended-stylesheet';

const DraftListItemView = ({
  title,
  summary,
  mainTag,
  username,
  reputation,
  created,
  image,
  thumbnail,
  handleOnPressItem,
  handleOnRemoveItem,
  handleOnMovePress,
  id,
  intl,
  isFormatedDate,
  status,
  isSchedules,
  isDeleting,
  isUnsaved,
  handleOnClonePressed,
  draftItem,
  isCloning,
  handleLongPress,
  isSelected,
  batchSelectionActive,
}) => {
  const actionSheet = useRef(null);
  const moveActionSheet = useRef(null);
  const [deleteRequested, setIsDeleteRequested] = useState(false);
  const [cloneRequested, setIsCloneRequested] = useState(false);

  useEffect(() => {
    if (deleteRequested && !isDeleting) {
      setIsDeleteRequested(false);
    }
  }, [isDeleting]);

  useEffect(() => {
    if (cloneRequested && !isCloning) {
      setIsCloneRequested(false);
    }
  }, [isCloning]);

  const _onItemPress = () => {
    if (isSelected || batchSelectionActive) {
      handleLongPress && handleLongPress(id);
      return;
    }

    if (isSchedules) {
      moveActionSheet.current.show();
      return;
    }

    handleOnPressItem(id);
  };

  const _onItemLongPress = () => {
    handleLongPress && handleLongPress(id);
  };

  // consts
  const scheduleStatus =
    status === ScheduledPostStatus.PENDING
      ? intl.formatMessage({ id: 'schedules.pending' })
      : status === ScheduledPostStatus.POSTPONED
      ? intl.formatMessage({ id: 'schedules.postponed' })
      : status === ScheduledPostStatus.PUBLISHED
      ? intl.formatMessage({ id: 'schedules.published' })
      : intl.formatMessage({ id: 'schedules.error' });
  const statusIcon =
    status === ScheduledPostStatus.PENDING
      ? 'timer'
      : status === ScheduledPostStatus.POSTPONED
      ? 'schedule'
      : status === ScheduledPostStatus.PUBLISHED
      ? 'check-circle'
      : 'error';
  const statusIconColor =
    status === ScheduledPostStatus.PUBLISHED
      ? '#4FD688'
      : status === ScheduledPostStatus.ERROR
      ? '#e63535'
      : '#c1c5c7';

  return (
    <Fragment>
      <Pressable style={[styles.container]} onLongPress={_onItemLongPress} onPress={_onItemPress}>
        <View style={styles.header}>
          <PostHeaderDescription
            date={isFormatedDate ? created : getTimeFromNow(created, true)}
            name={username}
            reputation={reputation}
            size={36}
            tag={mainTag}
          />
          <View style={styles.iconsContainer}>
            {isSchedules && (
              <PopoverWrapper text={scheduleStatus}>
                <IconButton
                  backgroundColor="transparent"
                  name={statusIcon}
                  iconType="MaterialIcons"
                  size={20}
                  onPress={() => actionSheet.current.show()}
                  style={[styles.rightItem]}
                  color={statusIconColor}
                  disabled
                />
              </PopoverWrapper>
            )}
            {!isSchedules && (
              <IconButton
                backgroundColor="transparent"
                name="copy"
                iconType="Ionicons"
                size={16}
                onPress={() => {
                  draftItem = {
                    ...draftItem,
                    title: `Copy of ${draftItem.title}`,
                  };
                  handleOnClonePressed(draftItem);
                  setIsCloneRequested(true);
                }}
                style={[styles.rightItem]}
                color={statusIconColor}
                isLoading={isCloning && cloneRequested}
              />
            )}
            {isUnsaved ? (
              <IconButton
                backgroundColor="transparent"
                name="alert-outline"
                iconType="MaterialCommunityIcons"
                size={20}
                onPress={() =>
                  Alert.alert(
                    intl.formatMessage({ id: 'drafts.unsynced_title' }),
                    intl.formatMessage({ id: 'drafts.unsynced_body' }),
                  )
                }
                style={[styles.rightItem]}
                color={EStyleSheet.value('$primaryBlue')}
                isLoading={isDeleting && deleteRequested}
              />
            ) : (
              <IconButton
                backgroundColor="transparent"
                name="delete"
                iconType="MaterialIcons"
                size={20}
                onPress={
                  isSelected || batchSelectionActive
                    ? _onItemLongPress
                    : () => actionSheet.current.show()
                }
                onLongPress={_onItemLongPress}
                style={[styles.rightItem]}
                color={isSelected ? ESStyleSheet.value('$primaryRed') : '#c1c5c7'}
                isLoading={isDeleting && deleteRequested}
              />
            )}
          </View>
        </View>
        <View style={styles.body}>
          <TouchableOpacity onPress={_onItemPress} onLongPress={_onItemLongPress}>
            {image !== null && (
              <FastImage
                source={image}
                style={styles.thumbnail}
                resizeMode={FastImage.resizeMode.cover}
              />
            )}
            <View style={styles.postDescripton}>
              {title !== '' && <Text style={styles.title}>{title}</Text>}
              {summary !== '' && <Text style={styles.summary}>{summary}</Text>}
            </View>
          </TouchableOpacity>
        </View>
      </Pressable>

      <OptionsModal
        ref={actionSheet}
        options={[
          intl.formatMessage({ id: 'alert.delete' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'alert.remove_alert' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            handleOnRemoveItem(id);
            setIsDeleteRequested(true);
          }
        }}
      />

      <OptionsModal
        ref={moveActionSheet}
        title={intl.formatMessage({
          id: 'alert.move_question',
        })}
        options={[
          intl.formatMessage({
            id: 'alert.move',
          }),
          intl.formatMessage({
            id: 'alert.cancel',
          }),
        ]}
        cancelButtonIndex={1}
        onPress={(index) => {
          if (index === 0) {
            handleOnMovePress(id);
            setIsDeleteRequested(true);
          }
        }}
      />
    </Fragment>
  );
};

export default injectIntl(DraftListItemView);
