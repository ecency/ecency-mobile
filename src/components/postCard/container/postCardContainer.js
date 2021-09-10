import React, { useState, useEffect } from 'react';
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
}) => {
  const dispatch = useAppDispatch();

  const [_content, setContent] = useState(content);
  const [reblogs, setReblogs] = useState([]);
  const activeVotes = get(_content, 'active_votes', []);

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
      // let params = {
      //   username: username || get(_content, 'author'),
      //   reputation: !username && get(_content, 'author_reputation'),
      // };

      dispatch(showProfileModal(username));

      // if (
      //   get(currentAccount, 'name') === params.username &&
      //   (pageType === 'main' || pageType === 'ownProfile')
      // ) {
      //   navigation.navigate(ROUTES.TABBAR.PROFILE);
      // } else {
      //   navigation.navigate({
      //     routeName: ROUTES.SCREENS.PROFILE,
      //     params,
      //     key: get(_content, 'author'),
      //   });
      // }
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

  return (
    <PostCardView
      handleOnUserPress={_handleOnUserPress}
      handleOnContentPress={_handleOnContentPress}
      handleOnVotersPress={_handleOnVotersPress}
      handleOnReblogsPress={_handleOnReblogsPress}
      content={_content}
      isHideImage={isHideImage}
      nsfw={nsfw || '1'}
      reblogs={reblogs}
      activeVotes={activeVotes}
      imageHeight={imageHeight}
      setImageHeight={setImageHeight}
      fetchPost={_fetchPost}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  nsfw: state.application.nsfw,
});

export default withNavigation(connect(mapStateToProps)(PostCardContainer));
