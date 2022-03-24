import React from 'react';
import { RefreshControl as RNRefreshControl } from 'react-native';
import { ThemeContainer } from '../../../containers';

export interface RefreshControlProps {
    refreshing:boolean,
    onRefresh:()=>void
}

export const RefreshControl = ({refreshing, onRefresh }:RefreshControlProps) => (
  <ThemeContainer>
    {({ isDarkTheme }) => (
      <RNRefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        progressBackgroundColor="#357CE6"
        tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
        titleColor="#fff"
        colors={['#fff']}
    />
    )}
  </ThemeContainer>
);
