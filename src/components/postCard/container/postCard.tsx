import React from 'react';
import { View } from 'react-native';
import { reblog } from '../../../providers/hive/dhive';
import { PostCardActionsPanel } from '../children/postCardActionsPanel';
import { PostCardContent } from '../children/postCardContent';
import { PostCardHeader } from '../children/postCardHeader';

// Services
// import { useNavigation } from '@react-navigation/native';
// import { getPost } from '../../../providers/hive/dhive';
// import { getPostReblogs } from '../../../providers/ecency/ecency';

import styles from '../children/postCardStyles';

// Constants
// import { default as ROUTES } from '../../../constants/routeNames';
// import { useAppDispatch } from '../../../hooks';
// import { showProfileModal } from '../../../redux/actions/uiAction';
// import { postQueries } from '../../../providers/queries';

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
  NAVIGATE = 'NAVIGATE'
}

const PostCard = ({
  intl,
  content,
  isHideImage,
  nsfw,
  imageHeight,
  setImageHeight,
  handleCardInteraction,
}) => {

  // const postsCacherPrimer = postQueries.usePostsCachePrimer();




  // const [reblogs, setReblogs] = useState([]);



  // useEffect(() => {
  //   let isCancelled = false;

  //   const fetchData = async (val) => {
  //     try {
  //       const dd = await getPostReblogs(val);
  //       if (!isCancelled) {
  //         setReblogs(dd);
  //         return dd;
  //       }
  //     } catch (e) {
  //       if (!isCancelled) {
  //         setReblogs([]);
  //         return val;
  //       }
  //     }
  //   };

  //   if (content) {
  //     fetchData(content);
  //   }

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [_content]);



  return (
    <View style={styles.post}>
      <PostCardHeader
        intl={intl}
        content={content}
        isHideImage={isHideImage}
        handleCardInteraction={handleCardInteraction} />
      <PostCardContent
        content={content}
        isHideImage={isHideImage}
        nsfw={nsfw}
        thumbHeight={imageHeight}
        setThumbHeight={setImageHeight}
        handleCardInteraction={handleCardInteraction} />
      <PostCardActionsPanel
        content={content}
        reblogs={[]}
        handleCardInteraction={handleCardInteraction}
      />
    </View>
  );
};

export default PostCard;
