import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { Tag } from '../../../basicUIElements';
import { Icon } from '../../../icon';
import { ProBadge } from '../../../proBadge';
import { EcencySourceBadge } from '../../../ecencySourceBadge';
import { UserAvatar } from '../../../userAvatar';
// Styles
import styles from './postHeaderDescriptionStyles';

import { default as ROUTES } from '../../../../constants/routeNames';
import { IconButton } from '../../..';
import RootNavigation, { NavigateOptions } from '../../../../navigation/rootNavigation';

// Constants

class PostHeaderDescription extends PureComponent<any, any> {
  // Component Life Cycles

  // Component Functions
  _navigateToProfile = (username: any) => {
    if (!username) {
      return;
    }
    RootNavigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params: { username },
      key: username,
    });
  };

  _handleOnAvatarPress = (username: any) => {
    const { avatarOnPress, profileOnPress } = this.props;

    if (!username) {
      return;
    }

    if (avatarOnPress) {
      avatarOnPress(username);
      return;
    }

    if (profileOnPress) {
      profileOnPress(username);
      return;
    }

    this._navigateToProfile(username);
  };

  _handleOnUserPress = (username: any) => {
    const { profileOnPress } = this.props;

    if (!username) {
      return;
    }

    if (profileOnPress) {
      profileOnPress(username);
      return;
    }

    this._navigateToProfile(username);
  };

  _handleOnTagPress = (content: any) => {
    const { handleTagPress } = this.props;
    // Stays undefined when `content` matches none of the branches below, which previously fell
    // through to navigate({}).
    let navParams: NavigateOptions | undefined;
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

    if (!navParams) {
      return;
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
      name,
      size,
      tag,
      content,
      tagOnPress,
      isShowOwnerIndicator,
      isShowPinnedIndicator,
      isShowPromotedIndicator,
      isPromoted,
      intl,
      inlineTime,
      isFromEcency,
      customStyle,
      secondaryContentComponent,
      showDotMenuButton,
      handleOnDotPress,
    } = this.props;

    // AI-usage disclosure (interoperable). Shows for any post that discloses it, not
    // only Ecency posts. json_metadata may be an unparsed string in some paths -> safe.
    const aiTools = content?.json_metadata?.ai_tools;
    const hasAiTools = !!(aiTools?.media_generation || aiTools?.writing_edit);

    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.container, customStyle]}>
          <TouchableOpacity
            style={styles.avatarNameWrapper}
            onPress={() => this._handleOnAvatarPress(name)}
          >
            {/* Avatars are deliberately not gated on "Show Images": they are tiny,
                cached, and part of identity. The setting suppresses content images. */}
            <UserAvatar
              style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }] as any}
              disableSize
              username={name}
              noAction
            />
          </TouchableOpacity>

          <View style={styles.leftContainer}>
            <View style={styles.primaryDetails}>
              <TouchableOpacity
                style={styles.avatarNameWrapper}
                onPress={() => this._handleOnUserPress(name)}
              >
                <Text style={styles.name}>{name}</Text>
              </TouchableOpacity>

              <ProBadge username={name} />

              {inlineTime && <Text style={styles.date}>{date}</Text>}

              {inlineTime && isFromEcency && <EcencySourceBadge style={styles.ecencySourceBadge} />}

              {inlineTime && hasAiTools && (
                <Icon
                  name="robot-outline"
                  iconType="MaterialCommunityIcons"
                  style={styles.aiToolsBadge}
                  accessible={true}
                  accessibilityLabel={intl.formatMessage({ id: 'ai_usage.disclosed' })}
                />
              )}

              {isShowOwnerIndicator && (
                <Icon style={styles.ownerIndicator} name="stars" iconType="MaterialIcons" />
              )}

              {isShowPinnedIndicator && (
                <Icon style={styles.pushPinIcon} name="pin" iconType="MaterialCommunityIcons" />
              )}

              {isShowPromotedIndicator && (
                <Text style={styles.promotedIndicator}>
                  {intl.formatMessage({ id: 'post.promoted' })}
                </Text>
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
                    accessibilityLabel={intl.formatMessage({
                      id: 'post.a11y_post_options',
                      defaultMessage: 'Post options',
                    })}
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

              {!inlineTime && isFromEcency && (
                <EcencySourceBadge style={styles.ecencySourceBadge} />
              )}

              {!inlineTime && hasAiTools && (
                <Icon
                  name="robot-outline"
                  iconType="MaterialCommunityIcons"
                  style={styles.aiToolsBadge}
                  accessible={true}
                  accessibilityLabel={intl.formatMessage({ id: 'ai_usage.disclosed' })}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default injectIntl(PostHeaderDescription);
