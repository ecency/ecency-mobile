import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';

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
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles
  shouldComponentUpdate(nextProps) {
    return nextProps.username !== this.props.username;
  }

  // Component Functions
  _handleOnAvatarPress = username => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  render() {
    const { username, size, style, disableSize, noAction } = this.props;
    const imageSize = size === 'xl' ? 'large' : 'small';
    let _size;
    const _avatar = username
      ? { uri: `https://steemitimages.com/u/${username}/avatar/${imageSize}` }
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

export default withNavigation(UserAvatarView);
