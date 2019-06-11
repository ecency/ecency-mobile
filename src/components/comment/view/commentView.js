import React, { PureComponent, Fragment } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { injectIntl } from 'react-intl';

import { getTimeFromNow } from '../../../utils/time';
// Constants

// Components
import { PostBody, PostHeaderDescription } from '../../postElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';
import { Comments } from '../../comments';
import { TextWithIcon } from '../../basicUIElements';

// Styles
import styles from './commentStyles';

class CommentView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isShowSubComments: props.isShowSubComments || false,
      isPressedShowButton: false,
    };
  }

  // Component Life Cycles
  // Component Functions

  _showSubCommentsToggle = () => {
    const { isShowSubComments } = this.state;

    this.setState({ isShowSubComments: !isShowSubComments, isPressedShowButton: true });
  };

  render() {
    const {
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
      isLoggedIn,
      isShowComments,
      isShowMoreButton,
      marginLeft,
      voteCount,
      intl,
      mainAuthor = { mainAuthor },
    } = this.props;
    const { isShowSubComments, isPressedShowButton } = this.state;

    return (
      <TouchableWithoutFeedback onLongPress={handleOnLongPress}>
        <View>
          <PostHeaderDescription
            key={comment.permlink}
            date={getTimeFromNow(comment.created)}
            name={comment.author}
            reputation={comment.author_reputation}
            size={avatarSize || 24}
            currentAccountUsername={currentAccountUsername}
            isShowOwnerIndicator={mainAuthor === comment.author}
          />
          <View style={[{ marginLeft: marginLeft || 29 }, styles.bodyWrapper]}>
            <PostBody
              isComment
              handleOnUserPress={handleOnUserPress}
              body={comment.body}
              textSelectable={false}
            />
            <View style={styles.footerWrapper}>
              {isLoggedIn && (
                <Fragment>
                  <Upvote isShowPayoutValue content={comment} />
                  <IconButton
                    size={18}
                    iconStyle={styles.leftIcon}
                    iconType="MaterialIcons"
                    name="people"
                  />
                  <Text style={styles.voteCountText}>{voteCount}</Text>
                  <IconButton
                    size={18}
                    iconStyle={styles.leftIcon}
                    style={styles.leftButton}
                    name="reply"
                    onPress={() => handleOnReplyPress && handleOnReplyPress(comment)}
                    iconType="MaterialIcons"
                  />
                  {currentAccountUsername === comment.author && (
                    <Fragment>
                      <IconButton
                        size={18}
                        iconStyle={styles.leftIcon}
                        style={styles.leftButton}
                        name="create"
                        onPress={() => handleOnEditPress && handleOnEditPress(comment)}
                        iconType="MaterialIcons"
                      />
                      {!comment.children && !voteCount && (
                        <Fragment>
                          <IconButton
                            size={18}
                            iconStyle={styles.leftIcon}
                            style={styles.leftButton}
                            name="delete-forever"
                            onPress={() => this.ActionSheet.show()}
                            iconType="MaterialIcons"
                          />
                          <ActionSheet
                            ref={o => (this.ActionSheet = o)}
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
              {isShowMoreButton && (
                <View style={styles.rightButtonWrapper}>
                  <TextWithIcon
                    wrapperStyle={styles.rightButton}
                    iconName={isShowSubComments ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    textStyle={!isPressedShowButton && styles.moreText}
                    iconType="MaterialIcons"
                    isClickable
                    iconStyle={styles.iconStyle}
                    iconSize={16}
                    onPress={() => this._showSubCommentsToggle()}
                    text={!isPressedShowButton ? `${comment.children} more replies` : ''}
                  />
                </View>
              )}
            </View>
            {isShowSubComments && commentNumber > 0 && (
              <Comments
                isShowComments={isShowComments}
                commentNumber={commentNumber && commentNumber * 2}
                marginLeft={20}
                isShowSubComments={isShowSubComments}
                avatarSize={avatarSize || 16}
                author={comment.author}
                permlink={comment.permlink}
                commentCount={comment.children}
                isShowMoreButton={false}
                fetchPost={fetchPost}
                mainAuthor={mainAuthor}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default injectIntl(CommentView);
