import React, { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import get from 'lodash/get';
import { TouchableOpacity, Text, View } from 'react-native';
// import { injectIntl } from 'react-intl';

// Utils
import FastImage from 'react-native-fast-image';
import { getTimeFromNow } from '../../../utils/time';
// import bugsnagInstance from '../../../config/bugsnag';

// Components
import { PostHeaderDescription } from '../../postElements';
// import { PostDropdown } from '../../postDropdown';
import { TextWithIcon } from '../../basicUIElements';
import { Icon } from '../../icon';

// Styles
import styles from '../children/postCardStyles';
import { IconButton, TextButton } from '../..';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import { UpvoteButton } from '../children/upvoteButton';
import { PostTypes } from '../../../constants/postTypes';
import { PostCardHeader } from '../children/postCardHeader';

const dim = getWindowDimensions();
const DEFAULT_IMAGE =
  'https://images.ecency.com/DQmT8R33geccEjJfzZEdsRHpP3VE8pu3peRCnQa1qukU4KR/no_image_3x.png';
const NSFW_IMAGE =
  'https://images.ecency.com/DQmZ1jW4p7o5GyoqWyCib1fSLE2ftbewsMCt2GvbmT9kmoY/nsfw_3x.png';

const PostCardView = ({
  handleOnContentPress,
  handleOnVotersPress,
  handleOnReblogsPress,
  handleOnUnmutePress,
  handleOnUpvotePress,
  handleOnPayoutDetailsPress,
  showQuickReplyModal,
  content,
  reblogs,
  isHideImage,
  nsfw,
  intl,
  activeVotes,
  imageHeight,
  setImageHeight,
  isMuted,
  onActionPress
}) => {

  // local state to manage fake upvote if available
  const activeVotesCount = activeVotes ? activeVotes.length : 0;
  // const [cacheVoteIcrement, setCacheVoteIcrement] = useState(0);
  // const [calcImgHeight, setCalcImgHeight] = useState(imageHeight || 300);
  const calcImgHeight = 300;

  // Component Functions

  const _handleOnContentPress = () => {
    // console.log('content : ', content);
    handleOnContentPress();
  };

  const _handleOnVotersPress = () => {
    handleOnVotersPress();
  };

  const _handleOnReblogsPress = () => {
    if (reblogs && reblogs.length > 0) {
      handleOnReblogsPress();
    }
  };



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



  const _renderPostContent = (
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
  )



  const _renderActionPanel = (
    <View style={styles.bodyFooter}>
      <View style={styles.leftFooterWrapper}>
        <UpvoteButton 
          isVoting={false}
          content={content}
          activeVotes={activeVotes}
          isShowPayoutValue={true}
          parentType={PostTypes.POST}
          onUpvotePress={handleOnUpvotePress}
          onPayoutDetailsPress={handleOnPayoutDetailsPress}
        />

        <TouchableOpacity style={styles.commentButton} onPress={_handleOnVotersPress}>
          <TextWithIcon
            iconName="heart-outline"
            iconStyle={styles.commentIcon}
            iconType="MaterialCommunityIcons"
            isClickable
            text={activeVotesCount}
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
  )



  return (
    <View style={styles.post}>
      <PostCardHeader content={content} onActionPress={onActionPress}/>
      {_renderPostContent}
      {_renderActionPanel}
    </View>
  );
};

export default PostCardView;
