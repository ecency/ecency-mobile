import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

// Components
// import Animated, { SlideInRight } from 'react-native-reanimated';
import { Comment } from '../..';

export const CommentsSection = ({ item, ...props }) => {
  const toggleRef = React.useRef(false);
  const [toggle, setToggle] = useState(item.expandedReplies || toggleRef.current);

  useEffect(() => {
    if (item.expandedReplies) {
      setToggle(true);
      toggleRef.current = true;
    }
  }, [item.expandedReplies]);

  const _renderComment = (item, index = 0) => {
    // animation makes sure there is 100 ms gab between each comment item
    // const _enteringAnim =
    //   index >= 0
    //     ? SlideInRight.duration(150)
    //         .springify()
    //         .delay(index * 100)
    //     : undefined;

    return (
      // <Animated.View key={item.author + item.permlink} entering={_enteringAnim}>
      <View key={item.author + item.permlink}>
        <Comment
          comment={item}
          repliesToggle={toggle}
          handleOnToggleReplies={() => {toggleRef.current = !toggle; setToggle(!toggle)}}
          {...props}
        />
        </View>
      // </Animated.View>
    );
  };

  return (
    <>
      {_renderComment(item, -1)}
      {toggle && item.repliesThread.map((reply, index) => _renderComment(reply, index))}
    </>
  );
};
