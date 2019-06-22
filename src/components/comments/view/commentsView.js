import React, { PureComponent, Fragment } from 'react';
import { FlatList } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';

// Components
// eslint-disable-next-line import/no-cycle
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
    this.state = {
      selectedComment: null,
    };
    this.commentMenu = React.createRef();
  }

  // Component Life Cycles

  // Component Functions

  _keyExtractor = item => item.permlink;

  _openCommentMenu = item => {
    this.setState({ selectedComment: item });
    this.commentMenu.current.show();
  };

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
      handleCommentCopyAction,
      intl,
    } = this.props;
    const { selectedComment } = this.state;

    return (
      <Fragment>
        <FlatList
          data={comments}
          keyExtractor={this._keyExtractor}
          renderItem={({ item }) => (
            <Comment
              mainAuthor={mainAuthor}
              avatarSize={avatarSize}
              comment={item}
              commentCount={commentCount || get(item.children)}
              commentNumber={commentNumber}
              handleDeleteComment={handleDeleteComment}
              currentAccountUsername={currentAccountUsername}
              fetchPost={fetchPost}
              handleOnEditPress={handleOnEditPress}
              handleOnReplyPress={handleOnReplyPress}
              handleOnUserPress={handleOnUserPress}
              isLoggedIn={isLoggedIn}
              isShowMoreButton={commentNumber === 1 && get(item, 'children') > 0}
              voteCount={get(item, 'vote_count')}
              isShowSubComments={isShowSubComments}
              key={item.permlink}
              marginLeft={marginLeft}
              handleOnLongPress={() => this._openCommentMenu(item)}
            />
          )}
        />
        <ActionSheet
          ref={this.commentMenu}
          options={[
            intl.formatMessage({
              id: 'post.copy_link',
            }),
            intl.formatMessage({
              id: 'alert.cancel',
            }),
          ]}
          title={get(selectedComment, 'summary')}
          cancelButtonIndex={1}
          onPress={index => handleCommentCopyAction(index, selectedComment)}
        />
      </Fragment>
    );
  }
}

export default injectIntl(CommentsView);
