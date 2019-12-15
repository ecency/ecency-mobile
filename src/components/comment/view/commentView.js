import React, { Fragment, useState, useRef } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

import { getTimeFromNow } from '../../../utils/time';
// Constants

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
  marginLeft,
  voteCount,
  mainAuthor = { mainAuthor },
  isHideImage,
  showAllComments,
  isShowSubComments,
  hideManyCommentsButton,
}) => {
  const [_isShowSubComments, setIsShowSubComments] = useState(isShowSubComments || false);
  const [isPressedShowButton, setIsPressedShowButton] = useState(false);
  const intl = useIntl();
  const actionSheet = useRef(null);
  const _showSubCommentsToggle = () => {
    setIsShowSubComments(!_isShowSubComments);
    setIsPressedShowButton(true);
  };

  return (
    <TouchableWithoutFeedback onLongPress={handleOnLongPress}>
      <View style={styles.commentContainer}>
        <PostHeaderDescription
          key={comment.permlink}
          date={getTimeFromNow(comment.created)}
          name={comment.author}
          reputation={comment.author_reputation}
          size={avatarSize || 24}
          currentAccountUsername={currentAccountUsername}
          isShowOwnerIndicator={mainAuthor === comment.author}
          isHideImage={isHideImage}
        />
        <View style={[{ marginLeft: 29 }, styles.bodyWrapper]}>
          <CommentBody
            commentDepth={comment.depth}
            handleOnUserPress={handleOnUserPress}
            body={comment.body}
            textSelectable={false}
          />
          <View style={styles.footerWrapper}>
            {isLoggedIn && (
              <Fragment>
                <Upvote isShowPayoutValue content={comment} />
                <TextWithIcon
                  iconName="people"
                  iconSize={20}
                  wrapperStyle={styles.leftButton}
                  iconType="MaterialIcons"
                  isClickable
                  onPress={() =>
                    handleOnVotersPress &&
                    voteCount > 0 &&
                    handleOnVotersPress(get(comment, 'active_votes'))
                  }
                  text={voteCount}
                  textStyle={styles.voteCountText}
                />
                <IconButton
                  size={20}
                  iconStyle={styles.leftIcon}
                  style={styles.leftButton}
                  name="reply"
                  onPress={() => handleOnReplyPress && handleOnReplyPress(comment)}
                  iconType="MaterialIcons"
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
                    {!comment.children && !voteCount && (
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
                          onPress={index => {
                            index === 0 ? handleDeleteComment(comment.permlink) : null;
                          }}
                        />
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </Fragment>
            )}
            {!showAllComments && isShowMoreButton && (
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
                  text={!isPressedShowButton ? `${comment.children} more replies` : ''}
                />
              </View>
            )}
          </View>
          {_isShowSubComments && commentNumber > 0 && (
            <Comments
              isShowComments={isShowComments}
              commentNumber={commentNumber + 1}
              marginLeft={20}
              isShowSubComments={true}
              avatarSize={avatarSize || 16}
              author={comment.author}
              permlink={comment.permlink}
              commentCount={comment.children}
              isShowMoreButton={false}
              hasManyComments={commentNumber === 5 && get(comment, 'children') > 0}
              fetchPost={fetchPost}
              hideManyCommentsButton={hideManyCommentsButton}
              mainAuthor={mainAuthor}
            />
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CommentView;
