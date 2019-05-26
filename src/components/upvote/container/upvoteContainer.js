import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Realm
import { setUpvotePercent } from '../../../realm/realm';

// Services and Actions
import { setUpvotePercent as upvoteAction } from '../../../redux/actions/applicationActions';

// Utils
import parseToken from '../../../utils/parseToken';
import { isEmptyContentDate, getTimeFromNow } from '../../../utils/time';

// Component
import UpvoteView from '../view/upvoteView';

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

  _setUpvotePercent = value => {
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
      pinCode,
      upvotePercent,
      globalProps,
    } = this.props;
    let author;
    let authorPayout;
    let curationPayout;
    let isDecinedPayout;
    let isVoted;
    let payoutDate;
    let pendingPayout;
    let permlink;
    let promotedPayout;
    let totalPayout;

    if (content) {
      ({ author } = content);
      isVoted = content.is_voted;
      totalPayout = content.total_payout;
      isDecinedPayout = content.is_declined_payout;
      ({ permlink } = content);
      pendingPayout = parseToken(content.pending_payout_value).toFixed(3);
      promotedPayout = parseToken(content.promoted).toFixed(3);
      authorPayout = parseToken(content.total_payout_value).toFixed(3);
      curationPayout = parseToken(content.curator_payout_value).toFixed(3);
      payoutDate = getTimeFromNow(
        isEmptyContentDate(content.last_payout) ? content.cashout_time : content.last_payout,
      );
    }

    return (
      <UpvoteView
        author={author}
        authorPayout={authorPayout}
        curationPayout={curationPayout}
        currentAccount={currentAccount}
        fetchPost={fetchPost}
        globalProps={globalProps}
        handleSetUpvotePercent={this._setUpvotePercent}
        isDecinedPayout={isDecinedPayout}
        isLoggedIn={isLoggedIn}
        isShowPayoutValue={isShowPayoutValue}
        isVoted={isVoted}
        payoutDate={payoutDate}
        pendingPayout={pendingPayout}
        permlink={permlink}
        pinCode={pinCode}
        promotedPayout={promotedPayout}
        totalPayout={totalPayout}
        upvotePercent={upvotePercent}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  upvotePercent: state.application.upvotePercent,
  pinCode: state.account.pin,
  currentAccount: state.account.currentAccount,
  globalProps: state.account.globalProps,
});

export default connect(mapStateToProps)(UpvoteContainer);
