import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';

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
      isHasParentPost: false,
      parentPost: null,
      isPostUnavailable: false,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { navigation } = this.props;
    const { content, permlink, author, isNewPost, isHasParentPost } = get(
      navigation,
      'state.params',
    );

    if (isNewPost) this.setState({ isNewPost });

    if (content) {
      this.setState({ post: content });
    } else if (author && permlink) {
      this._loadPost(author, permlink);
      this.setState({ author });
      if (isHasParentPost) this.setState({ isHasParentPost });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { navigation } = this.props;
    const { isFetch: nextIsFetch } = get(nextProps, 'navigation.state.params');

    if (nextIsFetch) {
      const { author, permlink } = get(navigation, 'state.params');

      this._loadPost(author, permlink);
    }
  }

  // Component Functions

  _loadPost = async (author = null, permlink = null, isParentPost = false) => {
    const { currentAccount, isLoggedIn } = this.props;
    const { post } = this.state;

    const _author = author || get(post, 'author');
    const _permlink = permlink || get(post, 'permlink');

    await getPost(_author, _permlink, isLoggedIn && get(currentAccount, 'username'))
      .then(result => {
        if (get(result, 'id', 0) > 0) {
          if (isParentPost) {
            this.setState({ parentPost: result });
          } else {
            this.setState({ post: result });
          }
        } else {
          this.setState({ isPostUnavailable: true });
        }
      })
      .catch(err => {
        this.setState({ error: err });
      });
  };

  render() {
    const { currentAccount, isLoggedIn } = this.props;
    const {
      error,
      isNewPost,
      parentPost,
      post,
      isHasParentPost,
      isPostUnavailable,
      author,
    } = this.state;

    if (isHasParentPost && post)
      this._loadPost(get(post, 'parent_author'), get(post, 'parent_permlink'), true);

    return (
      <PostScreen
        currentAccount={currentAccount}
        error={error}
        author={author}
        fetchPost={this._loadPost}
        isFetchComments
        isLoggedIn={isLoggedIn}
        isNewPost={isNewPost}
        parentPost={parentPost}
        post={post}
        isPostUnavailable={isPostUnavailable}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(mapStateToProps)(withNavigation(PostContainer));
