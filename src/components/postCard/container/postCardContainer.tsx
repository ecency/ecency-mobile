import React, { useMemo } from 'react';
import { connect } from 'react-redux';

// Services
// import { useNavigation } from '@react-navigation/native';
// import { getPost } from '../../../providers/hive/dhive';
// import { getPostReblogs } from '../../../providers/ecency/ecency';

import PostCardView from '../view/postCardView';

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
    POST = 'POST',
    USER = 'USER',
    REBLOGS = 'REBLOGS',
    OPTIONS = 'OPTIONS',
    UNMUTE = 'UNMUTE'
 }

const PostCardContainer = ({
  currentAccount,
  content,
  isHideImage,
  nsfw,
  imageHeight,
  setImageHeight,
  pageType,
  showQuickReplyModal,
  handleOnContentPress,
  handleOnUpvotePress,
  handleOnPayoutDetailsPress,
  handlePostDropdownPress,
  onActionPress,
}) => {
  // const navigation = useNavigation();

  // const dispatch = useAppDispatch();
  // const postsCacherPrimer = postQueries.usePostsCachePrimer();

  // const [_content, setContent] = useState(content);
  // const [reblogs, setReblogs] = useState([]);
  // const activeVotes = useMemo(()=>content?.active_votes || [], [content])


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

  // const _fetchPost = async () => {
  //   await getPost(
  //     get(_content, 'author'),
  //     get(_content, 'permlink'),
  //     get(currentAccount, 'username'),
  //   )
  //     .then((result) => {
  //       if (result) {
  //         setContent(result);
  //       }
  //     })
  //     .catch(() => {});
  // };

  // const _handleOnUserPress = (username) => {
  //   if (_content) {
  //     username = username || get(_content, 'author');
  //     dispatch(showProfileModal(username));
  //   }
  // };

  // const _handleOnContentPress = (value) => {
  //   if (value) {
  //     // postsCacherPrimer.cachePost(value);
  //     navigation.navigate({
  //       name: ROUTES.SCREENS.POST,
  //       params: {
  //         content: value,
  //         author: value.author,
  //         permlink: value.permlink,
  //       },
  //       key: get(value, 'permlink'),
  //     });
  //   }
  // };

  // const _handleOnVotersPress = () => {
  //   navigation.navigate({
  //     name: ROUTES.SCREENS.VOTERS,
  //     params: {
  //       activeVotes,
  //       content: _content,
  //     },
  //     key: get(_content, 'permlink'),
  //   });
  // };

  // const _handleOnReblogsPress = () => {
  //   navigation.navigate({
  //     name: ROUTES.SCREENS.REBLOGS,
  //     params: {
  //       reblogs,
  //     },
  //     key: get(_content, 'permlink', get(_content, 'author', '')),
  //   });
  // };


  // const _handleQuickReplyModal = () => {
  //   showQuickReplyModal(content);
  // };


  return (
    <PostCardView
      content={content}
      isHideImage={isHideImage}
      nsfw={nsfw || '1'}
      reblogs={[]}
      activeVotes={content.active_votes || []}
      // imageHeight={imageHeight}
      // setImageHeight={setImageHeight}
      pageType={pageType}

      // fetchPost={_fetchPost}
      // showQuickReplyModal={_handleQuickReplyModal}
      // handleOnUserPress={_handleOnUserPress}
      handleOnContentPress={handleOnContentPress}
      // handleOnVotersPress={_handleOnVotersPress}
      // handleOnReblogsPress={_handleOnReblogsPress}
      handleOnUpvotePress={handleOnUpvotePress}
      handleOnPayoutDetailsPress={handleOnPayoutDetailsPress}
      handlePostDropdownPress={handlePostDropdownPress}
      onActionPress={onActionPress}
    />
  );
};

// const mapStateToProps = (state) => ({
//   currentAccount: state.account.currentAccount,
//   nsfw: state.application.nsfw,
// });

export default PostCardContainer;
