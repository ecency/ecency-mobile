import React, { PureComponent, Fragment } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Linking } from 'react-native';
import get from 'lodash/get';

// Constants
import FastImage from 'react-native-fast-image';
import LIGHT_COVER_IMAGE from '../../../assets/default_cover_image.png';
import DARK_COVER_IMAGE from '../../../assets/dark_cover_image.png';

// Components
import { TextWithIcon } from '../../basicUIElements';
import { PercentBar } from '../../percentBar';
import { IconButton } from '../../iconButton';
import { DropdownButton } from '../../dropdownButton';

// Utils
import { makeCountFriendly } from '../../../utils/formatter';
import { getResizedImage } from '../../../utils/image';

// Styles
import styles from './profileSummaryStyles';
import { TextButton } from '../../buttons';

const DEVICE_WIDTH = Dimensions.get('window').width;

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
    const { isMuted, isFavorite, handleMuteUnmuteUser, handleOnFavoritePress } = this.props;

    switch (index) {
      case 0:
        if (handleMuteUnmuteUser) {
          handleMuteUnmuteUser(!isMuted);
        }
        break;
      case 1:
        if (handleOnFavoritePress) {
          handleOnFavoritePress(isFavorite);
        }
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
    } = this.props;
    const dropdownOptions = [];
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

    const followButtonText = !isFollowing ? 'Follow' : 'Unfollow';
    let coverImageUrl = getResizedImage(get(about, 'cover_image'), 600);

    if (!coverImageUrl) {
      coverImageUrl = isDarkTheme
        ? require('../../../assets/dark_cover_image.png')
        : require('../../../assets/default_cover_image.png');
    } else {
      coverImageUrl = { uri: coverImageUrl };
    }

    dropdownOptions.push(!isMuted ? 'MUTE' : 'UNMUTE');
    dropdownOptions.push(isFavorite ? 'REMOVE FROM FAVOURITES' : 'ADD TO FAVOURITES');

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
        <FastImage
          style={styles.longImage}
          source={coverImageUrl}
          resizeMode="cover"
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
              >
                <Text style={styles.followActionText}>{followButtonText}</Text>
              </TouchableOpacity>

              {isProfileLoading ? (
                <ActivityIndicator style={styles.activityIndicator} />
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
              <Fragment>
                <IconButton
                  backgroundColor="transparent"
                  color="#c1c5c7"
                  iconType="MaterialCommunityIcons"
                  name="pencil"
                  onPress={handleOnPressProfileEdit}
                  size={20}
                />
              </Fragment>
            )
          )}
        </View>
      </Fragment>
    );
  }
}

export default ProfileSummaryView;
