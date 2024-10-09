import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { CommentsModal, UserAvatar } from '../..';
import styles from '../styles/botCommentsPreview.styles';

interface BotCommentsProps {
  comments: any[];
}

export const BotCommentsPreview = ({ comments }: BotCommentsProps) => {
  const commentsModalRef = useRef<typeof CommentsModal>();

  return (
    <View style={styles.container}>
      {comments.map((comment) => {
        return (
          <TouchableOpacity
            onPress={() => {
              if (commentsModalRef.current) {
                commentsModalRef.current.show(comments);
              }
            }}
          >
            <View style={styles.item}>
              <UserAvatar username={comment.author} noAction />
              <View style={styles.labelWrapper}>
                <Text style={styles.label}>{comment.author}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <CommentsModal ref={commentsModalRef} />
    </View>
  );
};
