import React, { useRef, useState, useEffect, Fragment } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { injectIntl } from 'react-intl';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription } from '../../postElements';
import { IconButton } from '../../iconButton';
import ProgressiveImage from '../../progressiveImage';
import { OptionsModal } from '../../atoms';

// Styles
import styles from './draftListItemStyles';
import { ScheduledPostStatus } from '../../../providers/ecency/ecency.types';
import { PopoverWrapper } from '../../popoverWrapper/popoverWrapperView';
import getWindowDimensions from '../../../utils/getWindowDimensions';

// Defaults
const DEFAULT_IMAGE =
  'https://images.ecency.com/DQmT8R33geccEjJfzZEdsRHpP3VE8pu3peRCnQa1qukU4KR/no_image_3x.png';

const dim = getWindowDimensions();

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
  id,
  intl,
  isFormatedDate,
  status,
  isSchedules,
}) => {
  const actionSheet = useRef(null);

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
      <View style={styles.container}>
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
            <IconButton
              backgroundColor="transparent"
              name="delete"
              iconType="MaterialIcons"
              size={20}
              onPress={() => actionSheet.current.show()}
              style={[styles.rightItem]}
              color="#c1c5c7"
            />
          </View>
        </View>
        <View style={styles.body}>
          <TouchableOpacity onPress={() => handleOnPressItem(id)}>
            {image !== null && (
              <ProgressiveImage
                source={image}
                thumbnailSource={thumbnail}
                style={[styles.thumbnail, { width: dim.width - 16, height: 300 }]}
              />
            )}
            <View style={[styles.postDescripton]}>
              {title !== '' && <Text style={styles.title}>{title}</Text>}
              {summary !== '' && <Text style={styles.summary}>{summary}</Text>}
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
          }
        }}
      />
    </Fragment>
  );
};

export default injectIntl(DraftListItemView);
