import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { IconButton } from '../../..';
import styles from './quickProfileStyles';

interface ActionPanelProps {
    isFollowing:boolean,
    isFavourite:boolean,
    onFollowPress:()=>void,
    onFavouritePress:()=>void
}

export const ActionPanel = ({isFollowing, isFavourite, onFavouritePress, onFollowPress}: ActionPanelProps) => {
  return (
    <View style={styles.actionPanel}>
         <IconButton 
            iconType='SimpleLineIcons'
            name={isFollowing?'user-following':'user-follow'}
            size={20}
            color={EStyleSheet.value('$primaryBlack')}
            disabled={isFollowing}
            onPress={onFollowPress}
        />
        <IconButton 
            style={{marginLeft:8}}
            iconType='SimpleLineIcons'
            name={'heart'}
            size={20}
            color={EStyleSheet.value(isFavourite?'$primaryRed':'$primaryBlack')}
            onPress={onFavouritePress}
        />
    </View>
  );
};