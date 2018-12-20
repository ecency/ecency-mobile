import React, { Component } from 'react';
import { Image } from 'react-native';
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
    const { username, size, style } = this.props;
    const imageSize = size === 'xl' ? 'large' : 'small';
    const _avatar = username
      ? { uri: `https://steemitimages.com/u/${username}/avatar/${imageSize}` }
      : DEFAULT_IMAGE;
    let _size = 32;

    if (size === 'xl') {
      _size = 64;
    }

    // eslint-disable-next-line
    return (
      <Image
        style={[styles.avatar, style, { width: _size, height: _size, borderRadius: _size / 2 }]}
        source={_avatar}
      />
    );
  }
}

export default UserAvatarView;
