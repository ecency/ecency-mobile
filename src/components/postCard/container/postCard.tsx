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
}

const PostCard = ({
  intl,
  content,
  isHideImage,
  nsfw,
  imageRatio,
  pageType,
  setImageRatio,
  handleCardInteraction,
}) => {
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
        imageRatio={imageRatio}
        setImageRatio={setImageRatio}
        handleCardInteraction={handleCardInteraction}
      />
      <PostCardActionsPanel content={content} handleCardInteraction={handleCardInteraction} />
    </View>
  );
};

export default PostCard;
