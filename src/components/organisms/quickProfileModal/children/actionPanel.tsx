import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { IconButton } from '../../..';
import { useAppSelector } from '../../../../hooks';
import styles from './quickProfileStyles';

interface ActionPanelProps {
    isFollowing:boolean,
    isFavourite:boolean,
    onFollowPress:()=>void,
    onFavouritePress:()=>void
}

export const ActionPanel = ({isFollowing, isFavourite, onFavouritePress, onFollowPress}: ActionPanelProps) => {

  const heartColor = isFavourite 
    ? '$primaryBlue' 
    : '$iconColor'

  const followIcon = isFollowing
    ? 'user-check'
    : 'user-plus'

  return (
    <View style={styles.actionPanel}>
         <IconButton 
            iconType='FontAwesome5'
            name={followIcon}
            size={20}
            color={EStyleSheet.value('$iconColor')}
            disabled={isFollowing}
            onPress={onFollowPress}
        />
        <IconButton 
            style={{marginLeft:8}}
            iconType='AntDesign'
            name={'heart'}
            size={20}
            color={EStyleSheet.value(heartColor)}
            onPress={onFavouritePress}
        />
    </View>
  );
};