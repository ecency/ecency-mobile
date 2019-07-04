import React, { PureComponent, Fragment } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';

// Constants
import LIGHT_COVER_IMAGE from '../../../assets/default_cover_image.png';
import DARK_COVER_IMAGE from '../../../assets/dark_cover_image.png';

// Components
import { TextWithIcon } from '../../basicUIElements';
import { PercentBar } from '../../percentBar';
import { IconButton } from '../../iconButton';
import { DropdownButton } from '../../dropdownButton';

// Utils
import { makeCountFriendly } from '../../../utils/formatter';

// Styles
import styles from './profileSummaryStyles';

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
  _handleOnPressLink = url => {
    Linking.openURL(url);
  };

  _handleOnDropdownSelect = index => {
    const { isMuted, handleMuteUnmuteUser } = this.props;

    // This funciton should have switch case but now only has one option therefor
    // temporarily I created with if statments
    if (index === '0' && handleMuteUnmuteUser) {
      handleMuteUnmuteUser(!isMuted);
    }
  };

  render() {
    const { isShowPercentText } = this.state;
    const {
      coverImage,
      date,
      followerCount,
      followingCount,
      handleFollowUnfollowUser,
      handleOnFavoritePress,
      handleOnFollowsPress,
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
      link,
      location,
      percentRC,
      percentVP,
    } = this.props;
    const dropdownOpions = [];
    const votingPowerHoursText = hoursVP && `• Full in ${hoursVP} hours`;
    const votingPowerText = `Voting power: ${percentVP}% ${votingPowerHoursText || ''}`;
    const rcPowerHoursText = hoursRC && `• Full in ${hoursRC} hours`;
    const rcPowerText = `RCs: ${percentRC}% ${rcPowerHoursText || ''}`;

    const rowLength =
      (location ? location.length : 0) + (link ? link.length : 0) + (date ? date.length : 0);
    const isColumn = rowLength && DEVICE_WIDTH / rowLength <= 7.3;

    const followButtonIcon = !isFollowing ? 'account-plus' : 'account-minus';
    const coverImageUrl = `https://steemitimages.com/400x0/${coverImage}`;

    dropdownOpions.push(!isMuted ? 'MUTE' : 'UNMUTE');

    return (
      <Fragment>
        <View style={[isColumn ? styles.textWithIconWrapperColumn : styles.textWithIconWrapper]}>
          {!!location && (
            <TextWithIcon
              text={location}
              iconName="near-me"
              iconType="MaterialIcons"
              iconSize={14}
            />
          )}
          {!!link && (
            <TextWithIcon
              isClickable
              onPress={() => this._handleOnPressLink(link)}
              text={link}
              iconSize={14}
              iconName="earth"
              iconType="MaterialCommunityIcons"
            />
          )}
          {!!date && (
            <TextWithIcon
              text={date}
              iconName="calendar"
              iconType="MaterialCommunityIcons"
              iconSize={14}
            />
          )}
        </View>
        <Image
          style={styles.longImage}
          source={{ uri: coverImageUrl }}
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
          {isLoggedIn && !isOwnProfile && (
            <View style={styles.rightIcons}>
              <IconButton
                backgroundColor="transparent"
                color={isFavorite ? '#e63535' : '#c1c5c7'}
                iconType="MaterialIcons"
                name={isFavorite ? 'favorite' : 'favorite-border'}
                size={20}
                style={[styles.insetIconStyle]}
                onPress={() => handleOnFavoritePress(isFavorite)}
              />
              {isProfileLoading ? (
                <ActivityIndicator style={styles.activityIndicator} />
              ) : (
                <IconButton
                  backgroundColor="transparent"
                  color="#c1c5c7"
                  iconType="MaterialCommunityIcons"
                  name={followButtonIcon}
                  onPress={() => handleFollowUnfollowUser(!isFollowing)}
                  size={20}
                />
              )}
              {isProfileLoading ? (
                <ActivityIndicator style={styles.activityIndicator} />
              ) : (
                <DropdownButton
                  dropdownStyle={styles.dropdownStyle}
                  iconName="more-vert"
                  iconStyle={styles.dropdownIconStyle}
                  isHasChildIcon
                  noHighlight
                  onSelect={this._handleOnDropdownSelect}
                  options={dropdownOpions}
                />
              )}
            </View>
          )}
        </View>
      </Fragment>
    );
  }
}

export default ProfileSummaryView;
