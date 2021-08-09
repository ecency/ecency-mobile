import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import { injectIntl } from 'react-intl';

// Components
import { Tag } from '../../../basicUIElements';
import { Icon } from '../../../icon';
import { UserAvatar } from '../../../userAvatar';
// Styles
import styles from './postHeaderDescriptionStyles';

import { default as ROUTES } from '../../../../constants/routeNames';

// Constants
const DEFAULT_IMAGE = require('../../../../assets/ecency.png');

class PostHeaderDescription extends PureComponent {
  // Component Life Cycles

  // Component Functions
  _handleOnUserPress = (username) => {
    const { navigation, profileOnPress, reputation, currentAccountUsername } = this.props;

    if (profileOnPress) {
      profileOnPress(username);
    } else {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username,
          reputation,
        },
        key: username,
      });
    }
  };

  _handleOnTagPress = (content) => {
    const { navigation } = this.props;

    if (content && content.category && /hive-[1-3]\d{4,6}$/.test(content.category)) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.COMMUNITY,
        params: {
          tag: content.category,
        },
      });
    }
    if (content && content.category && !/hive-[1-3]\d{4,6}$/.test(content.category)) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.TAG_RESULT,
        params: {
          tag: content.category,
        },
      });
    }
    if (content && typeof content === 'string' && /hive-[1-3]\d{4,6}$/.test(content)) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.COMMUNITY,
        params: {
          tag: content,
        },
      });
    }
    if (content && typeof content === 'string' && !/hive-[1-3]\d{4,6}$/.test(content)) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.TAG_RESULT,
        params: {
          tag: content,
        },
      });
    }
  };

  render() {
    const {
      date,
      isHideImage,
      name,
      reputation,
      size,
      tag,
      content,
      tagOnPress,
      isShowOwnerIndicator,
      isPromoted,
      intl,
      inlineTime,
      customStyle,
    } = this.props;

    return (
      <View>
        <View style={[styles.container, customStyle]}>
          <TouchableOpacity
            style={styles.avatarNameWrapper}
            onPress={() => this._handleOnUserPress(name)}
          >
            {!isHideImage && (
              <>
                <UserAvatar
                  style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
                  disableSize
                  username={name}
                  defaultSource={DEFAULT_IMAGE}
                  noAction
                />
                <View style={styles.reputationWrapper}>
                  <Text style={styles.reputation}>{reputation}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>
          <View style={styles.leftContainer}>
            <View style={styles.primaryDetails}>
              <TouchableOpacity
                style={styles.avatarNameWrapper}
                onPress={() => this._handleOnUserPress(name)}
              >
                <Text style={styles.name}>{name}</Text>
              </TouchableOpacity>

              {inlineTime && (
                <Text style={styles.date}>
                  {isPromoted ? intl.formatMessage({ id: 'post.sponsored' }) : date}
                </Text>
              )}

              {isShowOwnerIndicator && (
                <Icon style={styles.ownerIndicator} name="stars" iconType="MaterialIcons" />
              )}
            </View>

            <View style={styles.secondaryDetails}>
              {content && (
                <TouchableOpacity onPress={() => this._handleOnTagPress(content)}>
                  <Tag
                    style={styles.topic}
                    textStyle={styles.topicText}
                    prefix={intl.formatMessage({ id: 'post.in' })}
                    suffix={' '}
                    value={content.category}
                    communityTitle={content.community_title}
                  />
                </TouchableOpacity>
              )}

              {!!tag && (
                <TouchableOpacity
                  onPress={() => (tagOnPress && tagOnPress()) || this._handleOnTagPress(tag)}
                >
                  <Tag isPostCardTag={!isPromoted} isPin value={tag} suffix={' '} />
                </TouchableOpacity>
              )}

              {!inlineTime && (
                <Text style={styles.date}>
                  {isPromoted ? intl.formatMessage({ id: 'post.sponsored' }) : date}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default withNavigation(injectIntl(PostHeaderDescription));
