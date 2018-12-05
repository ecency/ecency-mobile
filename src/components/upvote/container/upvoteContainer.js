import React, { Component } from 'react';
import { connect } from 'react-redux';

// Component
import { UpvoteView } from '..';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class UpvoteContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const {
      content, currentAccount, isLoggedIn, isShowPayoutValue,
    } = this.props;
    let author;
    let isVoted;
    let pendingPayoutValue;
    let permlink;

    if (content) {
      author = content.author;
      isVoted = content.is_voted;
      pendingPayoutValue = content.pending_payout_value;
      permlink = content.permlink;
    }

    return (
      <UpvoteView
        author={author}
        currentAccount={currentAccount}
        isLoggedIn={isLoggedIn}
        isShowPayoutValue={isShowPayoutValue}
        isVoted={isVoted}
        pendingPayoutValue={pendingPayoutValue}
        permlink={permlink}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,

  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(UpvoteContainer);
