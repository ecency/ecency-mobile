import React, { useState, useEffect, useMemo } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Services
import { getPost } from '../../../providers/hive/dhive';
import { getPostReblogs } from '../../../providers/ecency/ecency';

import PostCardView from '../view/postCardView';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
import { useAppDispatch } from '../../../hooks';
import { showProfileModal } from '../../../redux/actions/uiAction';
/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const PostCardContainer = ({
  // isRefresh,
  navigation,
  currentAccount,
  content,
  isHideImage,
  nsfw,
  imageHeight,
  setImageHeight,
  pageType,
  showQuickReplyModal,
  mutes,
}) => {
  const dispatch = useAppDispatch();

  const [_content, setContent] = useState(content);
  const [reblogs, setReblogs] = useState([]);
  const activeVotes = get(_content, 'active_votes', []);
  const [isMuted, setIsMuted] = useState(!!mutes && mutes.indexOf(content.author) > -1);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async (val) => {
      try {
        const dd = await getPostReblogs(val);
        if (!isCancelled) {
          setReblogs(dd);
          return dd;
        }
      } catch (e) {
        if (!isCancelled) {
          setReblogs([]);
          return val;
        }
      }
    };

    if (content) {
      fetchData(content);
    }

    return () => {
      isCancelled = true;
    };
  }, [_content]);

  const _fetchPost = async () => {
    await getPost(
      get(_content, 'author'),
      get(_content, 'permlink'),
      get(currentAccount, 'username'),
    )
      .then((result) => {
        if (result) {
          setContent(result);
        }
      })
      .catch(() => {});
  };

  const _handleOnUserPress = (username) => {
    if (_content) {
      username = username || get(_content, 'author');
      dispatch(showProfileModal(username));
    }
  };

  const _handleOnContentPress = (value) => {
    if (value) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          content: value,
        },
        key: get(value, 'permlink'),
      });
    }
  };

  const _handleOnVotersPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
        content: _content,
      },
      key: get(_content, 'permlink'),
    });
  };

  const _handleOnReblogsPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.REBLOGS,
      params: {
        reblogs,
      },
      key: get(_content, 'permlink', get(_content, 'author', '')),
    });
  };

  const _handleOnUnmutePress = () => {
    setIsMuted(false);
  };

  const _handleQuickReplyModal = () => {
    showQuickReplyModal(content);
  };
  return (
    <PostCardView
      handleOnUserPress={_handleOnUserPress}
      handleOnContentPress={_handleOnContentPress}
      handleOnVotersPress={_handleOnVotersPress}
      handleOnReblogsPress={_handleOnReblogsPress}
      handleOnUnmutePress={_handleOnUnmutePress}
      content={_content}
      isHideImage={isHideImage}
      nsfw={nsfw || '1'}
      reblogs={reblogs}
      activeVotes={activeVotes}
      imageHeight={imageHeight}
      setImageHeight={setImageHeight}
      isMuted={isMuted}
      pageType={pageType}
      fetchPost={_fetchPost}
      showQuickReplyModal={_handleQuickReplyModal}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  nsfw: state.application.nsfw,
});

export default withNavigation(connect(mapStateToProps)(PostCardContainer));
