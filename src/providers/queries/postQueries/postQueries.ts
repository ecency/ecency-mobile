import { renderPostBody } from '@ecency/render-helper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { isArray } from 'lodash';
import { getPostQueryOptions, getDiscussionsQueryOptions, getBotsQueryOptions } from '@ecency/sdk';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount } from '../../../redux/selectors';
import { Comment, LastUpdateMeta } from '../../../redux/reducers/cacheReducer';
import {
  injectPostCache,
  injectVoteCache,
  parsePost,
  parseComment,
} from '../../../utils/postParser';

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
    initialData: _initialPost,
    gcTime: 30 * 60 * 1000, // keeps cache for 30 minutes
    staleTime: isPreview && currentAccount?.name !== author ? 15 * 60 * 1000 : 0, // do not refetch in case of preview only
  });

  // Process the post data separately with useMemo to avoid recreating on every render
  const processedPost = useMemo(() => {
    const post = query.data;
    if (!post || post.post_id <= 0) {
      return null;
    }

    console.log('[useGetPostQuery] Processing post');

    // Always create shallow copy to avoid mutating cached data (parsePost mutates its input)
    const postCopy = {
      ...post,
      // Override stats if pinned
      stats: isPinned ? { ...post.stats, is_pinned_blog: true } : post.stats,
    };

    // Process post with parsePost to add all necessary fields
    // isList = false to render full body, discardBody = false to keep body
    const processed = parsePost(
      postCopy,
      currentAccount?.name,
      false, // not promoted
      false, // not list view - render full body
      false, // don't discard body
    );

    return processed;
  }, [query.data, currentAccount?.name, isPinned]);

  const data = useInjectVotesCache(processedPost);

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
    (a, b) => a === b, // Use reference equality to prevent unnecessary rerenders
  );
  const cachedVotes: { [key: string]: Comment } = useAppSelector(
    (state) => state.cache.votesCollection,
    (a, b) => a === b, // Use reference equality to prevent unnecessary rerenders
  );
  const lastCacheUpdate: LastUpdateMeta = useAppSelector(
    (state) => state.cache.lastUpdate,
    (a, b) => a === b, // Use reference equality to prevent unnecessary rerenders
  );

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
    console.log('[useDiscussionQuery] useEffect triggered', {
      hasQueryData: !!query.data,
      cachedCommentsKeys: Object.keys(cachedComments || {}).length,
      cachedVotesKeys: Object.keys(cachedVotes || {}).length,
    });

    if (!query.data) {
      setData((prev) => {
        if (Object.keys(prev).length === 0) {
          return prev;
        }
        console.log('[useDiscussionQuery] Clearing data');
        return {};
      });
      return;
    }

    // Parse SDK comments to convert markdown to HTML using render-helper
    // IMPORTANT: parseComment mutates its input, so we must create a shallow copy first
    const parsedComments = {};
    Object.keys(query.data).forEach((key) => {
      const comment = query.data[key];
      if (comment && comment.body) {
        // Create shallow copy to avoid mutating React Query cache
        const commentCopy = { ...comment };
        parsedComments[key] = parseComment(commentCopy, currentAccount?.name);
      } else {
        parsedComments[key] = comment;
      }
    });

    const _data = injectPostCache(parsedComments, cachedComments, cachedVotes, lastCacheUpdate);

    // Deep check if data actually changed before setting state
    setData((prev) => {
      if (prev === _data) {
        console.log('[useDiscussionQuery] Same reference, skipping update');
        return prev;
      }

      // Check if keys changed
      const prevKeys = Object.keys(prev);
      const newKeys = Object.keys(_data);

      if (prevKeys.length !== newKeys.length) {
        console.log('[useDiscussionQuery] Different key count, updating', {
          prev: prevKeys.length,
          new: newKeys.length,
        });
        return _data;
      }

      // Quick check if all keys are same
      const hasChanges = prevKeys.some(
        (key) => !Object.prototype.hasOwnProperty.call(_data, key) || prev[key] !== _data[key],
      );
      if (hasChanges) {
        console.log('[useDiscussionQuery] Key mismatch or value changed, updating');
        return _data;
      }

      // No changes, return previous reference
      console.log('[useDiscussionQuery] No changes detected, keeping prev');
      return prev;
    });
  }, [query.data, cachedComments, cachedVotes, lastCacheUpdate, currentAccount?.name]);

  // Cache to store processed comments and avoid recreating objects
  const processedCommentsCache = useRef<Map<string, any>>(new Map());

  // traverse discussion collection to curate sections
  const restructureData = useCallback(async () => {
    const MAX_THREAD_LEVEL = 3;
    const comments: any = [];

    const commentsMap = data;

    if (!commentsMap || Object.keys(commentsMap).length === 0) {
      setSectionedData((prev) => (prev.length === 0 ? prev : []));
      setBotComments((prev) => (prev.length === 0 ? prev : []));
      processedCommentsCache.current.clear();
      return;
    }

    // set replies as data for a section, a single array with level indicating reply placement
    // IMPORTANT: Reuse cached objects when possible
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
            const cacheKey = `${pathKey}-${commentKey}-${level}`;
            let commentCopy = processedCommentsCache.current.get(cacheKey);

            // Only create new object if cache miss or comment data changed
            // IMPORTANT: Also check if replies array length changed to detect new nested replies
            if (
              !commentCopy ||
              commentCopy.body !== comment.body ||
              commentCopy.updated !== comment.updated ||
              commentCopy.replies?.length !== comment.replies?.length
            ) {
              commentCopy = {
                ...comment,
                commentKey,
                level,
              };
              processedCommentsCache.current.set(cacheKey, commentCopy);
            }

            replies.push(commentCopy);
            replies = parseReplies(commentsMap, comment.replies, commentKey, level + 1, replies);
          }
        });
      } else if (level > MAX_THREAD_LEVEL) {
        // makes sure replies data is empty, used to compare with children to decide to show read more comments buttons
        const lastReply = replies[replies.length - 1];
        if (lastReply && lastReply.replies && lastReply.replies.length > 0) {
          replies[replies.length - 1] = { ...lastReply, replies: [] };
        }
      }
      return replies;
    };

    Object.keys(commentsMap).forEach((key) => {
      const comment = commentsMap[key];

      // process first level comment
      if (comment && comment.parent_author === author && comment.parent_permlink === permlink) {
        const cacheKey = `${key}-root-1`;
        let commentCopy = processedCommentsCache.current.get(cacheKey);

        // Only create new object if cache miss or comment data changed
        // IMPORTANT: Also check if replies array length changed to detect new nested replies
        if (
          !commentCopy ||
          commentCopy.body !== comment.body ||
          commentCopy.updated !== comment.updated ||
          commentCopy.replies?.length !== comment.replies?.length
        ) {
          commentCopy = {
            ...comment,
            commentKey: key,
            level: 1,
            repliesThread: parseReplies(commentsMap, comment.replies, key, 2),
          };
          processedCommentsCache.current.set(cacheKey, commentCopy);
        }
        // else: use cached commentCopy as-is since nothing changed

        comments.push(commentCopy);
      }
    });

    // filter comments using botsdata
    const _botComments = comments.filter((comment) =>
      botAuthorsQuery.data.includes(comment.author),
    );
    const _userComments = comments.filter(
      (comment) => !botAuthorsQuery.data.includes(comment.author),
    );

    const sameListByKey = (prevList: any[], nextList: any[]) => {
      if (prevList.length !== nextList.length) {
        return false;
      }
      for (let i = 0; i < nextList.length; i++) {
        if (prevList[i]?.commentKey !== nextList[i]?.commentKey) {
          return false;
        }
      }
      return true;
    };

    setBotComments((prev) => (sameListByKey(prev, _botComments) ? prev : _botComments));
    setSectionedData((prev) => (sameListByKey(prev, _userComments) ? prev : _userComments));
  }, [data, author, permlink, botAuthorsQuery.data]);

  useEffect(() => {
    restructureData();
  }, [restructureData]);

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
  const votesCollection = useAppSelector(
    (state) => state.cache.votesCollection,
    (a, b) => a === b,
  );
  const lastUpdate = useAppSelector(
    (state) => state.cache.lastUpdate,
    (a, b) => a === b,
  );
  const [retData, setRetData] = useState<any | any[] | null>(null);
  const lastProcessedUpdateRef = useRef<string | null>(null);
  const lastDataRef = useRef<any>(_data);

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
        const updatedPost = injectVoteCache(_postData, _voteCache);

        // Only update if injectVoteCache returned a different reference
        if (updatedPost === _postData) {
          return currentRetData; // No changes
        }

        if (_postIndex < 0) {
          console.log('updating data', updatedPost);
          return updatedPost; // injectVoteCache already cloned if needed
        } else {
          // Create new array with updated post
          const newRetData = [...currentRetData];
          newRetData[_postIndex] = updatedPost;
          return newRetData;
        }
      }

      return currentRetData;
    });

    // Only trigger on lastUpdate changes to prevent infinite loops
    // votesCollection is accessed but not a dependency - we read current value from closure
  }, [lastUpdate]);

  useEffect(() => {
    // Only run if _data actually changed reference
    if (_data === lastDataRef.current) {
      return;
    }
    lastDataRef.current = _data;

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

        return injectVoteCache(item, voteCache);
      }
      return item;
    };

    // Don't create unnecessary new object for single posts
    const _cData = isArray(_data) ? _data.map(_itemFunc) : _itemFunc(_data);

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

    // votesCollection is included as a dependency to trigger updates when votes change
  }, [_data, votesCollection]);

  return retData || _data;
};
