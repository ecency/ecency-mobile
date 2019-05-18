import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import { getComments, deleteComment } from '../../../providers/steem/dsteem';

// Services and Actions

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Component
import { CommentsView } from '..';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class CommentsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._getComments();
  }

  componentWillReceiveProps(nextProps) {
    const { commentCount, selectedFilter } = this.props;

    if (nextProps.commentCount > commentCount) {
      this._getComments();
    }

    if (selectedFilter !== nextProps.selectedFilter && nextProps.selectedFilter) {
      const shortedComments = this._shortComments(nextProps.selectedFilter);
      this.setState({ comments: shortedComments });
    }
  }

  // Component Functions

  _shortComments = (sortOrder) => {
    const { comments: parent } = this.state;

    const allPayout = c => parseFloat(c.pending_payout_value.split(' ')[0])
      + parseFloat(c.total_payout_value.split(' ')[0])
      + parseFloat(c.curator_payout_value.split(' ')[0]);

    const absNegative = a => a.net_rshares < 0;

    const sortOrders = {
      TRENDING: (a, b) => {
        if (absNegative(a)) {
          return 1;
        }

        if (absNegative(b)) {
          return -1;
        }

        const apayout = allPayout(a);
        const bpayout = allPayout(b);
        if (apayout !== bpayout) {
          return bpayout - apayout;
        }

        return 0;
      },
      REPUTATION: (a, b) => {
        const keyA = a.author_reputation;
        const keyB = b.author_reputation;

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      },
      VOTES: (a, b) => {
        const keyA = a.net_votes;
        const keyB = b.net_votes;

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      },
      AGE: (a, b) => {
        if (absNegative(a)) {
          return 1;
        }

        if (absNegative(b)) {
          return -1;
        }

        const keyA = Date.parse(a.created);
        const keyB = Date.parse(b.created);

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      },
    };

    parent.sort(sortOrders[sortOrder]);

    return parent;
  };

  _getComments = () => {
    const { author, permlink } = this.props;

    getComments(author, permlink).then((comments) => {
      this.setState({
        comments,
      });
    });
  };

  _handleOnReplyPress = (item) => {
    const { navigation, fetchPost } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isReply: true,
        post: item,
        fetchPost,
      },
    });
  };

  _handleOnEditPress = (item) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isEdit: true,
        isReply: true,
        post: item,
        fetchPost: this._getComments,
      },
    });
  };

  _handleDeleteComment = (permlink) => {
    const { currentAccount, pinCode } = this.props;

    deleteComment(currentAccount, pinCode, permlink).then(() => {
      this._getComments();
    });
  }

  render() {
    const { comments: _comments, selectedPermlink } = this.state;
    const {
      isLoggedIn,
      commentCount,
      author,
      currentAccount,
      commentNumber,
      comments,
      fetchPost,
      isShowMoreButton,
      selectedFilter,
      mainAuthor,
      selectedPermlink: _selectedPermlink,
    } = this.props;

    return (
      <CommentsView
        key={selectedFilter}
        selectedFilter={selectedFilter}
        selectedPermlink={_selectedPermlink || selectedPermlink}
        author={author}
        mainAuthor={mainAuthor}
        isShowMoreButton={isShowMoreButton}
        commentNumber={commentNumber || 1}
        commentCount={commentCount}
        comments={_comments || comments}
        currentAccountUsername={currentAccount.name}
        handleOnEditPress={this._handleOnEditPress}
        handleOnReplyPress={this._handleOnReplyPress}
        isLoggedIn={isLoggedIn}
        fetchPost={fetchPost}
        handleDeleteComment={this._handleDeleteComment}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.account.pin,
});

export default withNavigation(connect(mapStateToProps)(CommentsContainer));
