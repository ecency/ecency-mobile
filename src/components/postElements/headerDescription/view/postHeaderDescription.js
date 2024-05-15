import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { Tag } from '../../../basicUIElements';
import { Icon } from '../../../icon';
import { UserAvatar } from '../../../userAvatar';
// Styles
import styles from './postHeaderDescriptionStyles';

import { default as ROUTES } from '../../../../constants/routeNames';
import { IconButton } from '../../..';
import RootNavigation from '../../../../navigation/rootNavigation';

// Constants
import DEFAULT_IMAGE from '../../../../assets/ecency.png';

class PostHeaderDescription extends PureComponent {
  // Component Life Cycles

  // Component Functions
  _handleOnUserPress = (username) => {
    const { profileOnPress } = this.props;

    if (profileOnPress) {
      profileOnPress(username);
    }
  };

  _handleOnTagPress = (content) => {
    const { handleTagPress } = this.props;
    let navParams = {};
    if (content && content.category && /hive-[1-3]\d{4,6}$/.test(content.category)) {
      navParams = {
        name: ROUTES.SCREENS.COMMUNITY,
        params: {
          tag: content.category,
        },
      };
    }
    if (content && content.category && !/hive-[1-3]\d{4,6}$/.test(content.category)) {
      navParams = {
        name: ROUTES.SCREENS.TAG_RESULT,
        params: {
          tag: content.category,
        },
      };
    }
    if (content && typeof content === 'string' && /hive-[1-3]\d{4,6}$/.test(content)) {
      navParams = {
        name: ROUTES.SCREENS.COMMUNITY,
        params: {
          tag: content,
        },
      };
    }
    if (content && typeof content === 'string' && !/hive-[1-3]\d{4,6}$/.test(content)) {
      navParams = {
        name: ROUTES.SCREENS.TAG_RESULT,
        params: {
          tag: content,
        },
      };
    }

    if (handleTagPress) {
      handleTagPress(navParams);
    } else {
      RootNavigation.navigate(navParams);
    }
  };

  render() {
    const {
      date,
      isHideImage,
      name,
      size,
      tag,
      content,
      tagOnPress,
      isShowOwnerIndicator,
      isPromoted,
      intl,
      inlineTime,
      customStyle,
      secondaryContentComponent,
      showDotMenuButton,
      handleOnDotPress,
    } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.container, customStyle]}>
          <TouchableOpacity
            style={styles.avatarNameWrapper}
            onPress={() => this._handleOnUserPress(name)}
          >
            {!isHideImage && (
              <UserAvatar
                style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
                disableSize
                username={name}
                defaultSource={DEFAULT_IMAGE}
                noAction
              />
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

              {inlineTime && <Text style={styles.date}>{date}</Text>}

              {isShowOwnerIndicator && (
                <Icon style={styles.ownerIndicator} name="stars" iconType="MaterialIcons" />
              )}

              {showDotMenuButton && (
                <View style={{ flexGrow: 1, alignItems: 'flex-end' }}>
                  <IconButton
                    size={20}
                    iconStyle={styles.rightIcon}
                    style={styles.rightButton}
                    name="dots-horizontal"
                    onPress={() => handleOnDotPress && handleOnDotPress()}
                    iconType="MaterialCommunityIcons"
                  />
                </View>
              )}
            </View>

            {secondaryContentComponent}

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

              {!inlineTime && <Text style={styles.date}>{date}</Text>}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default injectIntl(PostHeaderDescription);
