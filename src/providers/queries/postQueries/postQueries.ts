import { renderPostBody } from '@ecency/render-helper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppSelector } from '../../../hooks';
import { getDiscussionCollection, getPost } from '../../hive/dhive';
import QUERIES from '../queryKeys';

/** hook used to return user drafts */
export const useGetPostQuery = (_author?: string, _permlink?: string) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [author, setAuthor] = useState(_author);
  const [permlink, setPermlink] = useState(_permlink);

  const query = useQuery([QUERIES.POST.GET, author, permlink], async () => {
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
  });

  return {
    ...query,
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
 * @returns raw query with sectionedData as extra parameter
 */
export const useDiscussionQuery = (_author?: string, _permlink?: string) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const cachedComments = useAppSelector((state) => state.cache.comments);

  const [author, setAuthor] = useState(_author);
  const [permlink, setPermlink] = useState(_permlink);

  const [sectionedData, setSectionedData] = useState([]);

  const _injectCachedComments = (_comments) => {
    // TODO: inject cached comments here
    return _comments;
  };

  // traverse discussion collection to curate sections
  const parseSectionedData = async (commentsMap: any, author: string, permlink: string) => {
    const MAX_THREAD_LEVEL = 3;
    const comments: any = [];

    if (!commentsMap) {
      setSectionedData([]);
      return;
    }

    // set replies as data for a section, a single array with level indicating reply placement
    const parseReplies = (
      commentsMap: any,
      replyKeys: any[],
      level: number,
      replies: any[] = [],
    ) => {
      if (replyKeys && replyKeys.length > 0 && MAX_THREAD_LEVEL > level) {
        replyKeys.forEach((pathKey) => {
          const comment = commentsMap[pathKey];
          if (comment) {
            comment.level = level;
            replies.push(comment);
            replies = parseReplies(commentsMap, comment.replies, level + 1, replies);
            return comment;
          }
        });
      }
      return replies;
    };

    for (const key in commentsMap) {
      if (commentsMap.hasOwnProperty(key)) {
        const comment = commentsMap[key];

        // prcoess first level comment
        if (comment && comment.parent_author === author && comment.parent_permlink === permlink) {
          comment.data = parseReplies(commentsMap, comment.replies, 1);
          comments.push(comment);
        }
      }
    }

    setSectionedData(comments);
  };

  const _fetchComments = async () => {
    console.log('fetching discussions');
    const response = await getDiscussionCollection(author, permlink);
    console.log('discussion response', response);
    return response;
  };

  const query = useQuery([QUERIES.POST.GET_DISCUSSION, author, permlink], _fetchComments);

  const data = useMemo(() => _injectCachedComments(query.data), [query.data, cachedComments]);

  useEffect(() => {
    parseSectionedData(data, author, permlink);
  }, [data]);

  return {
    ...query,
    data,
    sectionedData,
    setAuthor,
    setPermlink,
  };
};
