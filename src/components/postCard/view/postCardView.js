import React, { Component } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { injectIntl } from 'react-intl';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription } from '../../postElements';
import { PostDropdown } from '../../postDropdown';
import { Icon } from '../../icon';

// STEEM
import { Upvote } from '../../upvote';
// Styles
import styles from './postCardStyles';

// Defaults
import DEFAULT_IMAGE from '../../../assets/no_image.png';
import NSFW_IMAGE from '../../../assets/nsfw.png';

class PostCardView extends Component {
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
    const { handleOnUserPress } = this.props;

    if (handleOnUserPress) {
      handleOnUserPress();
    }
  };

  _handleOnContentPress = () => {
    const { handleOnContentPress, content } = this.props;

    handleOnContentPress(content);
  };

  _handleOnVotersPress = () => {
    const { handleOnVotersPress, content } = this.props;

    handleOnVotersPress(content.active_votes);
  };

  _getPostImage = (content, isNsfwPost) => {
    if (content && content.image) {
      if (isNsfwPost && content.nsfw) {
        return NSFW_IMAGE;
      }
      return { uri: content.image, priority: FastImage.priority.high };
    }
    return DEFAULT_IMAGE;
  };

  render() {
    const { content, isHideImage, fetchPost, isNsfwPost, isHideReblogOption } = this.props;

    const _image = this._getPostImage(content, isNsfwPost);
    const reblogedBy = content.reblogged_by && content.reblogged_by[0];

    return (
      <View style={styles.post}>
        <View style={styles.bodyHeader}>
          <PostHeaderDescription
            // date={intl.formatRelative(content.created)}
            date={getTimeFromNow(content.created)}
            isHideImage={isHideImage}
            name={content.author}
            profileOnPress={this._handleOnUserPress}
            reputation={content.author_reputation}
            size={32}
            tag={content.category}
            reblogedBy={reblogedBy}
          />
          <View style={styles.dropdownWrapper}>
            <PostDropdown
              isHideReblogOption={isHideReblogOption}
              content={content}
              fetchPost={fetchPost}
            />
          </View>
        </View>
        <View style={styles.postBodyWrapper}>
          <TouchableOpacity
            style={[{ flexDirection: 'column' }]}
            onPress={() => this._handleOnContentPress()}
          >
            {!isHideImage && (
              <FastImage source={_image} style={styles.thumbnail} defaultSource={DEFAULT_IMAGE} />
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
          <View style={styles.commentButton}>
            <Icon style={[styles.commentIcon]} iconType="MaterialIcons" name="comment" />
            <Text style={styles.comment}>{content.children}</Text>
          </View>
        </View>
      </View>
    );
  }
}

export default injectIntl(PostCardView);
