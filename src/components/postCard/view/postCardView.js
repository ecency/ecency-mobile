import React, { Component, useState, useEffect } from 'react';
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

const PostCardView = ({
  handleOnUserPress,
  handleOnContentPress,
  handleOnVotersPress,
  handleOnReblogsPress,
  content,
  reblogs,
  isHideImage,
  fetchPost,
  isNsfwPost,
  intl,
  activeVotes,
}) => {
  const [rebloggedBy, setRebloggedBy] = useState(get(content, 'reblogged_by[0]', null));
  const [activeVot, setActiveVot] = useState(activeVotes);

  // Component Functions

  const _handleOnUserPress = () => {
    if (handleOnUserPress) {
      handleOnUserPress();
    }
  };

  const _handleOnContentPress = () => {
    handleOnContentPress(content);
  };

  const _handleOnVotersPress = () => {
    handleOnVotersPress();
  };

  const _handleOnReblogsPress = () => {
    if (reblogs.length > 0) {
      handleOnReblogsPress();
    }
  };

  const _getPostImage = (content, isNsfwPost) => {
    if (content && content.image) {
      if (isNsfwPost && content.nsfw) {
        return NSFW_IMAGE;
      }
      return { uri: content.image, priority: FastImage.priority.high };
    }
    return DEFAULT_IMAGE;
  };

  useEffect(() => {
    if (content) {
      const _rebloggedBy = get(content, 'reblogged_by[0]', null);
      setRebloggedBy(_rebloggedBy);
    }
    if (activeVotes) {
      setActiveVot(get(content, 'active_votes'));
    }
  }, [content]);

  const _image = _getPostImage(content, isNsfwPost);

  return (
    <View style={styles.post}>
      <View style={styles.bodyHeader}>
        <PostHeaderDescription
          date={getTimeFromNow(get(content, 'created'))}
          isHideImage={isHideImage}
          name={get(content, 'author')}
          profileOnPress={_handleOnUserPress}
          reputation={get(content, 'author_reputation')}
          size={36}
          tag={content.category}
          rebloggedBy={rebloggedBy}
          isPromoted={get(content, 'is_promoted')}
        />
        <View style={styles.dropdownWrapper}>
          <PostDropdown content={content} fetchPost={fetchPost} />
        </View>
      </View>
      <View style={styles.postBodyWrapper}>
        <TouchableOpacity style={styles.hiddenImages} onPress={_handleOnContentPress}>
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
          <Upvote
            activeVotes={activeVot}
            fetchPost={fetchPost}
            isShowPayoutValue
            content={content}
          />
          <TouchableOpacity style={styles.commentButton} onPress={_handleOnVotersPress}>
            <TextWithIcon
              iconName="heart-outline"
              iconStyle={styles.commentIcon}
              iconType="MaterialCommunityIcons"
              isClickable
              text={activeVot.length}
              onPress={_handleOnVotersPress}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.rightFooterWrapper}>
          <TextWithIcon
            iconName="repeat"
            iconStyle={styles.commentIcon}
            iconType="MaterialIcons"
            isClickable
            text={reblogs.length}
            onPress={_handleOnReblogsPress}
          />
          <TextWithIcon
            iconName="comment-outline"
            iconStyle={styles.commentIcon}
            iconType="MaterialCommunityIcons"
            isClickable
            text={get(content, 'children', 0)}
          />
        </View>
      </View>
    </View>
  );
};

export default injectIntl(PostCardView);
