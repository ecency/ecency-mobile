import * as React from 'react';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { IconButton } from '../../..';
import styles from './quickProfileStyles';

interface ActionPanelProps {
  isFollowing: boolean;
  isFavourite: boolean;
  isMuted: boolean;
  isLoading: boolean;
  onFollowPress: () => void;
  onFavouritePress: () => void;
}

export const ActionPanel = ({
  isFollowing,
  isFavourite,
  isMuted,
  isLoading,
  onFavouritePress,
  onFollowPress,
}: ActionPanelProps) => {
  const heartColor = isFavourite ? '$primaryRed' : '$iconColor';
  const followColor = isFollowing ? '$primaryBlue' : '$iconColor';

  return (
    <View style={styles.actionPanel}>
      {isMuted ? (
        <IconButton
          iconType="MaterialCommunityIcons"
          name="volume-variant-off"
          size={26}
          color={EStyleSheet.value('$iconColor')}
          disabled={true}
        />
      ) : (
        <IconButton
          iconType="MaterialCommunityIcons"
          name="account-plus"
          size={26}
          color={EStyleSheet.value(followColor)}
          disabled={isFollowing || isLoading}
          onPress={onFollowPress}
        />
      )}

      <IconButton
        style={{ marginLeft: 8 }}
        iconType="MaterialCommunityIcons"
        name="account-heart"
        size={26}
        color={EStyleSheet.value(heartColor)}
        onPress={onFavouritePress}
      />
    </View>
  );
};
