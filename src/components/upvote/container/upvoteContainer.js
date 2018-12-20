import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Realm
import { setUpvotePercent } from '../../../realm/realm';

// Services and Actions
import { setUpvotePercent as upvoteAction } from '../../../redux/actions/applicationActions';

// Component
import { UpvoteView } from '..';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class UpvoteContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _setUpvotePercent = (value) => {
    const { dispatch } = this.props;

    if (value) {
      setUpvotePercent(String(value));
      dispatch(upvoteAction(value));
    }
  };

  render() {
    const {
      content,
      currentAccount,
      fetchPost,
      isLoggedIn,
      isShowPayoutValue,
      upvotePercent,
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
        fetchPost={fetchPost}
        handleSetUpvotePercent={this._setUpvotePercent}
        isLoggedIn={isLoggedIn}
        isShowPayoutValue={isShowPayoutValue}
        isVoted={isVoted}
        pendingPayoutValue={pendingPayoutValue}
        permlink={permlink}
        upvotePercent={upvotePercent}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  upvotePercent: state.application.upvotePercent,

  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(UpvoteContainer);
