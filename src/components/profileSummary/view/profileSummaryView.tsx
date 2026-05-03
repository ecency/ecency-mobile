import React, { PureComponent, Fragment } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import get from 'lodash/get';

// Constants
import { Image as ExpoImage } from 'expo-image';
import EStyleSheet from 'react-native-extended-stylesheet';
import { proxifyImageSrc } from '@ecency/render-helper';
import LIGHT_COVER_IMAGE from '../../../assets/default_cover_image.png';
import DARK_COVER_IMAGE from '../../../assets/dark_cover_image.png';

// Components
import { TextWithIcon } from '../../basicUIElements';
import { PercentBar } from '../../percentBar';
import { DropdownButton } from '../../dropdownButton';
import { UserAvatar } from '../../userAvatar';

// Utils
import { makeCountFriendly } from '../../../utils/formatter';

// Styles
import styles from './profileSummaryStyles';
import getWindowDimensions from '../../../utils/getWindowDimensions';

const DEVICE_WIDTH = getWindowDimensions().width;

class ProfileSummaryView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowPercentText: props.isShowPercentText,
    };
  }

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

  _renderCoverImage = () => {
    const { about, isDarkTheme } = this.props;
    const coverImage = get(about, 'cover_image', '');
    let coverImageUrl = proxifyImageSrc(coverImage, 640, 320, 'match');

    if (!coverImageUrl) {
      coverImageUrl = isDarkTheme ? DARK_COVER_IMAGE : LIGHT_COVER_IMAGE;
    } else {
      coverImageUrl = { uri: coverImageUrl };
    }

    return (
      <View style={styles.coverContainer}>
        <ExpoImage
          style={styles.coverImage}
          source={coverImageUrl}
          contentFit="cover"
          placeholder={isDarkTheme ? DARK_COVER_IMAGE : LIGHT_COVER_IMAGE}
        />
      </View>
    );
  };

  _renderAvatarAndActions = () => {
    const {
      handleFollowUnfollowUser,
      handleMessage,
      handleOnPressProfileEdit,
      intl,
      isFavorite,
      isFollowing,
      isLoggedIn,
      isMuted,
      isOwnProfile,
      isProfileLoading,
      username,
    } = this.props;

    const followButtonText = intl.formatMessage({
      id: !isFollowing ? 'user.follow' : 'user.unfollow',
    });

    let dropdownOptions = [];
    if (isLoggedIn && !isOwnProfile) {
      dropdownOptions = [
        intl.formatMessage({
          id: isFavorite ? 'user.remove_from_favourites' : 'user.add_to_favourites',
        }),
        intl.formatMessage({ id: 'user.delegate' }),
        intl.formatMessage({ id: !isMuted ? 'user.mute' : 'user.unmute' }),
        intl.formatMessage({ id: 'user.report' }),
      ];
    }

    return (
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <UserAvatar username={username} disableSize style={styles.avatarImage} noAction />
        </View>

        <View style={styles.actionButtonsRow}>
          {isLoggedIn && !isOwnProfile && (
            <Fragment>
              <TouchableOpacity
                style={styles.followActionWrapper}
                onPress={() => handleFollowUnfollowUser(!isFollowing)}
                disabled={isProfileLoading}
              >
                <Text style={styles.actionText}>{followButtonText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
                disabled={isProfileLoading}
              >
                <Text style={styles.actionText}>
                  {intl.formatMessage({ id: 'profile.message' })}
                </Text>
              </TouchableOpacity>

              {isProfileLoading ? (
                <ActivityIndicator
                  color={EStyleSheet.value('$primaryBlue')}
                  style={styles.activityIndicator}
                />
              ) : (
                <DropdownButton
                  style={styles.dropdownStyle}
                  iconName="more-horiz"
                  iconStyle={styles.dropdownIconStyle}
                  isHasChildIcon
                  noHighlight
                  onSelect={this._handleOnDropdownSelect}
                  options={dropdownOptions}
                />
              )}
            </Fragment>
          )}
          {isOwnProfile && (
            <TouchableOpacity style={styles.editActionWrapper} onPress={handleOnPressProfileEdit}>
              <Text style={styles.actionText}>
                {intl.formatMessage({ id: 'profile.edit_label' })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  _renderIdentity = () => {
    const { about, displayName, username, reputation } = this.props;
    const bioText = get(about, 'about', '');

    return (
      <View style={styles.identitySection}>
        <Text style={styles.displayName} numberOfLines={1}>
          {displayName || username}
        </Text>
        <Text style={styles.username}>
          {`@${username}`}
          {reputation ? ` (${reputation})` : ''}
        </Text>
        {bioText ? (
          <Text style={styles.bioText} numberOfLines={3}>
            {bioText}
          </Text>
        ) : null}
      </View>
    );
  };

  _renderMetadata = () => {
    const { about, date } = this.props;
    const link = get(about, 'website', '');
    const location = get(about, 'location', '');

    const ABOUT_DATA = [
      { id: 1, text: date, icon: 'calendar' },
      { id: 2, text: link, icon: 'earth', onPress: () => this._handleOnPressLink(link) },
      { id: 3, text: location, icon: 'near-me' },
    ];

    const items = ABOUT_DATA.filter((item) => item.text);
    if (items.length === 0) return null;

    const rowLength = items.reduce((sum, item) => sum + (item.text?.length || 0), 0);
    const isColumn = rowLength && DEVICE_WIDTH / rowLength <= 7.3;

    return (
      <View style={isColumn ? styles.metadataRowColumn : styles.metadataRow}>
        {items.map((item) => (
          <TextWithIcon
            isClickable={!!item.onPress}
            onPress={item.onPress}
            key={item.id}
            text={item.text}
            iconSize={14}
            iconName={item.icon}
            iconType="MaterialCommunityIcons"
          />
        ))}
      </View>
    );
  };

  _renderFollowerStats = () => {
    const { followerCount, followingCount, handleOnFollowsPress, intl } = this.props;

    return (
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem} onPress={() => handleOnFollowsPress(false)}>
          <Text style={styles.statCount}>{makeCountFriendly(followerCount)}</Text>
          <Text style={styles.statLabel}>{intl.formatMessage({ id: 'profile.follower' })}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={() => handleOnFollowsPress(true)}>
          <Text style={styles.statCount}>{makeCountFriendly(followingCount)}</Text>
          <Text style={styles.statLabel}>{intl.formatMessage({ id: 'profile.following' })}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  _renderBars = () => {
    const { isShowPercentText } = this.state;
    const { handleUIChange, hoursRC, hoursVP, isDarkTheme, percentRC, percentVP } = this.props;

    const votingPowerHoursText = hoursVP && `• Full in ${hoursVP} hours`;
    const votingPowerText = `Voting power: ${percentVP}% ${votingPowerHoursText || ''}`;
    const rcPowerHoursText = hoursRC && `• Full in ${hoursRC} hours`;
    const rcPowerText = `Resource Credits: ${percentRC}% ${rcPowerHoursText || ''}`;

    return (
      <TouchableOpacity
        style={styles.barsContainer}
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
    );
  };

  render() {
    return (
      <Fragment>
        {this._renderCoverImage()}
        {this._renderAvatarAndActions()}
        {this._renderIdentity()}
        {this._renderMetadata()}
        {this._renderFollowerStats()}
        {this._renderBars()}
      </Fragment>
    );
  }
}

export default ProfileSummaryView;
