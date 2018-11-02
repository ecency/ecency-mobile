import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';

import { PostCardView } from '..';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
/*
*            Props Name        Description                                     Value
*@props -->  props name here   description here                                Value Type Here
*
*/

class PostCardContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _handleOnUserPress = (username) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  _handleOnContentPress = (author, permlink) => {
    const { navigation } = this.props;

    if (author && permlink) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: permlink,
      });
    }
  };

  _handleOnVotersPress = (activeVotes) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
    });
  };

  render() {
    return (
      <PostCardView
        handleOnUserPress={this._handleOnUserPress}
        handleOnContentPress={this._handleOnContentPress}
        handleOnVotersPress={this._handleOnVotersPress}
        {...this.props}
      />
    );
  }
}

export default withNavigation(PostCardContainer);
