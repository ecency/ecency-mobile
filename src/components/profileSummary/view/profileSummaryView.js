import React, { PureComponent, Fragment } from 'react';
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
import LIGHT_COVER_IMAGE from '../../../assets/default_cover_image.png';
import DARK_COVER_IMAGE from '../../../assets/dark_cover_image.png';

// Components
import { TextWithIcon } from '../../basicUIElements';
import { PercentBar } from '../../percentBar';
import { IconButton } from '../../iconButton';
import { DropdownButton } from '../../dropdownButton';

// Utils
import { makeCountFriendly } from '../../../utils/formatter';
import { getCoverImageUrl } from '../../../utils/image';

// Styles
import styles from './profileSummaryStyles';
import { TextButton } from '../../buttons';
import { Icon } from '../..';
import getWindowDimensions from '../../../utils/getWindowDimensions';

const DEVICE_WIDTH = getWindowDimensions().width;

class ProfileSummaryView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isShowPercentText: props.isShowPercentText,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnPressLink = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  _handleOnDropdownSelect = (index) => {
    const {
      isMuted,
      isFavorite,
      handleMuteUnmuteUser,
      handleOnFavoritePress,
      handleReportUser,
      handleDelegateHp,
    } = this.props;

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
  };

  render() {
    const { isShowPercentText } = this.state;
    const {
      date,
      about,
      followerCount,
      followingCount,
      handleFollowUnfollowUser,
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
      username,
    } = this.props;

    let dropdownOptions = [];
    const votingPowerHoursText = hoursVP && `• Full in ${hoursVP} hours`;
    const votingPowerText = `Voting power: ${percentVP}% ${votingPowerHoursText || ''}`;
    const rcPowerHoursText = hoursRC && `• Full in ${hoursRC} hours`;
    const rcPowerText = `Resource Credits: ${percentRC}% ${rcPowerHoursText || ''}`;
    const link = get(about, 'website', '');
    const location = get(about, 'location', '');

    const ABOUT_DATA = [
      { id: 1, text: date, icon: 'calendar' },
      { id: 2, text: link, icon: 'earth', onPress: () => this._handleOnPressLink(link) },
      { id: 3, text: location, icon: 'near-me' },
    ];

    const rowLength =
      (location ? location.length : 0) + (link ? link.length : 0) + (date ? date.length : 0);
    const isColumn = rowLength && DEVICE_WIDTH / rowLength <= 7.3;

    const followButtonText = intl.formatMessage({
      id: !isFollowing ? 'user.follow' : 'user.unfollow',
    });
    let coverImageUrl = getCoverImageUrl(username);

    if (!coverImageUrl) {
      coverImageUrl = isDarkTheme
        ? require('../../../assets/dark_cover_image.png')
        : require('../../../assets/default_cover_image.png');
    } else {
      coverImageUrl = { uri: coverImageUrl };
    }

    // compile dropdown options
    dropdownOptions = [
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
          style={styles.longImage}
          source={coverImageUrl}
          contentFit="cover"
          defaultSource={isDarkTheme ? DARK_COVER_IMAGE : LIGHT_COVER_IMAGE}
        />
        <TouchableOpacity
          onPress={() =>
            this.setState({ isShowPercentText: !isShowPercentText }, () => {
              handleUIChange(!isShowPercentText ? 30 : 0);
            })
          }
        >
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
        <View style={styles.footer}>
          <View style={styles.leftIcons}>
            <Fragment>
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
            </Fragment>
          </View>

          {isLoggedIn && !isOwnProfile ? (
            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.followActionWrapper}
                onPress={() => handleFollowUnfollowUser(!isFollowing)}
                disabled={isProfileLoading}
              >
                <Text style={styles.actionText}>{followButtonText}</Text>
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
                  onSelect={this._handleOnDropdownSelect}
                  options={dropdownOptions}
                />
              )}
            </View>
          ) : (
            isOwnProfile && (
              <View style={styles.rightIcons}>
                <TouchableOpacity
                  style={styles.editActionWrapper}
                  onPress={handleOnPressProfileEdit}
                >
                  <Text style={styles.actionText}>
                    {intl.formatMessage({ id: 'profile.edit_label' })}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      </Fragment>
    );
  }
}

export default ProfileSummaryView;
