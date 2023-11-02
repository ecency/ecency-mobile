import { renderPostBody } from '@ecency/render-helper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { isArray } from 'lodash';
import { useAppSelector } from '../../../hooks';
import { getDiscussionCollection, getPost } from '../../hive/dhive';
import QUERIES from '../queryKeys';
import { Comment, LastUpdateMeta } from '../../../redux/reducers/cacheReducer';
import { injectPostCache, injectVoteCache } from '../../../utils/postParser';

/** hook used to return user drafts */
export const useGetPostQuery = (_author?: string, _permlink?: string, initialPost?: any) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [author, setAuthor] = useState(_author);
  const [permlink, setPermlink] = useState(_permlink);

  // post process initial post if available
  const _initialPost = useMemo(() => {
    const _post = initialPost;
    if (!_post) {
      return _post;
    }

    _post.body = renderPostBody(
      { ..._post, last_update: _post.updated },
      true,
      Platform.OS !== 'ios',
    );

    return _post;
  }, [initialPost?.body]);

  const query = useQuery(
    [QUERIES.POST.GET, author, permlink],
    async () => {
      if (!author || !permlink) {
        return null;
      }

      try {
        const post = await getPost(author, permlink, currentAccount?.username);
        if (post?.post_id > 0) {
          return post;
        }

        new Error('Post unavailable');
      } catch (err) {
        console.warn('Failed to get post', err);
        throw err;
      }
    },
    {
      initialData: _initialPost,
      cacheTime: 30 * 60 * 1000, // keeps cache for 30 minutes
    },
  );

  const data = useInjectVotesCache(query.data);

  return {
    ...query,
    data,
    setAuthor,
    setPermlink,
  };
};

/**
 * //caches post data prior to fetch using pre existing data of post
 * @returns hook with cachePost method
 */

export const usePostsCachePrimer = () => {
  const queryClient = useQueryClient();

  const cachePost = async (post) => {
    if (!post || !post.author || !post.permlink || !post.body) {
      return;
    }

    console.log('priming data', post.author, post.permlink, post);
    post.body = renderPostBody({ ...post, last_update: post.updated }, true, Platform.OS !== 'ios');
    queryClient.setQueryData([QUERIES.POST.GET, post.author, post.permlink], post);
  };

  return {
    cachePost,
  };
};

/**
 * fetches and sectioned discussion to be used readily with sectioned flat list
 * also injects local cache to data if any
 * @param _author
 * @param _permlink
 * @returns raw query with commentsData as extra parameter
 */
export const useDiscussionQuery = (_author?: string, _permlink?: string) => {
  const cachedComments: { [key: string]: Comment } = useAppSelector(
    (state) => state.cache.commentsCollection,
  );
  const cachedVotes: { [key: string]: Comment } = useAppSelector(
    (state) => state.cache.votesCollection,
  );
  const lastCacheUpdate: LastUpdateMeta = useAppSelector((state) => state.cache.lastUpdate);

  const [author, setAuthor] = useState(_author);
  const [permlink, setPermlink] = useState(_permlink);

  const [data, setData] = useState({});
  const [sectionedData, setSectionedData] = useState([]);

  const _fetchComments = async () => await getDiscussionCollection(author, permlink);
  const query = useQuery<{ [key: string]: Comment }>(
    [QUERIES.POST.GET_DISCUSSION, author, permlink],
    _fetchComments,
    {
      cacheTime: 5 * 60 * 1000, // keeps comments cache for 5 minutes
    },
  );

  useEffect(() => {
    const _data = injectPostCache(query.data, cachedComments, cachedVotes, lastCacheUpdate);
    setData(_data);
  }, [query.data, cachedComments, cachedVotes]);

  useEffect(() => {
    restructureData();
  }, [data]);

  // traverse discussion collection to curate sections
  const restructureData = async () => {
    const MAX_THREAD_LEVEL = 3;
    const comments: any = [];

    const commentsMap = data;

    if (!commentsMap) {
      setSectionedData([]);
      return;
    }

    // set replies as data for a section, a single array with level indicating reply placement
    const parseReplies = (
      commentsMap: any,
      replyKeys: any[],
      commentKey: string,
      level: number,
      replies: any[] = [],
    ) => {
      if (replyKeys?.length > 0 && level <= MAX_THREAD_LEVEL) {
        replyKeys.forEach((pathKey) => {
          const comment = commentsMap[pathKey];
          if (comment) {
            comment.commentKey = commentKey;
            comment.level = level;
            replies.push(comment);
            replies = parseReplies(commentsMap, comment.replies, commentKey, level + 1, replies);
            return comment;
          }
        });
      } else if (level > MAX_THREAD_LEVEL) {
        // makes sure replies data is empty, used to compare with children to decide to show read more comments buttons
        replies.lastItem.replies = [];
      }
      return replies;
    };

    for (const key in commentsMap) {
      if (commentsMap.hasOwnProperty(key)) {
        const comment = commentsMap[key];

        // prcoess first level comment
        if (comment && comment.parent_author === author && comment.parent_permlink === permlink) {
          comment.commentKey = key;
          comment.level = 1;
          comment.repliesThread = parseReplies(
            commentsMap,
            comment.replies,
            key,
            comment.level + 1,
          );
          comments.push(comment);
        }
      }
    }

    setSectionedData(comments);
  };

  return {
    ...query,
    data,
    sectionedData,
    setAuthor,
    setPermlink,
  };
};

/**
 *
 * @param _data single post content or array of posts
 * @returns post data or array of data with votes cache injected
 */
export const useInjectVotesCache = (_data: any | any[]) => {
  const votesCollection = useAppSelector((state) => state.cache.votesCollection);
  const lastUpdate = useAppSelector((state) => state.cache.lastUpdate);
  const [retData, setRetData] = useState<any | any[] | null>(null);

  useEffect(() => {
    if (retData && lastUpdate.type === 'vote') {
      const _postPath = lastUpdate.postPath;
      const _voteCache = votesCollection[_postPath];

      let _postData: any = null;
      let _postIndex = -1;

      // get post data that need updating
      const _comparePath = (item) => _postPath === `${item.author}/${item.permlink}`;
      if (isArray(retData)) {
        _postIndex = retData.findIndex(_comparePath);
        _postData = retData[_postIndex];
      } else if (retData && _comparePath(retData)) {
        _postData = retData;
      }

      // if post available, inject cache and update state
      if (_postData) {
        _postData = injectVoteCache(_postData, _voteCache);

        if (_postIndex < 0) {
          console.log('updating data', _postData);
          setRetData({ ..._postData });
        } else {
          retData[_postIndex] = _postData;
          setRetData([...retData]);
        }
      }
    }
  }, [votesCollection]);

  useEffect(() => {
    if (!_data) {
      setRetData(null);
      return;
    }

    const _itemFunc = (item) => {
      if (item) {
        const _path = `${item.author}/${item.permlink}`;
        const voteCache = votesCollection[_path];

        item = injectVoteCache(item, voteCache);
      }
      return item;
    };

    const _cData = isArray(_data) ? _data.map(_itemFunc) : _itemFunc({ ..._data });
    // console.log('data received', _cData.length, _cData);
    setRetData(_cData);
  }, [_data]);

  return retData || _data;
};
