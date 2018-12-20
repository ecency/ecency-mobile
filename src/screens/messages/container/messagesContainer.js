import React, { PureComponent } from 'react';

// Component
import { MessagesScreen } from '..';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class MessagesContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return <MessagesScreen {...this.props} />;
  }
}

export default MessagesContainer;
