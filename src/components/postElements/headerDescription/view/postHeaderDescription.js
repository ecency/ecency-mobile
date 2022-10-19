import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Components
import { useNavigation } from '@react-navigation/native';
import { Tag } from '../../../basicUIElements';
import { Icon } from '../../../icon';
import { UserAvatar } from '../../../userAvatar';
// Styles
import styles from './postHeaderDescriptionStyles';

import { default as ROUTES } from '../../../../constants/routeNames';
import { IconButton } from '../../..';
import { showProfileModal } from '../../../../redux/actions/uiAction';

// Constants
const DEFAULT_IMAGE = require('../../../../assets/ecency.png');

class PostHeaderDescription extends PureComponent {
  // Component Life Cycles

  // Component Functions
  _handleOnUserPress = (username) => {
    const { profileOnPress, dispatch } = this.props;

    if (profileOnPress) {
      profileOnPress(username);
    } else {
      dispatch(showProfileModal(username));
    }
  };

  _handleOnTagPress = (content) => {
    const { navigation } = this.props;

    if (content && content.category && /hive-[1-3]\d{4,6}$/.test(content.category)) {
      navigation.navigate({
        name: ROUTES.SCREENS.COMMUNITY,
        params: {
          tag: content.category,
        },
      });
    }
    if (content && content.category && !/hive-[1-3]\d{4,6}$/.test(content.category)) {
      navigation.navigate({
        name: ROUTES.SCREENS.TAG_RESULT,
        params: {
          tag: content.category,
        },
      });
    }
    if (content && typeof content === 'string' && /hive-[1-3]\d{4,6}$/.test(content)) {
      navigation.navigate({
        name: ROUTES.SCREENS.COMMUNITY,
        params: {
          tag: content,
        },
      });
    }
    if (content && typeof content === 'string' && !/hive-[1-3]\d{4,6}$/.test(content)) {
      navigation.navigate({
        name: ROUTES.SCREENS.TAG_RESULT,
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
      isPinned,
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

              {inlineTime && (
                <Text style={styles.date}>
                  {isPromoted ? intl.formatMessage({ id: 'post.sponsored' }) : date}
                </Text>
              )}

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

const mapStateToProps = () => ({});

const mapHookToProps = () => ({
  navigation: useNavigation(),
});

export default connect(mapStateToProps)(
  injectIntl((props) => <PostHeaderDescription {...props} {...mapHookToProps()} />),
);
