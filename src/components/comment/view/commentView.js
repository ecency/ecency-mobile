import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';

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
    };
  }

  // Component Life Cycles
  // Component Functions

  _showSubCommentsToggle = () => {
    const { isShowSubComments } = this.state;

    this.setState({ isShowSubComments: !isShowSubComments });
  };

  render() {
    const {
      avatarSize,
      currentAccountUsername,
      handleOnEditPress,
      handleOnReplyPress,
      handleOnUserPress,
      isLoggedIn,
      marginLeft,
      isShowMoreButton,
      comment,
      commentNumber,
      fetchPost,
      isShowComments,
    } = this.props;
    const { isShowSubComments } = this.state;

    return (
      <View style={{ marginLeft: marginLeft || 29 }}>
        <PostHeaderDescription
          key={comment.permlink}
          date={getTimeFromNow(comment.created)}
          name={comment.author}
          reputation={comment.author_reputation}
          size={avatarSize || 24}
        />
        <View style={[{ marginLeft: marginLeft || 29 }, styles.bodyWrapper]}>
          <PostBody isComment handleOnUserPress={handleOnUserPress} body={comment.body} />
          <View style={styles.footerWrapper}>
            {isLoggedIn && (
              <Fragment>
                <Upvote isShowPayoutValue content={comment} />
                <IconButton
                  size={18}
                  iconStyle={styles.leftIcon}
                  style={styles.leftButton}
                  name="reply"
                  onPress={() => handleOnReplyPress && handleOnReplyPress(comment)}
                  iconType="MaterialIcons"
                />
                {currentAccountUsername === comment.author && (
                  <IconButton
                    size={18}
                    iconStyle={styles.leftIcon}
                    style={styles.leftButton}
                    name="create"
                    onPress={() => handleOnEditPress && handleOnEditPress(comment)}
                    iconType="MaterialIcons"
                  />
                )}
              </Fragment>
            )}
            {isShowMoreButton && (
              <View style={styles.rightButtonWrapper}>
                <TextWithIcon
                  wrapperStyle={styles.rightButton}
                  iconName={isShowSubComments ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  textStyle={styles.moreText}
                  iconType="MaterialIcons"
                  isClickable
                  iconStyle={styles.iconStyle}
                  iconSize={16}
                  onPress={() => this._showSubCommentsToggle()}
                  text={`${comment.children} more replies`}
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
            />
          )}
        </View>
      </View>
    );
  }
}

export default CommentView;
