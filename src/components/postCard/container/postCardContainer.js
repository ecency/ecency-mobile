import React, { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Services
import { act } from 'react-test-renderer';
import { getPost, getActiveVotes } from '../../../providers/hive/dhive';
import { getPostReblogs } from '../../../providers/ecency/ecency';

import { parseActiveVotes } from '../../../utils/postParser';

import PostCardView from '../view/postCardView';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
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
}) => {
  const [reblogs, setReblogs] = useState([]);
  const activeVotes = get(content, 'active_votes', []);

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
  }, [content]);

  const _handleOnUserPress = () => {
    if (content && get(currentAccount, 'name') !== get(content, 'author')) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username: get(content, 'author'),
          reputation: get(content, 'author_reputation'),
        },
        key: get(content, 'author'),
      });
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
        content: content,
      },
      key: get(content, 'permlink'),
    });
  };

  const _handleOnReblogsPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.REBLOGS,
      params: {
        reblogs,
      },
      key: get(content, 'permlink', get(content, 'author', '')),
    });
  };

  return (
    <PostCardView
      handleOnUserPress={_handleOnUserPress}
      handleOnContentPress={_handleOnContentPress}
      handleOnVotersPress={_handleOnVotersPress}
      handleOnReblogsPress={_handleOnReblogsPress}
      content={content}
      isHideImage={isHideImage}
      isNsfwPost={nsfw || '1'}
      reblogs={reblogs}
      activeVotes={activeVotes}
      imageHeight={imageHeight}
      setImageHeight={setImageHeight}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  nsfw: state.application.nsfw,
});

export default withNavigation(connect(mapStateToProps)(PostCardContainer));
