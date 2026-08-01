import React, { Fragment, useRef } from 'react';
import { Text } from 'react-native';
import get from 'lodash/get';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';

// Components
import { FlashList } from '@shopify/flash-list';
import { Comment, PostOptionsModal, TextButton, UpvotePopover } from '../..';
import { PostHtmlInteractionHandler } from '../../postHtmlRenderer';

// Styles
import styles from './commentStyles';
import { PostTypes } from '../../../constants/postTypes';
import { isWavesHost } from '../../../constants/waves';

const CommentsView = ({
  avatarSize,
  commentCount,
  commentNumber,
  comments,
  currentAccountUsername,
  fetchPost,
  handleDeleteComment,
  handleOnEditPress,
  handleOnReplyPress,
  handleOnUserPress,
  handleOnVotersPress,
  hasManyComments,
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
  postType,
  onTagPress,
  onAuthorPress,
}) => {
  const intl = useIntl();
  // Surfaces that pass `handleOnOptionsPress` (waves) route to their own sheet.
  // Everywhere else used to fall back to a four-item menu with no delete, edit,
  // report or moderation action; it now gets the same sheet the post detail
  // screen uses.
  const postOptionsModalRef = useRef<any>(null);
  const upvotePopoverRef = useRef();
  const postInteractionRef = useRef(null);

  const _openCommentMenu = (item) => {
    if (handleOnOptionsPress) {
      handleOnOptionsPress(item);
    } else if (postOptionsModalRef.current) {
      postOptionsModalRef.current.show(item);
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

  const _onUpvotePress = ({ content, sourceRef, showPayoutDetails, onVotingStart }) => {
    if (upvotePopoverRef.current) {
      const postType = isWavesHost(content.parent_author) ? PostTypes.WAVE : PostTypes.COMMENT;

      upvotePopoverRef.current.showPopover({
        sourceRef,
        showPayoutDetails,
        content,
        postType,
        onVotingStart,
      });
    }
  };

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
        handleParaSelection={postInteractionRef.current?.handleParaSelection}
        isLoggedIn={isLoggedIn}
        showAllComments={showAllComments}
        isShowSubComments={isShowSubComments}
        marginLeft={marginLeft}
        handleOnMenuPress={() => _openCommentMenu(item)}
        openReplyThread={() => _openReplyThread(item)}
        onUpvotePress={_onUpvotePress}
        fetchedAt={fetchedAt}
        incrementRepliesCount={incrementRepliesCount}
        onTagPress={onTagPress}
        onAuthorPress={onAuthorPress}
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
        contentContainerStyle={{ padding: 0, ...styleOerride }}
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
        <PostOptionsModal
          ref={postOptionsModalRef}
          isVisibleTranslateModal={true}
          onOpenThread={_openReplyThread}
        />
      )}
      <UpvotePopover ref={upvotePopoverRef} />
      <PostHtmlInteractionHandler ref={postInteractionRef} postType={postType} />
    </Fragment>
  );
};

export default CommentsView;
