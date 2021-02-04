import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import { TouchableOpacity, Text, View, Dimensions } from 'react-native';
import { injectIntl } from 'react-intl';
import ImageSize from 'react-native-image-size';

// Utils
import FastImage from 'react-native-fast-image';
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
  const [images, setImages] = useState({});
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

  useEffect(() => {
    if (content) {
      const _rebloggedBy = get(content, 'reblogged_by[0]', null);
      setRebloggedBy(_rebloggedBy);

      if (content.thumbnail) {
        if (isNsfwPost && content.nsfw) {
          setImages({ image: NSFW_IMAGE, thumbnail: NSFW_IMAGE });
        }
        //console.log(content)
        let ratio = 10 / 7;
        ImageSize.getSize(content.thumbnail)
          .then((size) => {
            ratio = size.height / size.width;
            setCalcImgHeight(Math.floor(ratio * (dim.width - 18)));
          })
          .catch((er) => {
            setCalcImgHeight(Math.floor(ratio * (dim.width - 18)));
            bugsnag.notify(er, (report) => {
              report.metadata = {
                content,
              };
            });
          });
        setImages({ image: content.image, thumbnail: content.thumbnail });
      } else {
        setImages({ image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE });
      }
    }
    if (activeVotes) {
      setActiveVot(get(content, 'active_votes'));
    }
    return () => {
      setImages({ image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE });
      setCalcImgHeight(300);
      setActiveVot([]);
    };
  }, [content]);

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
            <FastImage
              source={{ uri: images.image }}
              //thumbnailSource={{ uri: _image.thumbnail }}
              style={[
                styles.thumbnail,
                { width: dim.width - 18, height: Math.min(calcImgHeight, dim.height) },
              ]}
              resizeMode={FastImage.resizeMode.cover}
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
