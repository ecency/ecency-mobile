import React, { Fragment, useState, useRef, useEffect } from 'react';
import { View } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

import { getTimeFromNow } from '../../../utils/time';
import { parseActiveVotes } from '../../../utils/postParser';
// Constants

// Actions
import { getActiveVotes } from '../../../providers/hive/dhive';

// Components
import { CommentBody, PostHeaderDescription } from '../../postElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';
import { Comments } from '../../comments';
import { TextWithIcon } from '../../basicUIElements';

// Styles
import styles from './commentStyles';

const CommentView = ({
  avatarSize,
  comment,
  commentNumber,
  currentAccountUsername,
  fetchPost,
  handleDeleteComment,
  handleOnEditPress,
  handleOnLongPress,
  handleOnReplyPress,
  handleOnUserPress,
  handleOnVotersPress,
  isLoggedIn,
  isShowComments,
  isShowMoreButton,
  mainAuthor = { mainAuthor },
  isHideImage,
  showAllComments,
  isShowSubComments,
  hideManyCommentsButton,
  openReplyThread,
}) => {
  const [_isShowSubComments, setIsShowSubComments] = useState(isShowSubComments || false);
  const [isPressedShowButton, setIsPressedShowButton] = useState(false);
  const [activeVotes, setActiveVotes] = useState([]);

  const intl = useIntl();
  const actionSheet = useRef(null);

  useEffect(() => {
    if (comment) {
      setActiveVotes(get(comment, 'active_votes', []));
    }
  }, [comment]);

  const _showSubCommentsToggle = () => {
    setIsShowSubComments(!_isShowSubComments);
    setIsPressedShowButton(true);
  };


  const _renderReadMoreButton = () => (
    <TextWithIcon
      wrapperStyle={styles.rightButton}
      textStyle={!isPressedShowButton && styles.moreText}
      iconType="MaterialIcons"
      isClickable
      iconStyle={styles.iconStyle}
      iconSize={16}
      onPress={() => openReplyThread && openReplyThread()}
      text={
        !isPressedShowButton
          ? intl.formatMessage({ id: 'comments.read_more' })
          : ''
      }
    />

 )

  const _renderReplies = () => {
    return (
      <Comments
        isShowComments={isShowComments}
        commentNumber={commentNumber + 1}
        marginLeft={20}
        isShowSubComments={true}
        avatarSize={avatarSize || 24}
        author={comment.author}
        permlink={comment.permlink}
        commentCount={comment.children}
        comments={comment.replies}
        isShowMoreButton={false}
        hasManyComments={commentNumber === 5 && get(comment, 'children') > 0}
        fetchPost={fetchPost}
        hideManyCommentsButton={hideManyCommentsButton}
        mainAuthor={mainAuthor}
      />
    )
  }

  return (
    <Fragment>
      <View style={styles.commentContainer}>
        <PostHeaderDescription
          key={comment.permlink}
          date={getTimeFromNow(comment.created)}
          name={comment.author}
          reputation={comment.author_reputation}
          size={avatarSize || 40}
          currentAccountUsername={currentAccountUsername}
          isShowOwnerIndicator={mainAuthor === comment.author}
          isHideImage={isHideImage}
          inlineTime={true}
        />
        <View style={[{ marginLeft: 34 }, styles.bodyWrapper]}>
          <CommentBody
            commentDepth={comment.depth}
            reputation={comment.author_reputation}
            handleOnUserPress={handleOnUserPress}
            handleOnLongPress={handleOnLongPress}
            body={comment.body}
            created={comment.created}
            key={`key-${comment.permlink}`}
            textSelectable={true}
          />
          <View style={styles.footerWrapper}>
            {isLoggedIn && (
              <Fragment>
                <Upvote activeVotes={activeVotes} isShowPayoutValue content={comment} />
                <TextWithIcon
                  iconName="heart-outline"
                  iconSize={20}
                  wrapperStyle={styles.leftButton}
                  iconType="MaterialCommunityIcons"
                  isClickable
                  onPress={() =>
                    handleOnVotersPress &&
                    activeVotes.length > 0 &&
                    handleOnVotersPress(activeVotes, comment)
                  }
                  text={activeVotes.length}
                  textStyle={styles.voteCountText}
                />
                <IconButton
                  size={20}
                  iconStyle={styles.leftIcon}
                  style={styles.leftButton}
                  name="comment-outline"
                  onPress={() => handleOnReplyPress && handleOnReplyPress(comment)}
                  iconType="MaterialCommunityIcons"
                />
                <IconButton
                  size={20}
                  iconStyle={styles.leftIcon}
                  style={styles.leftButton}
                  name="dots-horizontal"
                  onPress={() => handleOnLongPress && handleOnLongPress()}
                  iconType="MaterialCommunityIcons"
                />
                {currentAccountUsername === comment.author && (
                  <Fragment>
                    <IconButton
                      size={20}
                      iconStyle={styles.leftIcon}
                      style={styles.leftButton}
                      name="create"
                      onPress={() => handleOnEditPress && handleOnEditPress(comment)}
                      iconType="MaterialIcons"
                    />
                    {!comment.children && !activeVotes.length && (
                      <Fragment>
                        <IconButton
                          size={20}
                          iconStyle={styles.leftIcon}
                          style={styles.leftButton}
                          name="delete-forever"
                          onPress={() => actionSheet.current.show()}
                          iconType="MaterialIcons"
                        />
                        <ActionSheet
                          ref={actionSheet}
                          options={[
                            intl.formatMessage({ id: 'alert.delete' }),
                            intl.formatMessage({ id: 'alert.cancel' }),
                          ]}
                          title={intl.formatMessage({ id: 'alert.delete' })}
                          destructiveButtonIndex={0}
                          cancelButtonIndex={1}
                          onPress={(index) => {
                            index === 0 ? handleDeleteComment(comment.permlink) : null;
                          }}
                        />
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </Fragment>
            )}
            
            {isShowMoreButton && (
              <View style={styles.rightButtonWrapper}>
                <TextWithIcon
                  wrapperStyle={styles.rightButton}
                  iconName={_isShowSubComments ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  textStyle={!isPressedShowButton && styles.moreText}
                  iconType="MaterialIcons"
                  isClickable
                  iconStyle={styles.iconStyle}
                  iconSize={16}
                  onPress={() => _showSubCommentsToggle()}
                  text={
                    !isPressedShowButton
                      ? `${comment.children} ${intl.formatMessage({ id: 'comments.more_replies' })}`
                      : ''
                  }
                />
              </View>
            )}

            {/* { comment.children > 0 && !comment.replies?.length && (
              <View style={styles.rightButtonWrapper}>
                <TextWithIcon
                  wrapperStyle={styles.rightButton}
                  textStyle={!isPressedShowButton && styles.moreText}
                  iconType="MaterialIcons"
                  isClickable
                  iconStyle={styles.iconStyle}
                  iconSize={16}
                  onPress={() => openReplyThread && openReplyThread()}
                  text={
                    !isPressedShowButton
                      ? intl.formatMessage({ id: 'post.open_thread' })
                      : ''
                  }
                />
             </View>
             )
            } */}
          </View>
            { comment.children > 0 && !comment.replies?.length && _renderReadMoreButton() }

          {_isShowSubComments && commentNumber > 0 && _renderReplies()}
        </View>
      </View>
    </Fragment>
  );
};

export default CommentView;
