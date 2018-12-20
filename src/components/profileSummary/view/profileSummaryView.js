import React, { Component, Fragment } from 'react';
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

// Styles
import styles from './profileSummaryStyles';

const DEVICE_WIDTH = Dimensions.get('window').width;

class ProfileSummaryView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isShowPercentText: false,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnPressLink = (url) => {
    Linking.openURL(url);
  };

  render() {
    const { isShowPercentText } = this.state;
    const {
      coverImage,
      date,
      followerCount,
      followingCount,
      handleFollowUnfollowUser,
      handleMuteUnmuteUser,
      handleOnFollowsPress,
      hoursRC,
      hoursVP,
      intl,
      isDarkTheme,
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
    const votingPowerHoursText = hoursVP && `• Full in ${hoursVP} hours`;
    const votingPowerText = `Voting power: ${percentVP}% ${votingPowerHoursText || ''}`;
    const rcPowerHoursText = hoursRC && `• Full in ${hoursRC} hours`;
    const rcPowerText = `RCs: ${percentRC}% ${rcPowerHoursText || ''}`;

    /* eslint-disable */
    const rowLength = location
      ? location.length
      : null + link
      ? link.length
      : null + date
      ? date.length
      : null;

    const isColumn = rowLength && DEVICE_WIDTH / rowLength <= 15;
    const followButtonIcon = !isFollowing ? 'user-follow' : 'user-unfollow';
    const ignoreButtonIcon = !isMuted ? 'ban' : 'minus';

    return (
      <Fragment>
        <View style={[isColumn ? styles.textWithIconWrapperColumn : styles.textWithIconWrapper]}>
          {!!location && <TextWithIcon text={location} iconName="md-navigate" />}
          {!!link && (
            <TextWithIcon
              isClickable
              onPress={() => this._handleOnPressLink(link)}
              text={link}
              iconName="md-globe"
            />
          )}
          {!!date && <TextWithIcon text={date} iconName="md-calendar" />}
        </View>
        <View />
        <Image
          style={styles.longImage}
          source={{ uri: coverImage }}
          defaultSource={isDarkTheme ? DARK_COVER_IMAGE : LIGHT_COVER_IMAGE}
        />
        <TouchableOpacity onPress={() => this.setState({ isShowPercentText: !isShowPercentText })}>
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
            barColor="#eafcef"
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
                  <Text style={styles.followCount}>{followerCount}</Text>
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
                  <Text style={styles.followCount}>{followingCount}</Text>
                  <Text style={styles.followText}>
                    {intl.formatMessage({
                      id: 'profile.following',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            </Fragment>
          </View>
          {isLoggedIn && (
            <View style={styles.rightIcons}>
              {!isOwnProfile && (
                <Fragment>
                  <IconButton
                    backgroundColor="transparent"
                    name="heart"
                    iconType="SimpleLineIcons"
                    size={16}
                    style={[styles.insetIconStyle]}
                    color="#c1c5c7"
                  />
                  {isProfileLoading ? (
                    <ActivityIndicator style={styles.activityIndicator} />
                  ) : (
                    <IconButton
                      backgroundColor="transparent"
                      name={followButtonIcon}
                      iconType="SimpleLineIcons"
                      onPress={() => handleFollowUnfollowUser(isFollowing ? false : true)}
                      size={16}
                      style={styles.insetIconStyle}
                      color="#c1c5c7"
                    />
                  )}
                  {isProfileLoading ? (
                    <ActivityIndicator style={styles.activityIndicator} />
                  ) : (
                    <IconButton
                      backgroundColor="transparent"
                      name={ignoreButtonIcon}
                      iconType="SimpleLineIcons"
                      onPress={() => handleMuteUnmuteUser(isMuted ? false : true)}
                      size={16}
                      style={styles.insetIconStyle}
                      color="#c1c5c7"
                    />
                  )}
                </Fragment>
              )}
            </View>
          )}
        </View>
      </Fragment>
    );
  }
}

export default ProfileSummaryView;
