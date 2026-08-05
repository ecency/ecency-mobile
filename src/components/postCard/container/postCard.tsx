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

const PostCard = ({ intl, content, nsfw, pageType, handleCardInteraction }: any) => {
  // Inject this card's `content` into the (stable) parent handler so children
  // receive a referentially-stable callback. The list passes a stable
  // handleCardInteraction; wrapping it here (instead of a fresh inline arrow in
  // the list's renderItem) keeps the memo comparator below from re-rendering
  // every card on each list re-render.
  const handleInteraction = React.useCallback(
    (id: PostCardActionIds, payload: any, onCallback?: any) =>
      handleCardInteraction(id, payload, content, onCallback),
    [handleCardInteraction, content],
  );

  return (
    <View style={styles.post}>
      <PostCardHeader
        intl={intl}
        content={content}
        pageType={pageType}
        handleCardInteraction={handleInteraction}
      />
      <PostCardContent content={content} nsfw={nsfw} handleCardInteraction={handleInteraction} />
      <PostCardActionsPanel content={content} handleCardInteraction={handleInteraction} />
    </View>
  );
};

// Memoize PostCard to prevent unnecessary re-renders
// Compare content by reference and primitive props
const MemoizedPostCard = React.memo(PostCard, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.nsfw === nextProps.nsfw &&
    prevProps.pageType === nextProps.pageType &&
    prevProps.intl === nextProps.intl &&
    prevProps.handleCardInteraction === nextProps.handleCardInteraction
    // handleCardInteraction changes when isLoggedIn changes (via showQuickReplyModal dependency)
  );
});

export default MemoizedPostCard;
