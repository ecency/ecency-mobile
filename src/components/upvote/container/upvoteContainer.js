import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

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

    const author = get(content, 'author');
    const isVoted = get(content, 'is_voted');
    const totalPayout = get(content, 'total_payout');
    const isDecinedPayout = get(content, 'is_declined_payout');
    const permlink = get(content, 'permlink');
    const pendingPayout = parseToken(get(content, 'pending_payout_value', 0)).toFixed(3);
    const promotedPayout = parseToken(get(content, 'promoted', 0)).toFixed(3);
    const authorPayout = parseToken(get(content, 'total_payout_value', 0)).toFixed(3);
    const curationPayout = parseToken(get(content, 'curator_payout_value', 0)).toFixed(3);
    const payoutDate = getTimeFromNow(
      isEmptyContentDate(get(content, 'last_payout'))
        ? get(content, 'cashout_time')
        : get(content, 'last_payout'),
    );

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
