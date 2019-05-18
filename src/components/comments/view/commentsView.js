import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

// Components
import { Comment } from '../../comment';

// Styles
// import styles from './commentStyles';

class CommentsView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _keyExtractor = item => item.permlink;

  render() {
    const {
      mainAuthor,
      avatarSize,
      commentCount,
      commentNumber,
      comments,
      currentAccountUsername,
      fetchPost,
      handleOnEditPress,
      handleOnReplyPress,
      handleOnUserPress,
      isLoggedIn,
      isShowSubComments,
      marginLeft,
      handleDeleteComment,
    } = this.props;

    return (
      <FlatList
        data={comments}
        keyExtractor={this._keyExtractor}
        renderItem={({ item }) => (
          <Comment
            mainAuthor={mainAuthor}
            avatarSize={avatarSize}
            comment={item}
            commentCount={commentCount || item.children}
            commentNumber={commentNumber}
            handleDeleteComment={handleDeleteComment}
            currentAccountUsername={currentAccountUsername}
            fetchPost={fetchPost}
            handleOnEditPress={handleOnEditPress}
            handleOnReplyPress={handleOnReplyPress}
            handleOnUserPress={handleOnUserPress}
            isLoggedIn={isLoggedIn}
            isShowMoreButton={commentNumber === 1 && item.children > 0}
            voteCount={item.net_votes}
            isShowSubComments={isShowSubComments}
            key={item.permlink}
            marginLeft={marginLeft}
          />
        )}
      />
    );
  }
}

export default CommentsView;
