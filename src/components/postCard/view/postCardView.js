import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import { TouchableOpacity, Text, View, Dimensions } from 'react-native';
import { injectIntl } from 'react-intl';
import ImageSize from 'react-native-image-size';

// Utils
import { getTimeFromNow } from '../../../utils/time';
import bugsnag from '../../../config/bugsnag';

// Components
import { PostHeaderDescription } from '../../postElements';
import { PostDropdown } from '../../postDropdown';
import { TextWithIcon } from '../../basicUIElements';

// STEEM
import { Upvote } from '../../upvote';
// Styles
import styles from './postCardStyles';

// Defaults
import ProgressiveImage from '../../progressiveImage';

const dim = Dimensions.get('window');
const DEFAULT_IMAGE =
  'https://images.ecency.com/DQmT8R33geccEjJfzZEdsRHpP3VE8pu3peRCnQa1qukU4KR/no_image_3x.png';
const NSFW_IMAGE =
  'https://images.ecency.com/DQmZ1jW4p7o5GyoqWyCib1fSLE2ftbewsMCt2GvbmT9kmoY/nsfw_3x.png';

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
  const [calcImgHeight, setCalcImgHeight] = useState(300);
  //console.log(activeVotes);
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
    if (content && content.thumbnail) {
      if (isNsfwPost && content.nsfw) {
        return { image: NSFW_IMAGE, thumbnail: NSFW_IMAGE };
      }
      //console.log(content)
      ImageSize.getSize(content.thumbnail)
        .then((size) => {
          setCalcImgHeight(Math.floor((size.height / size.width) * dim.width));
        })
        .catch((er) => {
          setCalcImgHeight(Math.floor((10 / 7) * dim.width));
          bugsnag.notify(er, (report) => {
            report.metadata = {
              content,
            };
          });
        });
      return { image: content.image, thumbnail: content.thumbnail };
    } else {
      return { image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE };
    }
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
          content={content}
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
            <ProgressiveImage
              source={{ uri: _image.image }}
              thumbnailSource={{ uri: _image.thumbnail }}
              style={[
                styles.thumbnail,
                { width: dim.width - 18, height: Math.min(calcImgHeight, dim.height) },
              ]}
            />
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
              text={get(activeVot, 'length', 0)}
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
            text={get(reblogs, 'length', 0)}
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
