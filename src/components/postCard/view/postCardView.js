import React, { useState, useEffect } from 'react';
import get from 'lodash/get';
import { TouchableOpacity, Text, View } from 'react-native';
import { injectIntl } from 'react-intl';

// Utils
import FastImage from 'react-native-fast-image';
import { getTimeFromNow } from '../../../utils/time';
// import bugsnagInstance from '../../../config/bugsnag';

// Components
import { PostHeaderDescription } from '../../postElements';
import { PostDropdown } from '../../postDropdown';
import { TextWithIcon } from '../../basicUIElements';
import { Icon } from '../../icon';

// STEEM
import { Upvote } from '../../upvote';
// Styles
import styles from './postCardStyles';
import { TextButton } from '../..';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import postTypes from '../../../constants/postTypes';

const dim = getWindowDimensions();
const DEFAULT_IMAGE =
  'https://images.ecency.com/DQmT8R33geccEjJfzZEdsRHpP3VE8pu3peRCnQa1qukU4KR/no_image_3x.png';
const NSFW_IMAGE =
  'https://images.ecency.com/DQmZ1jW4p7o5GyoqWyCib1fSLE2ftbewsMCt2GvbmT9kmoY/nsfw_3x.png';

const PostCardView = ({
  handleOnUserPress,
  handleOnContentPress,
  handleOnVotersPress,
  handleOnReblogsPress,
  handleOnUnmutePress,
  showQuickReplyModal,
  content,
  reblogs,
  isHideImage,
  fetchPost,
  nsfw,
  intl,
  activeVotes,
  imageHeight,
  setImageHeight,
  isMuted,
  pageType,
}) => {
  // local state to manage fake upvote if available
  const activeVotesCount = activeVotes ? activeVotes.length : 0;
  const [cacheVoteIcrement, setCacheVoteIcrement] = useState(0);
  const [calcImgHeight, setCalcImgHeight] = useState(imageHeight || 300);

  // Component Functions
  const _handleOnUserPress = (username) => {
    if (handleOnUserPress) {
      handleOnUserPress(username);
    }
  };

  const _handleOnContentPress = () => {
    // console.log('content : ', content);
    handleOnContentPress();
  };

  const _handleOnVotersPress = () => {
    // handleOnVotersPress();
  };

  const _handleOnReblogsPress = () => {
    // if (reblogs && reblogs.length > 0) {
    //   handleOnReblogsPress();
    // }
  };

  const _handleCacheVoteIncrement = () => {
    // fake increment vote using based on local change
    // setCacheVoteIcrement(1);
  };

  const rebloggedBy = get(content, 'reblogged_by[0]', null);

  let images = { image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE };
  if (content.thumbnail) {
    if (isMuted || (nsfw !== '0' && content.nsfw)) {
      images = { image: NSFW_IMAGE, thumbnail: NSFW_IMAGE };
    } else {
      images = { image: content.image, thumbnail: content.thumbnail };
    }
  } else {
    images = { image: DEFAULT_IMAGE, thumbnail: DEFAULT_IMAGE };
  }

  return (
    <View style={styles.post}>
      {!!rebloggedBy && (
        <TextWithIcon
          wrapperStyle={styles.reblogWrapper}
          text={`${intl.formatMessage({ id: 'post.reblogged' })} ${rebloggedBy}`}
          iconType="MaterialIcons"
          iconName="repeat"
          iconSize={16}
          textStyle={styles.reblogText}
          isClickable={true}
          onPress={() => _handleOnUserPress(rebloggedBy)}
        />
      )}

      <View style={styles.bodyHeader}>
        <PostHeaderDescription
          date={getTimeFromNow(get(content, 'created'))}
          isHideImage={isHideImage}
          name={get(content, 'author')}
          profileOnPress={_handleOnUserPress}
          reputation={get(content, 'author_reputation')}
          size={50}
          content={content}
          rebloggedBy={rebloggedBy}
          isPromoted={get(content, 'is_promoted')}
        />
        {(content?.stats?.is_pinned || content?.stats?.is_pinned_blog) && (
          <Icon style={styles.pushPinIcon} size={20} name="pin" iconType="MaterialCommunityIcons" />
        )}
        <View style={styles.dropdownWrapper}>
          {/* <PostDropdown
            pageType={pageType}
            content={content}
            fetchPost={fetchPost}
            isMuted={isMuted}
          /> */}
        </View>
      </View>
      <View style={styles.postBodyWrapper}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.hiddenImages}
          onPress={_handleOnContentPress}
        >
          {!isHideImage && (
            <FastImage
              source={{ uri: images.image }}
              style={[
                styles.thumbnail,
                {
                  width: dim.width - 18,
                  height: Math.min(calcImgHeight, dim.height),
                },
              ]}
              resizeMode={
                calcImgHeight < dim.height
                  ? FastImage.resizeMode.contain
                  : FastImage.resizeMode.cover
              }
              onLoad={(evt) => {
                if (!imageHeight) {
                  const height =
                    (evt.nativeEvent.height / evt.nativeEvent.width) * (dim.width - 18);

                    //TODO: put back imgHeight state sets before PR
                  // setCalcImgHeight(height);
                  // setImageHeight(content.author + content.permlink, height);
                }
              }}
            />
          )}
          {!isMuted ? (
            <View style={[styles.postDescripton]}>
              <Text style={styles.title} numberOfLines={1}>{content.title}</Text> 
              {
                //TODO: remove numberOfLines prop before PR
              }
              <Text style={styles.summary} numberOfLines={1}>{content.summary}</Text>
            </View>
          ) : (
            <TextButton
              style={styles.revealButton}
              textStyle={styles.revealText}
              onPress={() => handleOnUnmutePress()}
              text={intl.formatMessage({ id: 'post.reveal_muted' })}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.bodyFooter}>
        <View style={styles.leftFooterWrapper}>
          <Upvote
            activeVotes={activeVotes}
            isShowPayoutValue
            content={content}
            handleCacheVoteIncrement={_handleCacheVoteIncrement}
            parentType={postTypes.POST}
          />
          <TouchableOpacity style={styles.commentButton} onPress={_handleOnVotersPress}>
            <TextWithIcon
              iconName="heart-outline"
              iconStyle={styles.commentIcon}
              iconType="MaterialCommunityIcons"
              isClickable
              text={activeVotesCount + cacheVoteIcrement}
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
            onPress={showQuickReplyModal}
          />
        </View>
      </View>
    </View>
  );
};

export default injectIntl(PostCardView);
