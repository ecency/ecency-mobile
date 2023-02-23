import React, { useState, Fragment, useRef } from 'react';
import { FlatList, Text } from 'react-native';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { Comment, TextButton, UpvotePopover } from '../..';

// Styles
import styles from './commentStyles';
import { OptionsModal } from '../../atoms';
import { PostTypes } from '../../../constants/postTypes';

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
  marginLeft,
  showAllComments,
  hideManyCommentsButton,
  flatListProps,
  openReplyThread,
  fetchedAt,
  incrementRepliesCount,
  postContentView,
  isLoading,
}) => {
  const [selectedComment, setSelectedComment] = useState(null);
  const intl = useIntl();
  const commentMenu = useRef<any>();
  const upvotePopoverRef = useRef();

  const _openCommentMenu = (item) => {
    if (commentMenu.current) {
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

  const _onUpvotePress = (anchorRect, showPayoutDetails, content) => {
    if(upvotePopoverRef.current){
      upvotePopoverRef.current.showPopover({anchorRect, showPayoutDetails, content, postType:PostTypes.COMMENT})
    }
  }

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
        isHideImage={isHideImage}
        isLoggedIn={isLoggedIn}
        showAllComments={showAllComments}
        isShowSubComments={isShowSubComments}
        key={get(item, 'permlink')}
        marginLeft={marginLeft}
        handleOnLongPress={() => _openCommentMenu(item)}
        openReplyThread={() => _openReplyThread(item)}
        onUpvotePress={(anchorRect, showPayoutDetails) => _onUpvotePress(anchorRect, showPayoutDetails, item)}
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
      <FlatList
        style={{ ...styles.list, ...styleOerride }}
        contentContainerStyle={{ padding: 0 }}
        data={comments}
        renderItem={_renderItem}
        keyExtractor={(item) => get(item, 'permlink')}
        ListEmptyComponent={_renderEmptyContent()}
        ListHeaderComponent={postContentView}
        overScrollMode="never"
        {...flatListProps}
      />
      <OptionsModal
        ref={commentMenu}
        options={menuItems}
        title={get(selectedComment, 'summary')}
        cancelButtonIndex={3}
        onPress={_onMenuItemPress}
      />
      <UpvotePopover 
        ref={upvotePopoverRef}
      />
    </Fragment>
  );
};

export default CommentsView;
