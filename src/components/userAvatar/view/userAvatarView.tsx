import React from 'react';
import { ActivityIndicator, TouchableOpacity, ViewStyle } from 'react-native';

import { Image as ExpoImage } from 'expo-image';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './userAvatarStyles';
import RootNavigation from '../../../navigation/rootNavigation';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utils

import { useAppSelector } from '../../../hooks';
import { getResizedAvatar } from '../../../utils/image';

import DEFAULT_IMAGE from '../../../assets/avatar_default.png';

/* Props
 * ------------------------------------------------f
 *   @prop { type }    name                - Description....
 */

interface UserAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: 'xl' | 'xxl';
  style?: ViewStyle;
  disableSize?: boolean;
  noAction?: boolean;
  isLoading?: boolean;
}

const UserAvatarView = ({
  username,
  avatarUrl,
  size,
  style,
  disableSize,
  noAction,
  isLoading,
}: UserAvatarProps) => {
  const curUsername = useAppSelector((state) => state.account.currentAccount.name);
  const avatarCacheStamp = useAppSelector((state) => state.ui.avatarCacheStamp);

  // Component Functions
  const _handleOnAvatarPress = (username: string) => {
    const name = ROUTES.SCREENS.PROFILE;
    RootNavigation.navigate(name, { username });
  };

  const uri = avatarUrl || getResizedAvatar(username, 'large');

  const _avatar = username
    ? {
        uri: `${uri}${
          username === curUsername && avatarCacheStamp ? `?stamp=${avatarCacheStamp}` : ''
        }`,
      }
    : DEFAULT_IMAGE;

  let _size: number;
  if (!disableSize) {
    _size = 32;
    if (size === 'xl') {
      _size = 64;
    }
    if (size === 'xxl') {
      _size = 128;
    }
  }

  return (
    <TouchableOpacity disabled={noAction} onPress={() => _handleOnAvatarPress(username)}>
      <ExpoImage
        style={[
          styles.avatar,
          style,
          !disableSize && { width: _size, height: _size, borderRadius: _size / 2 },
        ]}
        source={_avatar}
      />
      {isLoading && (
        <ActivityIndicator
          style={styles.activityIndicator}
          size="large"
          color={EStyleSheet.value('$white')}
        />
      )}
    </TouchableOpacity>
  );
};

export default UserAvatarView;
