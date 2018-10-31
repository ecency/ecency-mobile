import React, { Component } from 'react';
import { View } from 'react-native';

// Constants

// Components
import { FilterBar } from '../../filterBar';
import { Comments } from '..';
import { PostBody, PostHeaderDescription } from '../../postElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';

// Styles
import styles from './commentStyles';

class CommentsView extends Component {
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

  render() {
    const {
      comments,
      avatarSize,
      marginLeft,
      handleOnUserPress,
      currentUser,
      commentNumber,
    } = this.props;
    // commentNumber === 8 && alert('sekkiz:');
    return (
      <View>
        {/* <FilterBar
          dropdownIconName="md-arrow-dropdown"
          options={['NEW COMMENTS', 'VOTES', 'REPLIES', 'MENTIONS', 'FOLLOWS', 'REBLOGS']}
          defaultText="NEW COMMENTS"
          onDropdownSelect={this._handleOnDropdownSelect}
        /> */}
        {comments
          && comments.map((comment, i) => (
            <View key={i}>
              <PostHeaderDescription
                key={comment.permlink}
                date={comment.created}
                name={comment.author}
                reputation={comment.author_reputation}
                avatar={comment.avatar}
                size={avatarSize || 32}
              />
              <View
                style={{
                  marginLeft: marginLeft || 35,
                  flexDirection: 'column',
                  marginTop: -15,
                }}
              >
                <PostBody isComment handleOnUserPress={handleOnUserPress} body={comment.body} />
                <View style={{ flexDirection: 'row' }}>
                  <Upvote isShowpayoutValue content={comment} user={currentUser} isLoggedIn />
                  <IconButton
                    iconStyle={{ color: '#c1c5c7' }}
                    style={{ marginLeft: 20 }}
                    name="reply"
                    onPress={() => handleOnReplyPress()}
                    iconType="FontAwesome"
                  />
                </View>
              </View>
              <View style={{ marginLeft: marginLeft || 32 }}>
                {commentNumber !== 8 && (
                  <Comments
                    commentNumber={commentNumber ? commentNumber * 2 : 1}
                    marginLeft={20}
                    avatarSize={avatarSize || 16}
                    author={comment.author}
                    permlink={comment.permlink}
                  />
                )}
              </View>
            </View>
          ))}
      </View>
    );
  }
}

export default CommentsView;
