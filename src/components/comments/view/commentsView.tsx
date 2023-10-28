import React, { useState, Fragment, useRef } from 'react';
import { Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { Comment, TextButton, UpvotePopover } from '../..';

// Styles
import styles from './commentStyles';
import { OptionsModal } from '../../atoms';
import { PostTypes } from '../../../constants/postTypes';
import { PostHtmlInteractionHandler } from '../../postHtmlRenderer';

const CommentsView = ({
  avatarSize,
  commentCount,
  commentNumber,
  comments,
  currentAccountUsername,
  fetchPost,
  handleDeleteComment,
  handleOnEditPress,
  handleOnPressCommentMenu,
  handleOnReplyPress,
  handleOnUserPress,
  handleOnVotersPress,
  hasManyComments,
  isHideImage,
  isLoggedIn,
  isShowSubComments,
  mainAuthor,
  handleOnOptionsPress,
  marginLeft,
  showAllComments,
  hideManyCommentsButton,
  flatListProps,
  openReplyThread,
  fetchedAt,
  incrementRepliesCount,
  postContentView,
  isLoading,
  postType
}) => {
  const [selectedComment, setSelectedComment] = useState(null);
  const intl = useIntl();
  const commentMenu = useRef<any>();
  const upvotePopoverRef = useRef();
  const postInteractionRef = useRef(null);

  const _openCommentMenu = (item) => {

    if (handleOnOptionsPress) {
      handleOnOptionsPress(item);
    } else if (commentMenu.current) {
      setSelectedComment(item);
      commentMenu.current.show();
    }
  };

  const _openReplyThread = (item) => {
    if (item && openReplyThread) {
      openReplyThread(item);
    }
  };

  const _readMoreComments = () => {
    if (comments[0] && openReplyThread) {
      openReplyThread(comments[0]);
    }
  };

  const _onMenuItemPress = (index) => {
    handleOnPressCommentMenu(index, selectedComment);
    setSelectedComment(null);
  };

  const _onUpvotePress = ({ content, anchorRect, showPayoutDetails, onVotingStart }) => {
    if (upvotePopoverRef.current) {

      const postType = content.parent_author === 'ecency.waves' ? PostTypes.WAVE : PostTypes.COMMENT;

      upvotePopoverRef.current.showPopover({
        anchorRect,
        showPayoutDetails,
        content,
        postType,
        onVotingStart,
      });
    }
  };

  const menuItems = [
    intl.formatMessage({ id: 'post.copy_link' }),
    intl.formatMessage({ id: 'post.copy_text' }),
    intl.formatMessage({ id: 'post.open_thread' }),
    intl.formatMessage({ id: 'alert.cancel' }),
  ];

  if (!hideManyCommentsButton && hasManyComments) {
    return (
      <TextButton
        style={styles.moreRepliesButtonWrapper}
        textStyle={styles.moreRepliesText}
        onPress={() => _readMoreComments()}
        text={intl.formatMessage({ id: 'comments.read_more' })}
      />
    );
  }

  const _renderItem = ({ item }) => {
    return (
      <Comment
        mainAuthor={mainAuthor}
        avatarSize={avatarSize}
        hideManyCommentsButton={hideManyCommentsButton}
        comment={item}
        commentCount={commentCount || get(item, 'children')}
        commentNumber={commentNumber}
        handleDeleteComment={handleDeleteComment}
        currentAccountUsername={currentAccountUsername}
        fetchPost={fetchPost}
        handleOnEditPress={handleOnEditPress}
        handleOnReplyPress={handleOnReplyPress}
        handleOnUserPress={handleOnUserPress}
        handleOnVotersPress={handleOnVotersPress}
        handleImagePress={postInteractionRef.current?.handleImagePress}
        handleLinkPress={postInteractionRef.current?.handleLinkPress}
        handleVideoPress={postInteractionRef.current?.handleVideoPress}
        handleYoutubePress={postInteractionRef.current?.handleYoutubePress}
        isHideImage={isHideImage}
        isLoggedIn={isLoggedIn}
        showAllComments={showAllComments}
        isShowSubComments={isShowSubComments}
        marginLeft={marginLeft}
        handleOnLongPress={() => _openCommentMenu(item)}
        openReplyThread={() => _openReplyThread(item)}
        onUpvotePress={_onUpvotePress}
        fetchedAt={fetchedAt}
        incrementRepliesCount={incrementRepliesCount}
      />
    );
  };

  const styleOerride =
    commentNumber > 1
      ? {
        backgroundColor: EStyleSheet.value('$primaryLightBackground'),
        marginTop: 8,
      }
      : null;

  const _renderEmptyContent = () => {
    if (isLoading || commentNumber > 1) {
      return;
    }
    const _onPress = () => {
      handleOnReplyPress();
    };
    return (
      <Text onPress={_onPress} style={styles.emptyText}>
        {intl.formatMessage({ id: 'comments.no_comments' })}
      </Text>
    );
  };

  return (
    <Fragment>
      <FlashList
        contentContainerStyle={{ padding: 0, ...styles.list, ...styleOerride,  }}
        data={comments}
        keyExtractor={(item) => item.author + item.permlink}
        renderItem={_renderItem}
        ListEmptyComponent={_renderEmptyContent()}
        ListHeaderComponent={postContentView}
        overScrollMode="never"
        onEndReachedThreshold={1}
        maxToRenderPerBatch={7}
        initialNumToRender={5}
        estimatedItemSize={100}
        windowSize={10}
        {...flatListProps}
      />
      {!handleOnOptionsPress && (
        <OptionsModal
          ref={commentMenu}
          options={menuItems}
          title={get(selectedComment, 'summary')}
          cancelButtonIndex={3}
          onPress={_onMenuItemPress}
        />
      )}
      <UpvotePopover ref={upvotePopoverRef} />
      <PostHtmlInteractionHandler ref={postInteractionRef} postType={postType} />
    </Fragment>
  );
};

export default CommentsView;
