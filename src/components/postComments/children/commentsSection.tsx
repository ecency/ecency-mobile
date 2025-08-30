import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Comment } from '../..';
import Animated, { LinearTransition, Easing } from 'react-native-reanimated';

export const CommentsSection = ({ item, ...props }) => {
  const [toggle, setToggle] = useState(item.expandedReplies || false);

  useEffect(() => {
    if (item.expandedReplies) {
      setToggle(true);
    }
  }, [item.expandedReplies]);

  const _renderComment = (item, index = 0) => {
    return (
      <View key={item.author + item.permlink}>
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

    return (
      <Animated.View layout={LinearTransition.easing(Easing.ease).duration(200)} style={{ overflow: 'hidden' }}  >
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
