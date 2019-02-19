import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
// Services and Actions
import { getPost } from '../../../providers/steem/dsteem';

// Component
import PostScreen from '../screen/postScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  content           which is include all post data                  Object
 *
 */

class PostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      error: null,
      isNewPost: false,
      isNotification: false,
      parentPost: null,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { navigation } = this.props;
    const {
      content, permlink, author, isNewPost, isNotification,
    } = navigation.state && navigation.state.params;

    if (isNewPost) this.setState({ isNewPost });

    if (content) {
      this.setState({ post: content });
    } else if (author && permlink) {
      this._loadPost(author, permlink);

      if (isNotification) this.setState({ isNotification });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { navigation } = this.props;
    const { isFetch: nextIsFetch } = nextProps.navigation.state && nextProps.navigation.state.params;

    if (nextIsFetch) {
      const { author, permlink } = navigation.state && navigation.state.params;

      this._loadPost(author, permlink);
    }
  }

  // Component Functions

  _loadPost = async (author = null, permlink = null, isParentPost = false) => {
    const { currentAccount, isLoggedIn } = this.props;
    const { post } = this.state;

    const _author = author || post.author;
    const _permlink = permlink || post.permlink;

    await getPost(_author, _permlink, isLoggedIn && currentAccount.username)
      .then((result) => {
        if (result) {
          if (isParentPost) {
            this.setState({ parentPost: result });
          } else {
            this.setState({ post: result });
          }
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  render() {
    const { currentAccount, isLoggedIn } = this.props;
    const {
      error, isNewPost, parentPost, post, isNotification,
    } = this.state;

    if (isNotification && post) this._loadPost(post.parent_author, post.parent_permlink, true);

    return (
      <PostScreen
        currentAccount={currentAccount}
        error={error}
        fetchPost={this._loadPost}
        isFetchComments
        isLoggedIn={isLoggedIn}
        isNewPost={isNewPost}
        parentPost={parentPost}
        post={post}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(mapStateToProps)(withNavigation(PostContainer));
