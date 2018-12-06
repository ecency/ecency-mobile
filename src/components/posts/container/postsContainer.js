import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

// Component
import { PostsView } from '..';
import { PostCardPlaceHolder } from '../../basicUIElements';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const { currentAccount, isLoginDone } = this.props;

    if (!isLoginDone) {
      return (
        <Fragment>
          <PostCardPlaceHolder />
          <PostCardPlaceHolder />
        </Fragment>
      );
    }

    return (
      <PostsView
        currentAccountUsername={currentAccount && currentAccount.username}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  isLoginDone: state.application.isLoginDone,
});

export default connect(mapStateToProps)(PostsContainer);
