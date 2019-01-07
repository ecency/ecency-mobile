import React from 'react';
import { connect } from 'react-redux';
import { RefreshControl } from 'react-native';

const RefreshControlView = ({ refreshing, onRefresh, isDarkTheme }) => (
  <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    progressBackgroundColor="#357CE6"
    tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
    titleColor="#fff"
    colors={['#fff']}
  />
);

const mapStateToProps = state => ({
  currentAccount: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(RefreshControlView);
