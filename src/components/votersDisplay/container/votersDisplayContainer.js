import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';

// Services and Actions

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

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

  render() {
    return <VotersDisplayView {...this.props} />;
  }
}

export default VotersDisplayContainer;
