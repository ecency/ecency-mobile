import React, { Component } from 'react';
import FastImage from 'react-native-fast-image';
import styles from './userAvatarStyles';

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

  render() {
    const {
      username, size, style, disableSize,
    } = this.props;
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
      <FastImage
        style={[
          styles.avatar,
          style,
          !disableSize && { width: _size, height: _size, borderRadius: _size / 2 },
        ]}
        source={_avatar}
      />
    );
  }
}

export default UserAvatarView;
