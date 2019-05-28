import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { ExampleView } from '..';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class ExampleContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    // eslint-disable-next-line
    const {} = this.props;

    return <ExampleView />;
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(ExampleContainer);
