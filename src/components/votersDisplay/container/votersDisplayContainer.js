import React, { PureComponent } from 'react';

// Constants
import ROUTES from '../../../constants/routeNames';

// Component
import VotersDisplayView from '../view/votersDisplayView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class VotersDisplayContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOnUserPress = (username) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  render() {
    const { votes } = this.props;

    return <VotersDisplayView votes={votes} />;
  }
}

export default VotersDisplayContainer;
