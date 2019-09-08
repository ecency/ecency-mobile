import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import FastImage from 'react-native-fast-image';
import styles from './userAvatarStyles';

// Constants
import ROUTES from '../../../constants/routeNames';

const DEFAULT_IMAGE = require('../../../assets/avatar_default.png');

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

class UserAvatarView extends Component {
  // Component Life Cycles
  shouldComponentUpdate(nextProps) {
    const { username } = this.props;

    return nextProps.username !== username;
  }

  // Component Functions
  _handleOnAvatarPress = username => {
    const {
      dispatch,
      currentUsername: { name },
    } = this.props;

    const routeName = name === username ? ROUTES.TABBAR.PROFILE : ROUTES.SCREENS.PROFILE;

    const navigateAction = NavigationActions.navigate({
      routeName,
      params: {
        username,
      },
      key: username,
      action: NavigationActions.navigate({ routeName }),
    });
    dispatch(navigateAction);
  };

  render() {
    const {
      username,
      size,
      style,
      disableSize,
      noAction,
      avatarUrl,
      currentUsername: { name, avatar },
    } = this.props;
    const imageSize = size === 'xl' ? 'large' : 'small';
    let _size;
    const _avatar = username
      ? {
          uri:
            avatarUrl || name === username
              ? avatar
              : `https://steemitimages.com/u/${username}/avatar/${imageSize}`,
        }
      : DEFAULT_IMAGE;

    if (!disableSize) {
      _size = 32;

      if (size === 'xl') {
        _size = 64;
      }
    }

    return (
      <TouchableOpacity disabled={noAction} onPress={() => this._handleOnAvatarPress(username)}>
        <FastImage
          style={[
            styles.avatar,
            style,
            !disableSize && { width: _size, height: _size, borderRadius: _size / 2 },
          ]}
          source={_avatar}
        />
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = state => ({
  currentUsername: state.account.currentAccount,
});

export default connect(mapStateToProps)(UserAvatarView);
