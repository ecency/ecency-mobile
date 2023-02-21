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
import { UpvoteButton } from '../children/upvoteButton';
import { PostTypes } from '../../../constants/postTypes';
import { PostCardHeader } from '../children/postCardHeader';
import { PostCardContent } from '../children/postCardContent';


const PostCardView = ({
  handleOnVotersPress,
  handleOnReblogsPress,
  handleOnUpvotePress,
  handleOnPayoutDetailsPress,
  showQuickReplyModal,
  content,
  reblogs,
  isHideImage,
  nsfw,
  activeVotes,
  imageHeight,
  setImageHeight,
  onActionPress
}) => {

  // local state to manage fake upvote if available
  const activeVotesCount = activeVotes ? activeVotes.length : 0;


  // Component Functions

  const _handleOnVotersPress = () => {
    handleOnVotersPress();
  };

  const _handleOnReblogsPress = () => {
    if (reblogs && reblogs.length > 0) {
      handleOnReblogsPress();
    }
  };



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
      <PostCardHeader
        content={content}
        isHideImage={isHideImage}
        onActionPress={onActionPress} />
      <PostCardContent
        content={content}
        isHideImage={isHideImage}
        nsfw={nsfw}
        thumbHeight={imageHeight}
        setThumbHeight={setImageHeight}
        onActionPress={onActionPress} />
      {_renderActionPanel}
    </View>
  );
};

export default PostCardView;
