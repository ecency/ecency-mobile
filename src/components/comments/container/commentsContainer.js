import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { getComments, deleteComment } from '../../../providers/steem/dsteem';
// Services and Actions
import { writeToClipboard } from '../../../utils/clipboard';
import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
import ROUTES from '../../../constants/routeNames';

// Component
import CommentsView from '../view/commentsView';

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

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { commentCount, selectedFilter } = this.props;

    if (nextProps.commentCount > commentCount) {
      this._getComments();
    }

    if (selectedFilter !== get(nextProps, 'selectedFilter') && get(nextProps, 'selectedFilter')) {
      const shortedComments = this._shortComments(get(nextProps, 'selectedFilter'));
      this.setState({ comments: shortedComments });
    }
  }

  // Component Functions

  _shortComments = (sortOrder, comments) => {
    const { comments: parent } = this.state;

    const sortedComments = comments || parent;

    const allPayout = c =>
      parseFloat(get(c, 'pending_payout_value').split(' ')[0]) +
      parseFloat(get(c, 'total_payout_value').split(' ')[0]) +
      parseFloat(get(c, 'curator_payout_value').split(' ')[0]);

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
        const keyA = get(a, 'author_reputation');
        const keyB = get(b, 'author_reputation');

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

        const keyA = Date.parse(get(a, 'created'));
        const keyB = Date.parse(get(b, 'created'));

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;

        return 0;
      },
    };

    sortedComments.sort(sortOrders[sortOrder]);

    return sortedComments;
  };

  _getComments = async () => {
    const {
      author,
      permlink,
      selectedFilter,
      currentAccount: { name },
      isOwnProfile,
      fetchPost,
    } = this.props;

    if (isOwnProfile) {
      fetchPost();
    } else if (author && permlink) {
      await getComments(author, permlink, name)
        .then(comments => {
          if (selectedFilter && selectedFilter !== 'TRENDING') {
            const sortComments = this._shortComments(selectedFilter, comments);
            this.setState({
              comments: sortComments,
            });
          } else {
            this.setState({
              comments,
            });
          }
        })
        .catch(() => {});
    }
  };

  _handleOnReplyPress = item => {
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

  _handleOnVotersPress = activeVotes => {
    const { navigation, content } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
      key: get(content, 'permlink'),
    });
  };

  _handleOnEditPress = item => {
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

  _handleDeleteComment = permlink => {
    const { currentAccount, pinCode, comments } = this.props;
    const { comments: _comments } = this.state;
    let filteredComments;

    deleteComment(currentAccount, pinCode, permlink).then(() => {
      if (_comments.length > 0) {
        filteredComments = _comments.filter(item => item.permlink !== permlink);
      } else {
        filteredComments = comments.filter(item => item.permlink !== permlink);
      }
      this.setState({ comments: filteredComments });
    });
  };

  _handleOnPressCommentMenu = (index, selectedComment) => {
    const { dispatch, intl, navigation, isOwnProfile } = this.props;

    if (index === 0) {
      writeToClipboard(`https://esteem.app${get(selectedComment, 'url')}`).then(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.copied',
            }),
          ),
        );
      });
    } else if (index === 1 && isOwnProfile) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        key: get(selectedComment, 'permlink'),
        params: {
          author: get(selectedComment, 'author'),
          permlink: get(selectedComment, 'permlink'),
        },
      });
    }
  };

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
      isOwnProfile,
      isHideImage,
      isShowSubComments,
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
        comments={_comments.length > 0 ? _comments : comments}
        currentAccountUsername={currentAccount.name}
        handleOnEditPress={this._handleOnEditPress}
        handleOnReplyPress={this._handleOnReplyPress}
        isLoggedIn={isLoggedIn}
        fetchPost={fetchPost}
        handleDeleteComment={this._handleDeleteComment}
        handleOnPressCommentMenu={this._handleOnPressCommentMenu}
        isOwnProfile={isOwnProfile}
        isHideImage={isHideImage}
        handleOnVotersPress={this._handleOnVotersPress}
        isShowSubComments={isShowSubComments}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(CommentsContainer)));
