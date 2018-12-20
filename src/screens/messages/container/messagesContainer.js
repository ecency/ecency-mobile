import React, { Component } from 'react';
// import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import MessagesScreen from '../screen/messagesScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class MessagesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    // eslint-disable-next-line
    //const {} = this.props;

    return <MessagesScreen {...this.props} />;
  }
}

export default MessagesContainer;
