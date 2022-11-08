import React, { useState, Fragment, useRef } from 'react';
import { FlatList, Text } from 'react-native';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { Comment, TextButton } from '../..';

// Styles
import styles from './commentStyles';
import { OptionsModal } from '../../atoms';

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
}) => {
  const [selectedComment, setSelectedComment] = useState(null);
  const intl = useIntl();
  const commentMenu = useRef<any>();

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
    if (commentNumber > 1) {
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
        {...flatListProps}
      />
      <OptionsModal
        ref={commentMenu}
        options={menuItems}
        title={get(selectedComment, 'summary')}
        cancelButtonIndex={3}
        onPress={_onMenuItemPress}
      />
    </Fragment>
  );
};

export default CommentsView;
