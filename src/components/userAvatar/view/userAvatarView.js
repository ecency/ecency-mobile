import React from 'react';
import { Image } from 'react-native';
import styles from './userAvatarStyles';

const DEFAULT_IMAGE = require('../../../assets/avatar_default.png');

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

const UserAvatarView = ({ userName, size, style }) => {
  const imageSize = size === 'xl' ? 'large' : 'medium';
  const _avatar = userName ?  { uri: `https://steemitimages.com/u/${userName}/avatar/${imageSize}` } : DEFAULT_IMAGE;
  let _size = 32;

  if(size === 'xl') {
    _size = 64
  }

  return <Image style={[styles.avatar, style, {width: _size, height: _size, borderRadius: _size / 2}]} source={_avatar} />;
};

export default UserAvatarView;
// width: 32,
// height: 32,
// borderRadius: 32 / 2,
// backgroundColor: '$white',