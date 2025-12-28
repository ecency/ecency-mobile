import React, { useState, Fragment, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import get from 'lodash/get';

// Constants
import { Image as ExpoImage } from 'expo-image';
import EStyleSheet from 'react-native-extended-stylesheet';
import { proxifyImageSrc } from '@ecency/render-helper';
import { ScrollView } from 'react-native-gesture-handler';
import LIGHT_COVER_IMAGE from '../../../assets/default_cover_image.png';
import DARK_COVER_IMAGE from '../../../assets/dark_cover_image.png';

// Components
import { TextWithIcon } from '../../basicUIElements';
import { PercentBar } from '../../percentBar';
import { DropdownButton } from '../../dropdownButton';

// Utils
import { makeCountFriendly } from '../../../utils/formatter';

// Styles
import styles from './profileSummaryStyles';
import getWindowDimensions from '../../../utils/getWindowDimensions';

const DEVICE_WIDTH = getWindowDimensions().width;

const ProfileSummaryView = (props: any) => {
  const {
    date,
    about,
    followerCount,
    followingCount,
    handleFollowUnfollowUser,
    handleMessage,
    handleOnFollowsPress,
    handleOnPressProfileEdit,
    handleUIChange,
    hoursRC,
    hoursVP,
    intl,
    isDarkTheme,
    isFavorite,
    isFollowing,
    isLoggedIn,
    isMuted,
    isOwnProfile,
    isProfileLoading,
    percentRC,
    percentVP,
    isShowPercentText: initialIsShowPercentText,
    handleMuteUnmuteUser,
    handleOnFavoritePress,
    handleReportUser,
    handleDelegateHp,
  } = props;

  const [isShowPercentText, setIsShowPercentText] = useState(initialIsShowPercentText);

  const handleOnPressLink = useCallback((url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  }, []);

  const handleOnDropdownSelect = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          if (handleOnFavoritePress) {
            handleOnFavoritePress(isFavorite);
          }
          break;
        case 1:
          if (handleDelegateHp) {
            handleDelegateHp();
          }
          break;
        case 2:
          if (handleMuteUnmuteUser) {
            handleMuteUnmuteUser(!isMuted);
          }
          break;
        case 3:
          if (handleReportUser) {
            handleReportUser();
          }
          break;

        default:
          Alert.alert('Action not implemented');
          break;
      }
    },
    [
      isMuted,
      isFavorite,
      handleMuteUnmuteUser,
      handleOnFavoritePress,
      handleReportUser,
      handleDelegateHp,
    ],
  );

  const renderActionPanel = useCallback(() => {
    const followButtonText = intl.formatMessage({
      id: !isFollowing ? 'user.follow' : 'user.unfollow',
    });

    const dropdownOptions = [
      intl.formatMessage({
        id: isFavorite ? 'user.remove_from_favourites' : 'user.add_to_favourites',
      }),
      intl.formatMessage({
        id: 'user.delegate',
      }),
      intl.formatMessage({
        id: !isMuted ? 'user.mute' : 'user.unmute',
      }),
      intl.formatMessage({
        id: 'user.report',
      }),
    ];

    return (
      <View style={styles.footer}>
        <ScrollView horizontal style={styles.leftIcons} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={() => handleOnFollowsPress(false)}>
            <View style={styles.followCountWrapper}>
              <Text style={styles.followCount}>{makeCountFriendly(followerCount)}</Text>
              <Text style={styles.followText}>
                {' '}
                {intl.formatMessage({
                  id: 'profile.follower',
                })}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOnFollowsPress(true)}>
            <View style={styles.followCountWrapper}>
              <Text style={styles.followCount}>{makeCountFriendly(followingCount)}</Text>
              <Text style={styles.followText}>
                {intl.formatMessage({
                  id: 'profile.following',
                })}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {isLoggedIn && !isOwnProfile ? (
          <View style={styles.rightIcons}>
            <TouchableOpacity
              style={styles.followActionWrapper}
              onPress={() => handleFollowUnfollowUser(!isFollowing)}
              disabled={isProfileLoading}
            >
              <Text style={styles.actionText}>{followButtonText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.followActionWrapper}
              onPress={handleMessage}
              disabled={isProfileLoading}
            >
              <Text style={styles.actionText}>{intl.formatMessage({ id: 'profile.message' })}</Text>
            </TouchableOpacity>

            {isProfileLoading ? (
              <ActivityIndicator
                color={EStyleSheet.value('$primaryBlue')}
                style={styles.activityIndicator}
              />
            ) : (
              <DropdownButton
                style={styles.dropdownStyle}
                iconName="more-vert"
                iconStyle={styles.dropdownIconStyle}
                isHasChildIcon
                noHighlight
                onSelect={handleOnDropdownSelect}
                options={dropdownOptions}
              />
            )}
          </View>
        ) : (
          isOwnProfile && (
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.editActionWrapper} onPress={handleOnPressProfileEdit}>
                <Text style={styles.actionText}>
                  {intl.formatMessage({ id: 'profile.edit_label' })}
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    );
  }, [
    followerCount,
    followingCount,
    handleFollowUnfollowUser,
    handleMessage,
    handleOnFollowsPress,
    handleOnPressProfileEdit,
    intl,
    isFollowing,
    isLoggedIn,
    isOwnProfile,
    isProfileLoading,
    isFavorite,
    isMuted,
    handleOnDropdownSelect,
  ]);

  const votingPowerHoursText = hoursVP && `• Full in ${hoursVP} hours`;
  const votingPowerText = `Voting power: ${percentVP}% ${votingPowerHoursText || ''}`;
  const rcPowerHoursText = hoursRC && `• Full in ${hoursRC} hours`;
  const rcPowerText = `Resource Credits: ${percentRC}% ${rcPowerHoursText || ''}`;
  const link = get(about, 'website', '');
  const location = get(about, 'location', '');
  const coverImage = get(about, 'cover_image', '');

  const ABOUT_DATA = [
    { id: 1, text: date, icon: 'calendar' },
    { id: 2, text: link, icon: 'earth', onPress: () => handleOnPressLink(link) },
    { id: 3, text: location, icon: 'near-me' },
  ];

  const rowLength =
    (location ? location.length : 0) + (link ? link.length : 0) + (date ? date.length : 0);
  const isColumn = rowLength && DEVICE_WIDTH / rowLength <= 7.3;

  let coverImageUrl = proxifyImageSrc(
    coverImage,
    360,
    240,
    Platform.OS !== 'ios' ? 'webp' : 'match',
  );

  if (!coverImageUrl) {
    coverImageUrl = isDarkTheme
      ? require('../../../assets/dark_cover_image.png')
      : require('../../../assets/default_cover_image.png');
  } else {
    coverImageUrl = { uri: coverImageUrl };
  }

  const handleTogglePercentText = useCallback(() => {
    setIsShowPercentText((prev: boolean) => {
      const newValue = !prev;
      handleUIChange(newValue ? 30 : 0);
      return newValue;
    });
  }, [handleUIChange]);

  return (
    <Fragment>
      <View style={[isColumn ? styles.textWithIconWrapperColumn : styles.textWithIconWrapper]}>
        {ABOUT_DATA.map((item) =>
          get(item, 'text', null) ? (
            <TextWithIcon
              isClickable={get(item, 'onPress')}
              onPress={get(item, 'onPress')}
              key={get(item, 'id')}
              text={item.text}
              iconSize={14}
              iconName={item.icon}
              iconType="MaterialCommunityIcons"
            />
          ) : null,
        )}
      </View>
      <ExpoImage
        key={`${new Date()}`}
        style={styles.longImage}
        source={coverImageUrl}
        contentFit="cover"
        placeholder={isDarkTheme ? DARK_COVER_IMAGE : LIGHT_COVER_IMAGE}
      />
      <TouchableOpacity onPress={handleTogglePercentText}>
        <PercentBar
          isShowText={isShowPercentText}
          percent={percentVP}
          margin={24}
          isTop
          text={votingPowerText}
        />
        <PercentBar
          isShowText={isShowPercentText}
          percent={percentRC}
          margin={24}
          barColor={isDarkTheme ? '#333e47' : '#eafcef'}
          barPercentColor="#11c28b"
          textColor="#11c28b"
          isTop={false}
          text={rcPowerText}
        />
      </TouchableOpacity>
      {renderActionPanel()}
    </Fragment>
  );
};

export default memo(ProfileSummaryView);
