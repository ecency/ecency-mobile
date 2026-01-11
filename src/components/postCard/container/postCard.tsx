import React from 'react';
import { View } from 'react-native';
import { PostCardActionsPanel } from '../children/postCardActionsPanel';
import { PostCardContent } from '../children/postCardContent';
import { PostCardHeader } from '../children/postCardHeader';

import styles from '../styles/postCard.styles';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

export enum PostCardActionIds {
  USER = 'USER',
  OPTIONS = 'OPTIONS',
  UNMUTE = 'UNMUTE',
  REPLY = 'REPLY',
  UPVOTE = 'UPVOTE',
  PAYOUT_DETAILS = 'PAYOUT_DETAILS',
  NAVIGATE = 'NAVIGATE',
  TIP = 'TIP',
}

const PostCard = ({ intl, content, isHideImage, nsfw, pageType, handleCardInteraction }) => {
  return (
    <View style={styles.post}>
      <PostCardHeader
        intl={intl}
        content={content}
        pageType={pageType}
        isHideImage={isHideImage}
        handleCardInteraction={handleCardInteraction}
      />
      <PostCardContent
        content={content}
        isHideImage={isHideImage}
        nsfw={nsfw}
        handleCardInteraction={handleCardInteraction}
      />
      <PostCardActionsPanel content={content} handleCardInteraction={handleCardInteraction} />
    </View>
  );
};

// Memoize PostCard to prevent unnecessary re-renders
// Compare content by reference and primitive props
const MemoizedPostCard = React.memo(PostCard, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.isHideImage === nextProps.isHideImage &&
    prevProps.nsfw === nextProps.nsfw &&
    prevProps.pageType === nextProps.pageType &&
    prevProps.intl === nextProps.intl &&
    prevProps.handleCardInteraction === nextProps.handleCardInteraction
    // handleCardInteraction changes when isLoggedIn changes (via showQuickReplyModal dependency)
  );
});

export default MemoizedPostCard;
