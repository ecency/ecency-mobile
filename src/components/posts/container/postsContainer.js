import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Component
import PostsView from '../view/postsView';
import { PostCardPlaceHolder } from '../../basicUIElements';

// Actions
import { setFeedPosts } from '../../../redux/actions/postsAction';
import { hidePostsThumbnails } from '../../../redux/actions/uiAction';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostsContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      promotedPosts: [],
    };
  }

  // Component Life Cycle Functions

  // Component Functions

  _setFeedPosts = posts => {
    const { dispatch } = this.props;

    dispatch(setFeedPosts(posts));
  };

  _handleImagesHide = () => {
    const { dispatch, isHideImages } = this.props;

    dispatch(hidePostsThumbnails(!isHideImages));
  };

  render() {
    const { currentAccount, isLoginDone, tag, feedPosts, isConnected, isHideImages } = this.props;
    const { promotedPosts } = this.state;

    if (!isLoginDone && !tag) {
      return (
        <Fragment>
          <PostCardPlaceHolder />
          <PostCardPlaceHolder />
        </Fragment>
      );
    }

    return (
      <PostsView
        promotedPosts={promotedPosts}
        hidePostsThumbnails={hidePostsThumbnails}
        handleOnScrollStart={this._handleOnScrollStart}
        hanldeImagesHide={this._handleImagesHide}
        isHideImage={isHideImages}
        currentAccountUsername={
          currentAccount && (get(currentAccount, 'username') || get(currentAccount, 'name'))
        }
        setFeedPosts={this._setFeedPosts}
        feedPosts={feedPosts}
        isConnected={isConnected}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  isDarkTheme: state.application.isDarkTheme,
  isLoggedIn: state.application.isLoggedIn,
  isLoginDone: state.application.isLoginDone,
  nsfw: state.application.nsfw,
  feedPosts: state.posts.feedPosts,
  isConnected: state.application.isConnected,
  isHideImages: state.ui.hidePostsThumbnails,
});

export default connect(mapStateToProps)(PostsContainer);
