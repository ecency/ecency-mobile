import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';

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

  _handleOnUserPress = username => {
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

    return <VotersDisplayView handleOnUserPress={this._handleOnUserPress} votes={votes} />;
  }
}

export default withNavigation(VotersDisplayContainer);
