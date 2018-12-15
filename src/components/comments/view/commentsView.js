import React, { Component } from 'react';
import { View, FlatList } from 'react-native';

// Constants

// Components
import { Comments } from '..';
import { PostBody, PostHeaderDescription } from '../../postElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';

// Styles
// import styles from './commentStyles';

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

  _keyExtractor = (item, index) => item.permlink;

  render() {
    const {
      comments,
      avatarSize,
      marginLeft,
      handleOnUserPress,
      commentNumber,
      handleOnReplyPress,
      isProfilePreview,
      isLoggedIn,
    } = this.props;
    // commentNumber === 8 && alert('sekkiz:');
    return (
      <View>
        {!!comments && (
          <FlatList
            data={comments}
            keyExtractor={this._keyExtractor}
            renderItem={({ item, index }) => (
              <View key={index}>
                <PostHeaderDescription
                  key={item.permlink}
                  date={item.created}
                  name={item.author}
                  reputation={item.author_reputation}
                  avatar={item.avatar}
                  size={avatarSize || 24}
                />
                <View
                  style={{
                    marginLeft: marginLeft || 29,
                    flexDirection: 'column',
                    marginTop: -10,
                  }}
                >
                  <PostBody isComment handleOnUserPress={handleOnUserPress} body={item.body} />
                  <View style={{ flexDirection: 'row' }}>
                    <Upvote isShowPayoutValue content={item} />
                    <IconButton
                      iconStyle={{ color: '#c1c5c7' }}
                      style={{ marginLeft: 20 }}
                      name="reply"
                      onPress={() => handleOnReplyPress && handleOnReplyPress(item)}
                      iconType="FontAwesome"
                      disabled={!isLoggedIn}
                    />
                  </View>
                </View>
                {!isProfilePreview && (
                  <View style={{ marginLeft: marginLeft || 29 }}>
                    {commentNumber !== 8 && (
                      <Comments
                        commentNumber={commentNumber ? commentNumber * 2 : 1}
                        marginLeft={20}
                        avatarSize={avatarSize || 16}
                        author={item.author}
                        permlink={item.permlink}
                      />
                    )}
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    );
  }
}

export default CommentsView;
