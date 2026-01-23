import { renderPostBody } from '@ecency/render-helper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { isArray } from 'lodash';
import { getPostQueryOptions, getDiscussionsQueryOptions, getBotsQueryOptions } from '@ecency/sdk';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';
import { Comment, LastUpdateMeta } from '../../../redux/reducers/cacheReducer';
import { injectPostCache, injectVoteCache, parsePost } from '../../../utils/postParser';

interface PostQueryProps {
  author?: string;
  permlink?: string;
  isPinned?: boolean;
  initialPost?: any;
  isPreview?: boolean;
}

/** hook used to return user drafts */
export const useGetPostQuery = ({
  author,
  permlink,
  initialPost,
  isPinned,
  isPreview,
}: PostQueryProps) => {
  const currentAccount = useAppSelector(selectCurrentAccount);

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

  const sdkQueryOptions = getPostQueryOptions(author, permlink, currentAccount?.name);

  const query = useQuery({
    ...sdkQueryOptions,
    // Transform data using select instead of overriding queryFn
    select: (post: any) => {
      if (!post || post.post_id <= 0) {
        return null;
      }

      // Create shallow copy to avoid mutating cached data
      let postCopy = post;
      if (isPinned) {
        postCopy = {
          ...post,
          stats: { ...post.stats, is_pinned_blog: true },
        };
      }

      // Process post with parsePost to add all necessary fields
      // isList = false to render full body, discardBody = false to keep body
      const processedPost = parsePost(
        postCopy,
        currentAccount?.name,
        false, // not promoted
        false, // not list view - render full body
        false, // don't discard body
      );

      return processedPost;
    },

    initialData: _initialPost,
    gcTime: 30 * 60 * 1000, // keeps cache for 30 minutes
    staleTime: isPreview && currentAccount?.name !== author ? 15 * 60 * 1000 : 0, // do not refetch in case of preview only
  });

  const data = useInjectVotesCache(query.data);

  return {
    ...query,
    data,
  };
};

/**
 * //caches post data prior to fetch using pre existing data of post
 * @returns hook with cachePost method
 */

export const usePostsCachePrimer = () => {
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector(selectCurrentAccount);

  const cachePost = async (post) => {
    if (!post || !post.author || !post.permlink || !post.body) {
      return;
    }

    console.log('priming data', post.author, post.permlink, post);
    post.body = renderPostBody({ ...post, last_update: post.updated }, true, Platform.OS !== 'ios');

    // Use SDK query key format with same account identifier as useGetPostQuery
    const { queryKey } = getPostQueryOptions(post.author, post.permlink, currentAccount?.name);
    queryClient.setQueryData(queryKey, post);
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
  const currentAccount = useAppSelector(selectCurrentAccount);
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
  const [botComments, setBotComments] = useState([]);
  const [sectionedData, setSectionedData] = useState([]);

  const botAuthorsQuery = useBotAuthorsQuery();

  const query = useQuery({
    ...getDiscussionsQueryOptions(
      { author, permlink } as any,
      'created' as any, // SDK accepts 'created' but TypeScript definitions are strict
      !!author && !!permlink,
      currentAccount?.name,
    ),
    gcTime: 5 * 60 * 1000, // keeps comments cache for 5 minutes
  });

  useEffect(() => {
    const _data = injectPostCache(query.data, cachedComments, cachedVotes, lastCacheUpdate);
    setData(_data);
  }, [query.data, cachedComments, cachedVotes]);

  useEffect(() => {
    restructureData();
  }, [data, botAuthorsQuery.data]);

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
        replies[replies.length - 1].replies = [];
      }
      return replies;
    };

    Object.keys(commentsMap).forEach((key) => {
      const comment = commentsMap[key];

      // prcoess first level comment
      if (comment && comment.parent_author === author && comment.parent_permlink === permlink) {
        comment.commentKey = key;
        comment.level = 1;
        comment.repliesThread = parseReplies(commentsMap, comment.replies, key, comment.level + 1);
        comments.push(comment);
      }
    });

    // filter comments using botsdata
    const _botComments = comments.filter((comment) =>
      botAuthorsQuery.data.includes(comment.author),
    );
    const _userComments = comments.filter(
      (comment) => !botAuthorsQuery.data.includes(comment.author),
    );

    setBotComments(_botComments);
    setSectionedData(_userComments);
  };

  return {
    ...query,
    data,
    sectionedData,
    botComments,
    setAuthor,
    setPermlink,
  };
};

export const useBotAuthorsQuery = () =>
  useQuery({
    ...getBotsQueryOptions(),
    gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days cache timer
    initialData: [], // TODO: initialise authors with already known bots,
  });

/**
 *
 * @param _data single post content or array of posts
 * @returns post data or array of data with votes cache injected
 */
export const useInjectVotesCache = (_data: any | any[]) => {
  const votesCollection = useAppSelector((state) => state.cache.votesCollection);
  const lastUpdate = useAppSelector((state) => state.cache.lastUpdate);
  const [retData, setRetData] = useState<any | any[] | null>(null);
  const lastProcessedUpdateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastUpdate || lastUpdate.type !== 'vote') {
      return;
    }

    // Create a unique key for this update to prevent reprocessing
    const updateKey = `${lastUpdate.postPath}-${lastUpdate.updatedAt}`;
    if (lastProcessedUpdateRef.current === updateKey) {
      return;
    }
    lastProcessedUpdateRef.current = updateKey;

    const _postPath = lastUpdate.postPath;
    const _voteCache = votesCollection[_postPath];

    // Use functional setState to access current retData without adding it to dependencies
    setRetData((currentRetData) => {
      if (!currentRetData) {
        return currentRetData;
      }

      let _postData: any = null;
      let _postIndex = -1;

      // get post data that need updating
      const _comparePath = (item) => _postPath === `${item.author}/${item.permlink}`;
      if (isArray(currentRetData)) {
        _postIndex = currentRetData.findIndex(_comparePath);
        _postData = currentRetData[_postIndex];
      } else if (currentRetData && _comparePath(currentRetData)) {
        _postData = currentRetData;
      }

      // if post available, inject cache and update state
      if (_postData) {
        _postData = injectVoteCache(_postData, _voteCache);

        if (_postIndex < 0) {
          console.log('updating data', _postData);
          return { ..._postData };
        } else {
          // Create new array with updated post
          const newRetData = [...currentRetData];
          newRetData[_postIndex] = _postData;
          return newRetData;
        }
      }

      return currentRetData;
    });

    // Only trigger on lastUpdate changes to prevent infinite loops
    // votesCollection is accessed but not a dependency - we read current value from closure
  }, [lastUpdate]);

  useEffect(() => {
    if (!_data) {
      setRetData((currentData) => {
        if (currentData !== null) {
          lastProcessedUpdateRef.current = null;
        }
        return null;
      });
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

    // Only update if data actually changed to prevent unnecessary re-renders
    setRetData((currentData) => {
      // If current data is null or empty, always update
      if (!currentData) {
        lastProcessedUpdateRef.current = null;
        return _cData;
      }

      // If arrays, compare lengths first for quick check
      if (isArray(currentData) && isArray(_cData)) {
        if (currentData.length !== _cData.length) {
          lastProcessedUpdateRef.current = null;
          return _cData;
        }
        // Check if array references are actually different
        // (simple reference check - if filter/map returned same items, don't update)
        let hasChanges = false;
        for (let i = 0; i < _cData.length; i++) {
          if (currentData[i] !== _cData[i]) {
            hasChanges = true;
            break;
          }
        }
        if (hasChanges) {
          lastProcessedUpdateRef.current = null;
          return _cData;
        }
        return currentData; // No changes, keep current data
      }

      // For single posts, check if reference changed
      if (currentData !== _cData) {
        lastProcessedUpdateRef.current = null;
        return _cData;
      }

      return currentData;
    });

    // votesCollection is intentionally not a dependency - incremental vote updates are handled by the first useEffect
  }, [_data]);

  return retData || _data;
};
