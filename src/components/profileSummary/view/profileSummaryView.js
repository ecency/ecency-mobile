import React, { Component, Fragment } from 'react';
import {
  View, Image, Text, TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';

// Constants
import DEFAULT_IMAGE from '../../../assets/default_cover_image.png';

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

  render() {
    const { isShowPercentText } = this.state;
    const {
      percentRC,
      percentVP,
      hoursVP,
      hoursRC,
      location,
      link,
      date,
      followingCount,
      followerCount,
      coverImage,
      isLoggedIn,
      isFollowing,
      isFavorite,
      isMuted,
      isOwnProfile,
      isProfileLoading,
      handleFollowUnfollowUser,
      handleMuteUnmuteUser,
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
          <TextWithIcon text={location} iconName="md-navigate" />
          <TextWithIcon isClickable text={link} iconName="md-globe" />
          <TextWithIcon text={date} iconName="md-calendar" />
        </View>
        <View />
        <Image
          style={styles.longImage}
          source={{ uri: coverImage }}
          defaultSource={DEFAULT_IMAGE}
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
              <View style={styles.followCountWrapper}>
                <Text style={styles.followCount}>{followerCount}</Text>
                <Text style={styles.followText}>followers</Text>
              </View>
              <View style={styles.followCountWrapper}>
                <Text style={styles.followCount}>{followingCount}</Text>
                <Text style={styles.followText}>following</Text>
              </View>
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
