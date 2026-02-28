import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { LinearTransition, Easing } from 'react-native-reanimated';
import { useLayoutState, useMappingHelper } from '@shopify/flash-list';
import { Comment } from '../..';

export const CommentsSection = ({ item, hiddenCommentKeys, ...props }) => {
  const { getMappingKey } = useMappingHelper();
  const [toggle, setToggle] = useLayoutState(false);
  const isHidden = (comment: any) =>
    !!hiddenCommentKeys?.has(`${comment?.author}/${comment?.permlink}`);

  useEffect(() => {
    if (item.expandedReplies && !toggle) {
      setToggle(true);
    }
    // Also auto-expand when a new optimistic sub-reply is added
    // (renderOnTop is set on freshly cached comments by injectPostCache)
    if (
      !toggle &&
      item.repliesThread?.some((reply) => reply.renderOnTop || reply.expandedReplies)
    ) {
      setToggle(true);
    }
  }, [item.expandedReplies, item.repliesThread]);

  const _renderComment = (commentItem, index = 0) => {
    if (isHidden(commentItem)) {
      return null;
    }
    return (
      <View key={getMappingKey(commentItem.commentKey, index)}>
        <Comment
          comment={commentItem}
          repliesToggle={toggle}
          handleOnToggleReplies={() => {
            setToggle(!toggle);
          }}
          {...props}
        />
      </View>
    );
  };

  const _renderReplies = () => {
    const _animation = LinearTransition.easing(Easing.inOut(Easing.ease)).duration(
      toggle ? 1 : 200,
    ); // hack to avoid animation on list height change if already expanded

    return (
      <Animated.View layout={_animation} style={{ overflow: 'hidden' }}>
        {toggle &&
          item.repliesThread
            .filter((reply) => !isHidden(reply))
            .map((reply, index) => _renderComment(reply, index))}
      </Animated.View>
    );
  };

  return (
    <>
      {_renderComment(item, -1)}
      {_renderReplies()}
    </>
  );
};
