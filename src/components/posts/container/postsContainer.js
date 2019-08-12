import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Component
import PostsView from '../view/postsView';

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
    const {
      changeForceLoadPostState,
      currentAccount,
      feedPosts,
      filterOptions,
      forceLoadPost,
      getFor,
      handleOnScroll,
      isConnected,
      isHideImages,
      pageType,
      selectedOptionIndex,
      tag,
      isLoginDone,
      isLoggedIn,
      isDarkTheme,
      nsfw,
    } = this.props;
    const { promotedPosts } = this.state;

    return (
      <PostsView
        changeForceLoadPostState={changeForceLoadPostState}
        currentAccountUsername={get(currentAccount, 'name', '')}
        feedPosts={feedPosts}
        filterOptions={filterOptions}
        forceLoadPost={forceLoadPost}
        getFor={getFor}
        handleOnScroll={handleOnScroll}
        hanldeImagesHide={this._handleImagesHide}
        hidePostsThumbnails={hidePostsThumbnails}
        isConnected={isConnected}
        isHideImage={isHideImages}
        pageType={pageType}
        promotedPosts={promotedPosts}
        selectedOptionIndex={selectedOptionIndex}
        setFeedPosts={this._setFeedPosts}
        tag={tag}
        isLoginDone={isLoginDone}
        isLoggedIn={isLoggedIn}
        isDarkTheme={isDarkTheme}
        nsfw={nsfw}
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
