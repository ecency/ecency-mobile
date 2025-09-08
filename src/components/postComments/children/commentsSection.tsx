import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Comment } from '../..';
import Animated, { LinearTransition, Easing } from 'react-native-reanimated';
import { useLayoutState, useMappingHelper } from '@shopify/flash-list';


export const CommentsSection = ({ item, ...props }) => {

  const { getMappingKey } = useMappingHelper();
  const [toggle, setToggle] = useLayoutState(false);

  useEffect(() => {
    if (item.expandedReplies) {
      setToggle(true);
    }
  }, [item.expandedReplies]);

  const _renderComment = (item, index = 0) => {
    return (
      <View key={getMappingKey(item.commentKey, index)}>
        <Comment
          comment={item}
          repliesToggle={toggle}
          handleOnToggleReplies={() => { setToggle(!toggle) }}
          {...props}
        />
      </View>
    );
  };


  const _renderReplies = () => {

    const _animation = LinearTransition
      .easing(Easing.inOut(Easing.ease))
      .duration(toggle ? 1 : 200); // hack to avoid animation on list height change if already expanded

    return (
      <Animated.View
        layout={_animation}
        style={{ overflow: 'hidden' }}
      >
        {toggle && item.repliesThread.map((reply, index) => _renderComment(reply, index))}
      </Animated.View>
    )
  }

  return (
    <>
      {_renderComment(item, -1)}
      {_renderReplies()}
    </>
  );
};
