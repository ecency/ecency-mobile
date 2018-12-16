import React from 'react';
import { Image } from 'react-native';
import styles from './userAvatarStyles';

const DEFAULT_IMAGE = require('../../../assets/avatar_default.png');

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

const UserAvatarView = ({ username, size, style }) => {
  const imageSize = size === 'xl' ? 'large' : 'small';
  const _avatar = username
    ? { uri: `https://steemitimages.com/u/${username}/avatar/${imageSize}` }
    : DEFAULT_IMAGE;
  let _size = 32;

  if (size === 'xl') {
    _size = 64;
  }

  return (
    <Image
      style={[styles.avatar, style, { width: _size, height: _size, borderRadius: _size / 2 }]}
      source={_avatar}
    />
  );
};

export default UserAvatarView;
