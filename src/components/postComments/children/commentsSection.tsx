import React, { useEffect, useState } from 'react';

// Components
import Animated, { SlideInRight } from 'react-native-reanimated';
import { Comment } from '../..';

export const CommentsSection = ({ item, index, revealReplies, ...props }) => {
  const [toggle, setToggle] = useState(item.expandedReplies || false);

  useEffect(() => {
    if (item.expandedReplies) {
      setToggle(true);
    }
  }, [item.expandedReplies]);

  const _renderComment = (item, index = 0) => {
    // animation makes sure there is 100 ms gab between each comment item
    const _enteringAnim = index >= 0 
      ? SlideInRight.duration(150).springify().delay(index * 100)
      : undefined

    return (
      <Animated.View  key={item.author + item.permlink} entering={_enteringAnim}>
        <Comment
          comment={item}
          repliesToggle={toggle}
          handleOnToggleReplies={() => setToggle(!toggle)}
          {...props}
        />
      </Animated.View>
    );
  };

  return (
    <>
      {_renderComment(item, -1)}
      {toggle && item.repliesThread.map((reply, index) => _renderComment(reply, index))}
    </>
  );
};
