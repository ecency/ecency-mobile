import React, { PureComponent } from 'react';

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
    const { votes } = this.props;

    return <VotersDisplayView votes={votes} />;
  }
}

export default VotersDisplayContainer;
