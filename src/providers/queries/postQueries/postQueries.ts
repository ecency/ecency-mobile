import { renderPostBody } from '@ecency/render-helper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppSelector } from '../../../hooks';
import { getDiscussionCollection, getPost } from '../../hive/dhive';
import QUERIES from '../queryKeys';
import { Comment, CommentCacheStatus, LastUpdateMeta } from '../../../redux/reducers/cacheReducer';

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
 * @returns raw query with commentsData as extra parameter
 */
export const useDiscussionQuery = (_author?: string, _permlink?: string) => {
  const cachedComments: { [key: string]: Comment } = useAppSelector((state) => state.cache.commentsCollection);
  const lastCacheUpdate: LastUpdateMeta = useAppSelector((state) => state.cache.lastUpdate);

  const [author, setAuthor] = useState(_author);
  const [permlink, setPermlink] = useState(_permlink);

  const [data, setData] = useState({});
  const [sectionedData, setSectionedData] = useState([]);


  const _fetchComments = async () => await getDiscussionCollection(author, permlink);
  const query = useQuery<{ [key: string]: Comment }>([QUERIES.POST.GET_DISCUSSION, author, permlink], _fetchComments);


  useEffect(() => {
    _injectCachedComments();
  }, [query.data, cachedComments]);


  useEffect(() => {
    restructureData()
  }, [data])


  //inject cached comments here
  const _injectCachedComments = async () => {
    const _comments = query.data || {};
    console.log("updating with cache", _comments, cachedComments);
    if (!cachedComments || !_comments) {
      return _comments;
    }

    for (const path in cachedComments) {

      const currentTime = new Date().getTime();
      const cachedComment = cachedComments[path];
      const _parentPath = `${cachedComment.parent_author}/${cachedComment.parent_permlink}`;
      const cacheUpdateTimestamp = new Date(cachedComment.updated || 0).getTime();


      switch (cachedComment.status) {
        case CommentCacheStatus.DELETED:
          if (_comments && _comments[path]) {
            delete _comments[path];
          }
          break;
        case CommentCacheStatus.UPDATED:
        case CommentCacheStatus.PENDING:
          //check if commentKey already exist in comments map, 
          if (_comments[path]) {

            //check if we should update comments map with cached map based on updat timestamp
            const remoteUpdateTimestamp = new Date(_comments[path].updated).getTime();

            if (cacheUpdateTimestamp > remoteUpdateTimestamp) {
              _comments[path] = cachedComment;
            }
          }

          // if comment key do not exist, possiblky comment is a new comment, in this case, check if parent of comment exist in map
          else if (_comments[_parentPath]) {
            //in this case add comment key in childern and inject cachedComment in commentsMap
            _comments[path] = cachedComment
            _comments[_parentPath].replies.push(path);
            _comments[_parentPath].children = _comments[_parentPath].children + 1;

            //if comment was created very recently enable auto reveal
            if ((lastCacheUpdate.postPath === path && (currentTime - lastCacheUpdate.updatedAt) < 5000)) {
              console.log("setting show replies flag")
              _comments[_parentPath].expandedReplies = true;
              _comments[path].renderOnTop = true;
            }

          }
          break;
      }





    }

    setData({ ..._comments });
  };

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
          comment.repliesThread = parseReplies(commentsMap, comment.replies, key, comment.level + 1);
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
