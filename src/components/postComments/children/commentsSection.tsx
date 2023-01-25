import React, {
    useState,

  } from 'react';

  
  // Components
  import { Comment } from '../..';
  import Animated, { SlideInRight } from 'react-native-reanimated';



export const CommentsSection = ({item, index, revealReplies, ...props}) => {

    const [toggle, setToggle] = useState(revealReplies || false);
  
    const _renderComment = (item, index = 0) => {
      return (
        <Animated.View
          entering={SlideInRight.duration(150).springify().delay(index * 100)}>
          <Comment
            key={item.author + item.permlink}
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
        {_renderComment(item, index)}
        {toggle && (
          item.replies.map((reply, index) => _renderComment(reply, index))
        )}
      </>
    )
  }