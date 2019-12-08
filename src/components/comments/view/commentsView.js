import React, { useState, Fragment, useRef } from 'react';
import { FlatList } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import get from 'lodash/get';
import { useIntl } from 'react-intl';
import { navigate } from '../../../navigation/service';

// Components
import { Comment, TextButton } from '../..';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './commentStyles';

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
  isOwnProfile,
  isShowSubComments,
  mainAuthor,
  marginLeft,
  isShowMoreButton,
  showAllComments,
  hideManyCommentsButton,
}) => {
  const [selectedComment, setSelectedComment] = useState(null);
  const intl = useIntl();
  const commentMenu = useRef();

  const _keyExtractor = item => get(item, 'permlink');

  const _openCommentMenu = item => {
    setSelectedComment(item);
    commentMenu.current.show();
  };

  const _readMoreComments = () => {
    navigate({
      routeName: ROUTES.SCREENS.COMMENTS,
      params: { comments, fetchPost, handleOnVotersPress },
    });
  };

  const menuItems = isOwnProfile
    ? [
        intl.formatMessage({ id: 'post.copy_link' }),
        intl.formatMessage({ id: 'post.open_thread' }),
        intl.formatMessage({ id: 'alert.cancel' }),
      ]
    : [intl.formatMessage({ id: 'post.copy_link' }), intl.formatMessage({ id: 'alert.cancel' })];

  if (!hideManyCommentsButton && hasManyComments) {
    return (
      <TextButton
        style={styles.moreRepliesButtonWrapper}
        textStyle={styles.moreRepliesText}
        onPress={() => _readMoreComments()}
        text="Read more comments"
      />
    );
  }

  return (
    <Fragment>
      <FlatList
        style={styles.list}
        data={comments}
        keyExtractor={_keyExtractor}
        renderItem={({ item }) => (
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
            isShowMoreButton={commentNumber === 1 && get(item, 'children') > 0}
            showAllComments={showAllComments}
            voteCount={get(item, 'vote_count')}
            isShowSubComments={isShowSubComments}
            key={get(item, 'permlink')}
            marginLeft={marginLeft}
            handleOnLongPress={() => _openCommentMenu(item)}
          />
        )}
      />
      <ActionSheet
        ref={commentMenu}
        options={menuItems}
        title={get(selectedComment, 'summary')}
        cancelButtonIndex={isOwnProfile ? 2 : 1}
        onPress={index => handleOnPressCommentMenu(index, selectedComment)}
      />
    </Fragment>
  );
};

export default CommentsView;
