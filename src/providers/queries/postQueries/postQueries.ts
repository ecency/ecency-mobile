import { renderPostBody } from '@ecency/render-helper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
    if (!initialPost) {
      return initialPost;
    }

    return {
      ...initialPost,
      body: renderPostBody({ ...initialPost, last_update: initialPost.updated }, true, false),
    };
  }, [initialPost]);

  // IMPORTANT: Pass undefined (not empty string) for observer when no account
  const observer = currentAccount?.name || currentAccount?.username;
  const sdkQueryOptions = getPostQueryOptions(author, permlink, observer);

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
  }, [query.data, observer, currentAccount?.name, isPinned]);

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
    const processedPost = {
      ...post,
      body: renderPostBody({ ...post, last_update: post.updated }, true, false),
    };

    // IMPORTANT: Use same observer derivation as useGetPostQuery to ensure cache key matches
    const observer = currentAccount?.name || currentAccount?.username;
    const { queryKey } = getPostQueryOptions(post.author, post.permlink, observer);
    queryClient.setQueryData(queryKey, processedPost);
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

  // IMPORTANT: Pass undefined (not empty string) for observer when no account
  // Empty string causes API to not return user's votes in active_votes array
  const observer = currentAccount?.name || currentAccount?.username;

  const query = useQuery({
    ...getDiscussionsQueryOptions(
      { author, permlink } as any,
      'created' as any, // SDK accepts 'created' but TypeScript definitions are strict
      !!author && !!permlink,
      observer,
    ),
    gcTime: 5 * 60 * 1000, // keeps comments cache for 5 minutes
  });

  useEffect(() => {
    // Even if query.data is empty, we should try to show cached comments
    // This handles the case where user posts a comment before discussion finishes loading
    const hasCache = cachedComments && Object.keys(cachedComments).length > 0;

    if (!query.data && !hasCache) {
      setData((prev) => {
        if (Object.keys(prev).length === 0) {
          return prev;
        }
        return {};
      });
      return;
    }

    // If we have cache but no query data yet, we need to create synthetic parent entries
    // so that injectPostCache can properly inject the cached comments
    const initialData = {};
    if (!query.data && hasCache) {
      // Create synthetic parent entries for cached comments
      Object.keys(cachedComments).forEach((path) => {
        const cachedComment = cachedComments[path];
        const _parentPath = `${cachedComment.parent_author}/${cachedComment.parent_permlink}`;

        // Create a minimal synthetic parent if it doesn't exist
        if (!initialData[_parentPath]) {
          initialData[_parentPath] = {
            author: cachedComment.parent_author,
            permlink: cachedComment.parent_permlink,
            replies: [],
            children: 0,
            // Mark as synthetic so we know it's temporary
            _synthetic: true,
          };
        }
      });
    }

    // Normalize SDK response to a map keyed by "author/permlink"
    const normalizeReplies = (replies) => {
      if (!Array.isArray(replies)) {
        return replies;
      }
      return replies
        .map((reply) => {
          if (typeof reply === 'string') {
            return reply;
          }
          if (reply?.author && reply?.permlink) {
            return `${reply.author}/${reply.permlink}`;
          }
          return null;
        })
        .filter(Boolean);
    };

    const normalizeDiscussionData = (rawData) => {
      if (!rawData) {
        return {};
      }
      if (Array.isArray(rawData)) {
        return rawData.reduce((acc, comment) => {
          if (!comment?.author || !comment?.permlink) {
            return acc;
          }
          const key = `${comment.author}/${comment.permlink}`;
          acc[key] = {
            ...comment,
            replies: normalizeReplies(comment.replies),
          };
          return acc;
        }, {});
      }

      const normalized = {};
      Object.keys(rawData).forEach((key) => {
        const comment = rawData[key];
        if (!comment) {
          return;
        }
        const normalizedKey =
          comment.author && comment.permlink ? `${comment.author}/${comment.permlink}` : key;
        normalized[normalizedKey] = {
          ...comment,
          replies: normalizeReplies(comment.replies),
        };
      });
      return normalized;
    };

    // Use initialData if query.data is not available yet (e.g., still loading)
    const normalizedData = normalizeDiscussionData(query.data || initialData);

    // Parse SDK comments to convert markdown to HTML using render-helper
    // IMPORTANT: parseComment mutates its input, so we must create a shallow copy first
    const parsedComments = {};
    Object.keys(normalizedData).forEach((key) => {
      const comment = normalizedData[key];
      if (comment && comment.body && !comment._synthetic) {
        // Create shallow copy to avoid mutating React Query cache
        const commentCopy = { ...comment };
        parsedComments[key] = parseComment(commentCopy, currentAccount?.name);
      } else {
        parsedComments[key] = comment;
      }
    });

    const _data = injectPostCache(parsedComments, cachedComments, cachedVotes, lastCacheUpdate, {
      author,
      permlink,
    });

    // Deep check if data actually changed before setting state
    setData((prev) => {
      if (prev === _data) {
        return prev;
      }

      // Check if keys changed
      const prevKeys = Object.keys(prev);
      const newKeys = Object.keys(_data);

      if (prevKeys.length !== newKeys.length) {
        return _data;
      }

      // Quick check if all keys are same
      const hasChanges = prevKeys.some(
        (key) => !Object.prototype.hasOwnProperty.call(_data, key) || prev[key] !== _data[key],
      );
      if (hasChanges) {
        return _data;
      }

      // No changes, return previous reference
      return prev;
    });
  }, [
    query.data,
    cachedComments,
    cachedVotes,
    lastCacheUpdate,
    observer,
    currentAccount?.name,
    author,
    permlink,
  ]);

  // Cache to store processed comments and avoid recreating objects
  const processedCommentsCache = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    processedCommentsCache.current.clear();
    return () => {
      processedCommentsCache.current.clear();
    };
  }, [author, permlink]);

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

    const hasVoteDiff = (a: any, b: any) => {
      if (!a || !b) {
        return true;
      }

      const aVotes = Array.isArray(a.active_votes) ? a.active_votes : [];
      const bVotes = Array.isArray(b.active_votes) ? b.active_votes : [];

      return (
        aVotes.length !== bVotes.length ||
        a.isUpVoted !== b.isUpVoted ||
        a.isDownVoted !== b.isDownVoted ||
        a.net_votes !== b.net_votes ||
        a.total_payout !== b.total_payout ||
        a.pending_payout_value !== b.pending_payout_value ||
        a.net_rshares !== b.net_rshares
      );
    };

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
              commentCopy.replies?.length !== comment.replies?.length ||
              commentCopy.expandedReplies !== comment.expandedReplies ||
              commentCopy.renderOnTop !== comment.renderOnTop ||
              hasVoteDiff(commentCopy, comment)
            ) {
              commentCopy = {
                ...comment,
                commentKey,
                level,
                _cacheKey: cacheKey,
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
          const newReplies = replies.map((reply, idx) =>
            idx === replies.length - 1 ? { ...lastReply, replies: [] } : reply,
          );
          replies = newReplies;
          if (lastReply._cacheKey) {
            const cachedEntry = processedCommentsCache.current.get(lastReply._cacheKey);
            if (cachedEntry) {
              processedCommentsCache.current.set(lastReply._cacheKey, {
                ...cachedEntry,
                replies: [],
              });
            }
          }
        }
      }
      return replies;
    };

    Object.keys(commentsMap).forEach((key) => {
      const comment = commentsMap[key];

      // process first level comment (exclude synthetic parent entries)
      if (
        comment &&
        comment.parent_author === author &&
        comment.parent_permlink === permlink &&
        !comment._synthetic
      ) {
        const cacheKey = `${key}-root-1`;
        let commentCopy = processedCommentsCache.current.get(cacheKey);

        // Always rebuild repliesThread to detect nested changes (e.g. new sub-replies)
        // parseReplies uses its own per-comment cache, so unchanged comments are reused
        const newRepliesThread = parseReplies(commentsMap, comment.replies, key, 2);

        // Check if top-level comment data changed OR if any nested reply changed
        const repliesChanged =
          !commentCopy ||
          commentCopy.repliesThread?.length !== newRepliesThread.length ||
          commentCopy.repliesThread?.some((item, i) => item !== newRepliesThread[i]);

        if (
          !commentCopy ||
          commentCopy.body !== comment.body ||
          commentCopy.updated !== comment.updated ||
          commentCopy.replies?.length !== comment.replies?.length ||
          commentCopy.expandedReplies !== comment.expandedReplies ||
          commentCopy.renderOnTop !== comment.renderOnTop ||
          hasVoteDiff(commentCopy, comment) ||
          repliesChanged
        ) {
          commentCopy = {
            ...comment,
            commentKey: key,
            level: 1,
            repliesThread: newRepliesThread,
          };
          processedCommentsCache.current.set(cacheKey, commentCopy);
        }

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
  const lastVotesRef = useRef<any>(votesCollection);

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
    const votesChanged = lastVotesRef.current !== votesCollection;
    if (votesChanged) {
      lastVotesRef.current = votesCollection;
      lastDataRef.current = null;
    }

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
