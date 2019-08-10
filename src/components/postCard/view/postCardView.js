import React, { Component } from 'react';
import get from 'lodash/get';
import { TouchableOpacity, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { injectIntl } from 'react-intl';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription } from '../../postElements';
import { PostDropdown } from '../../postDropdown';
import { TextWithIcon } from '../../basicUIElements';

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

    this.state = {
      rebloggedBy: get(props.content, 'reblogged_by[0]', null),
    };
  }

  // Component Lifecycle Functions
  componentWillReceiveProps(nextProps) {
    const { content } = this.props;
    const rebloggedBy = get(content, 'reblogged_by[0]', null);
    const _rebloggedBy = get(nextProps.content, 'reblogged_by[0]', null);

    if (rebloggedBy !== _rebloggedBy && !_rebloggedBy) {
      this.setState({ rebloggedBy });
    }
  }

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
    const { content, isHideImage, fetchPost, isNsfwPost, intl } = this.props;
    const { rebloggedBy } = this.state;
    const _image = this._getPostImage(content, isNsfwPost);

    return (
      <View style={styles.post}>
        <View style={styles.bodyHeader}>
          <PostHeaderDescription
            // date={intl.formatRelative(content.created)}
            date={getTimeFromNow(get(content, 'created'))}
            isHideImage={isHideImage}
            name={get(content, 'author')}
            profileOnPress={this._handleOnUserPress}
            reputation={get(content, 'author_reputation')}
            size={32}
            tag={content.category}
            rebloggedBy={rebloggedBy}
            isPromoted={get(content, 'is_promoted')}
          />
          <View style={styles.dropdownWrapper}>
            <PostDropdown content={content} fetchPost={fetchPost} />
          </View>
        </View>
        <View style={styles.postBodyWrapper}>
          <TouchableOpacity
            style={[{ flexDirection: 'column' }]}
            onPress={this._handleOnContentPress}
          >
            {!isHideImage && (
              <FastImage source={_image} style={styles.thumbnail} defaultSource={DEFAULT_IMAGE} />
            )}
            <View style={[styles.postDescripton]}>
              <Text style={styles.title}>{content.title}</Text>
              <Text style={styles.summary}>{content.summary}</Text>
            </View>
          </TouchableOpacity>

          {!!rebloggedBy && (
            <TextWithIcon
              text={`${intl.formatMessage({ id: 'post.reblogged' })} ${rebloggedBy}`}
              iconType="MaterialIcons"
              iconName="repeat"
            />
          )}
        </View>
        <View style={styles.bodyFooter}>
          <View style={styles.leftFooterWrapper}>
            <Upvote fetchPost={fetchPost} isShowPayoutValue content={content} />
            <TouchableOpacity style={styles.commentButton} onPress={this._handleOnVotersPress}>
              <TextWithIcon
                iconName="people"
                iconStyle={styles.commentIcon}
                iconType="MaterialIcons"
                isClickable
                text={get(content, 'vote_count', 0)}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.rightFooterWrapper}>
            <TextWithIcon
              iconName="repeat"
              iconStyle={styles.commentIcon}
              iconType="MaterialIcons"
              isClickable
              text={get(content, 'reblogCount', 0)}
            />
            <TextWithIcon
              iconName="comment"
              iconStyle={styles.commentIcon}
              iconType="MaterialIcons"
              isClickable
              text={get(content, 'vote_count', 0)}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default injectIntl(PostCardView);
