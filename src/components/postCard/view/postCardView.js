import React, { Component } from 'react';
import {
  Image, TouchableOpacity, Text, View,
} from 'react-native';
// import FastImage from 'react-native-fast-image';
import { PostHeaderDescription } from '../../postElements';
import { PostDropdown } from '../../postDropdown';
import { Icon } from '../../icon';
import { LineBreak } from '../../basicUIElements';

// STEEM
import { Upvote } from '../../upvote';
// Styles
import styles from './postCardStyles';

class PostCard extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { string }     description       - Description texts.
   *   @prop { string }     iconName          - For icon render name.
   *
   */
  constructor(props) {
    super(props);

    this.state = {};
  }

  // Component Lifecycle Functions

  // Component Functions

  _handleOnUserPress = () => {
    const { handleOnUserPress, content } = this.props;

    if (handleOnUserPress && content) {
      handleOnUserPress(content.author);
    }
  };

  _handleOnContentPress = () => {
    const { handleOnContentPress, content } = this.props;

    handleOnContentPress(content.author, content.permlink);
  };

  _handleOnVotersPress = () => {
    const { handleOnVotersPress, content } = this.props;

    handleOnVotersPress(content.active_votes);
  };

  _handleOnDropdownSelect = () => {
    // alert('This feature implementing...');
  };

  render() {
    const { content, isHideImage, fetchPost } = this.props;
    // const likersText = `@${content.top_likers[0]}, @${content.top_likers[1]}, @${
    //   content.top_likers[2]
    // }`;
    // const otherLikers = ` & ${content.vote_count - content.top_likers.length} others like this`;
    // const likesCount = `${content.vote_count} likes`;

    return (
      <View style={styles.post}>
        <View style={styles.bodyHeader}>
          <PostHeaderDescription
            avatar={content && content.avatar}
            date={content.created}
            isHideImage={isHideImage}
            name={content.author}
            profileOnPress={this._handleOnUserPress}
            reputation={content.author_reputation}
            size={32}
            tag={content.category}
          />
          <View style={styles.dropdownWrapper}>
            <PostDropdown content={content} />
          </View>
        </View>
        <View style={styles.postBodyWrapper}>
          <TouchableOpacity
            style={[{ flexDirection: 'column' }]}
            onPress={() => this._handleOnContentPress()}
          >
            {!isHideImage && (
              <Image
                source={{ uri: content && content.image }}
                defaultSource={require('../../../assets/no_image.png')}
                style={styles.image}
              />
            )}
            <View style={[styles.postDescripton]}>
              <Text style={styles.title}>{content.title}</Text>
              <Text style={styles.summary}>{content.summary}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.bodyFooter}>
          <View style={styles.leftFooterWrapper}>
            <Upvote fetchPost={fetchPost} isShowPayoutValue content={content} />
            <TouchableOpacity
              style={styles.commentButton}
              onPress={() => this._handleOnVotersPress()}
            >
              <Icon
                style={[styles.commentIcon, { marginLeft: 25 }]}
                iconType="MaterialIcons"
                name="people"
              />
              <Text style={styles.comment}>{content.vote_count}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.commentButton}>
            <Icon style={[styles.commentIcon]} iconType="MaterialIcons" name="chat" />
            <Text style={styles.comment}>{content.children}</Text>
          </TouchableOpacity>
        </View>
        <LineBreak height={8} />
      </View>
    );
  }
}

export default PostCard;
