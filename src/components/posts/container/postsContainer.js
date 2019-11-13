import React from 'react';
import { connect, useDispatch } from 'react-redux';

// Component
import PostsView from '../view/postsView';

// Container
import { AccountContainer } from '../../../containers';

// Actions
import { setFeedPosts } from '../../../redux/actions/postsAction';
import { hidePostsThumbnails } from '../../../redux/actions/uiAction';

const PostsContainer = ({
  changeForceLoadPostState,
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
  nsfw,
  filterOptionsValue,
  customOption,
}) => {
  const dispatch = useDispatch();

  const _setFeedPosts = posts => {
    dispatch(setFeedPosts(posts));
  };

  const _handleImagesHide = () => {
    dispatch(hidePostsThumbnails(!isHideImages));
  };

  return (
    <AccountContainer>
      {({ username, isLoggedIn, isLoginDone }) => (
        <PostsView
          changeForceLoadPostState={changeForceLoadPostState}
          currentAccountUsername={username}
          feedPosts={feedPosts}
          filterOptions={filterOptions}
          forceLoadPost={forceLoadPost}
          getFor={getFor}
          handleImagesHide={_handleImagesHide}
          handleOnScroll={handleOnScroll}
          hidePostsThumbnails={hidePostsThumbnails}
          isConnected={isConnected}
          isHideImage={isHideImages}
          isLoggedIn={isLoggedIn}
          isLoginDone={isLoginDone}
          nsfw={nsfw}
          pageType={pageType}
          selectedOptionIndex={selectedOptionIndex}
          setFeedPosts={_setFeedPosts}
          tag={tag}
          filterOptionsValue={filterOptionsValue}
          customOption={customOption}
        />
      )}
    </AccountContainer>
  );
};

const mapStateToProps = state => ({
  nsfw: state.application.nsfw,
  feedPosts: state.posts.feedPosts,
  isConnected: state.application.isConnected,
  isHideImages: state.ui.hidePostsThumbnails,
});

export default connect(mapStateToProps)(PostsContainer);
