import React, { Component } from 'react';
import { connect } from 'react-redux';

// Component
import { AuthSideMenuView } from '..';

/*
*            Props Name        Description                                     Value
*@props -->  props name here   description here                                Value Type Here
*
*/

class SideMenuContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const {} = this.props;

    return <AuthSideMenuView />;
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
});

export default SideMenuContainer;
