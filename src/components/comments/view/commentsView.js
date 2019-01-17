import React, { PureComponent } from 'react';
import { View, FlatList } from 'react-native';

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
  _handleOnDropdownSelect = () => {};

  _keyExtractor = item => item.permlink;

  render() {
    const {
      avatarSize,
      commentNumber,
      comments,
      currentAccountUsername,
      handleOnEditPress,
      handleOnReplyPress,
      handleOnUserPress,
      isLoggedIn,
      marginLeft,
      isShowSubComments,
      fetchPost,
      commentCount,
    } = this.props;

    return (
      <FlatList
        data={comments}
        keyExtractor={this._keyExtractor}
        renderItem={({ item, index }) => (
          <View key={index}>
            <Comment
              isShowMoreButton={commentNumber === 1 && item.children > 0}
              comment={item}
              marginLeft={marginLeft}
              commentNumber={commentNumber}
              fetchPost={fetchPost}
              commentCount={commentCount || item.children}
              isShowSubComments={isShowSubComments}
              avatarSize={avatarSize}
              currentAccountUsername={currentAccountUsername}
              handleOnReplyPress={handleOnReplyPress}
              handleOnEditPress={handleOnEditPress}
              handleOnUserPress={handleOnUserPress}
              isLoggedIn={isLoggedIn}
              showComentsToggle={this._showComentsToggle}
            />
          </View>
        )}
      />
    );
  }
}

export default CommentsView;
