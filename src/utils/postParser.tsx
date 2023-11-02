
import { get, isArray } from 'lodash';
import { Platform } from 'react-native';
import { postBodySummary, renderPostBody, catchPostImage } from '@ecency/render-helper';
import FastImage from 'react-native-fast-image';

// Utils
import parseAsset from './parseAsset';
import { getResizedAvatar } from './image';
import { parseReputation } from './user';
import { CacheStatus } from '../redux/reducers/cacheReducer';
import { calculateVoteReward } from './vote';

const webp = Platform.OS !== 'ios';

export const parsePosts = (posts, currentUserName, discardBody = false) => {
  if (posts) {
    const formattedPosts = posts.map((post) =>
      parsePost(post, currentUserName, false, true, discardBody),
    );
    return formattedPosts;
  }
  return null;
};

export const parsePost = (
  post,
  currentUserName,
  isPromoted,
  isList = false,
  discardBody = false,
) => {
  if (!post) {
    return null;
  }

  if (currentUserName === post.author) {
    post.markdownBody = post.body;
  }
  post.is_promoted = isPromoted;
  if (typeof post.json_metadata === 'string' || post.json_metadata instanceof String) {
    try {
      post.json_metadata = JSON.parse(post.json_metadata);
    } catch (error) {
      post.json_metadata = {};
    }
  }

  // adjust tags type as it can be string sometimes;
  post = parseTags(post);

  // extract cover image and thumbnail from post body
  post.image = catchPostImage(post, 600, 500, webp ? 'webp' : 'match');
  post.thumbnail = catchPostImage(post, 10, 7, webp ? 'webp' : 'match');

  // find and inject thumbnail ratio
  if (post.json_metadata.image_ratios) {
    if (!Number.isNaN(post.json_metadata.image_ratios[0])) {
      [post.thumbRatio] = post.json_metadata.image_ratios;
    }
  }

  post.author_reputation = parseReputation(post.author_reputation);
  post.avatar = getResizedAvatar(get(post, 'author'));
  if (!isList) {
    post.body = renderPostBody({ ...post, last_update: post.updated }, true, webp);
  }
  post.summary = postBodySummary(post, 150, Platform.OS);
  post.max_payout = parseAsset(post.max_accepted_payout).amount || 0;
  post.is_declined_payout = post.max_payout === 0;

  const totalPayout =
    parseAsset(post.pending_payout_value).amount +
    parseAsset(post.author_payout_value).amount +
    parseAsset(post.curator_payout_value).amount;

  post.total_payout = totalPayout;

  // stamp posts with fetched time;
  post.post_fetched_at = new Date().getTime();

  // discard post body if list
  if (discardBody) {
    post.body = '';
  }

  // cache image
  if (post.image) {
    FastImage.preload([{ uri: post.image }]);
  }

  return post;
};

export const parseDiscussionCollection = async (commentsMap: { [key: string]: any }) => {
  Object.keys(commentsMap).forEach((key) => {

    const comment = commentsMap[key];

    // prcoess first level comment
    if (comment) {
      commentsMap[key] = parseComment(comment);
    } else {
      delete commentsMap[key];
    }

  })

  console.log('parsed discussion collection', commentsMap);
  return commentsMap;
};

// TODO: discard/deprecate method after porting getComments in commentsContainer to getDiscussionCollection
export const parseCommentThreads = async (commentsMap: any, author: string, permlink: string) => {
  const MAX_THREAD_LEVEL = 3;
  const comments = [];

  if (!commentsMap) {
    return null;
  }

  // traverse map to curate threads
  const parseReplies = (commentsMap: any, replies: any[], level: number) => {
    if (replies && replies.length > 0 && MAX_THREAD_LEVEL > level) {
      return replies.map((pathKey) => {
        const comment = commentsMap[pathKey];
        if (comment) {
          const parsedComment = parseComment(comment);
          parsedComment.replies = parseReplies(commentsMap, parsedComment.replies, level + 1);
          return parsedComment;
        } else {
          return null;
        }
      });
    }
    return [];
  };

  Object.keys(commentsMap).forEach((key) => {

    const comment = commentsMap[key];

    // prcoess first level comment
    if (comment && comment.parent_author === author && comment.parent_permlink === permlink) {
      const _parsedComment = parseComment(comment);
      _parsedComment.replies = parseReplies(commentsMap, _parsedComment.replies, 1);
      comments.push(_parsedComment);
    }

  })

  return comments;
};

export const mapDiscussionToThreads = async (
  commentsMap: any,
  author: string,
  permlink: string,
  maxLevel = 3,
) => {
  const comments = [];

  if (!commentsMap) {
    return null;
  }

  // traverse map to curate threads
  const parseReplies = (commentsMap: any, replies: any[], level: number) => {
    if (replies && replies.length > 0 && maxLevel > level) {
      return replies.map((pathKey) => {
        const comment = commentsMap[pathKey];
        if (comment) {
          comment.replies = parseReplies(commentsMap, comment.replies, level + 1);
          return comment;
        } else {
          return null;
        }
      });
    }
    return [];
  };

  Object.keys(commentsMap).forEach((key) => {
    const comment = commentsMap[key];

    // prcoess first level comment
    if (comment && comment.parent_author === author && comment.parent_permlink === permlink) {
      comment.replies = parseReplies(commentsMap, comment.replies, 1);
      comments.push(comment);
    }
  })

  return comments;
};

export const parseComments = (comments: any[]) => {
  if (!comments) {
    return null;
  }

  return comments.map((comment) => parseComment(comment));
};

export const parseComment = (comment: any) => {
  comment.pending_payout_value = parseFloat(get(comment, 'pending_payout_value', 0)).toFixed(3);
  comment.author_reputation = parseReputation(get(comment, 'author_reputation'));
  comment.avatar = getResizedAvatar(get(comment, 'author'));
  comment.markdownBody = get(comment, 'body');
  comment.body = renderPostBody({ ...comment, last_update: comment.updated }, true, webp);

  // parse json meta;
  if (typeof comment.json_metadata === 'string' || comment.json_metadata instanceof String) {
    try {
      comment.json_metadata = JSON.parse(comment.json_metadata);
    } catch (error) {
      comment.json_metadata = {};
    }
  }

  // adjust tags type as it can be string sometimes;
  comment = parseTags(comment);

  comment.max_payout = parseAsset(comment.max_accepted_payout).amount || 0;
  comment.is_declined_payout = comment.max_payout === 0;

  // calculate and set total_payout to show to user.
  const totalPayout =
    parseAsset(comment.pending_payout_value).amount +
    parseAsset(comment.author_payout_value).amount +
    parseAsset(comment.curator_payout_value).amount;

  comment.total_payout = totalPayout;

  comment.isDeletable = !(
    comment.active_votes?.length > 0 ||
    comment.children > 0 ||
    comment.net_rshares > 0 ||
    comment.is_paidout
  );

  // stamp comments with fetched time;
  comment.post_fetched_at = new Date().getTime();

  return comment;
};

export const injectPostCache = (commentsMap, cachedComments, cachedVotes, lastCacheUpdate) => {
  let shouldClone = false;
  const _comments = commentsMap || {};
  console.log('updating with cache', _comments, cachedComments);
  if (!cachedComments || !_comments) {
    console.log('Skipping cache injection');
    return _comments;
  }

  // process votes cache
  Object.keys(cachedVotes).forEach((path) => {
    const cachedVote = cachedVotes[path];
    if (_comments[path]) {
      console.log('injection vote cache');
      _comments[path] = injectVoteCache(_comments[path], cachedVote);
    }
  })

  // process comments cache

  Object.keys(cachedComments).forEach((path) => {
    const currentTime = new Date().getTime();
    const cachedComment = cachedComments[path];
    const _parentPath = `${cachedComment.parent_author}/${cachedComment.parent_permlink}`;
    const cacheUpdateTimestamp = new Date(cachedComment.updated || 0).getTime();

    switch (cachedComment.status) {
      case CacheStatus.DELETED:
        if (_comments && _comments[path]) {
          delete _comments[path];
          shouldClone = true;
        }
        break;
      case CacheStatus.UPDATED:
      case CacheStatus.PENDING:
        // check if commentKey already exist in comments map,
        if (_comments[path]) {
          shouldClone = true;
          // check if we should update comments map with cached map based on updat timestamp
          const remoteUpdateTimestamp = new Date(_comments[path].updated).getTime();

          if (cacheUpdateTimestamp > remoteUpdateTimestamp) {
            _comments[path].body = cachedComment.body;
          }
        }

        // if comment key do not exist, possiblky comment is a new comment, in this case, check if parent of comment exist in map
        else if (_comments[_parentPath]) {
          shouldClone = true;
          // in this case add comment key in childern and inject cachedComment in commentsMap
          _comments[path] = cachedComment;
          _comments[_parentPath].replies.push(path);
          _comments[_parentPath].children += 1;

          // if comment was created very recently enable auto reveal
          if (lastCacheUpdate.postPath === path && currentTime - lastCacheUpdate.updatedAt < 5000) {
            console.log('setting show replies flag');
            _comments[_parentPath].expandedReplies = true;
            _comments[path].renderOnTop = true;
          }
        }
        break;
    }
  })

  return shouldClone ? { ..._comments } : _comments;
};

export const injectVoteCache = (post, voteCache) => {
  if (voteCache && voteCache.status !== CacheStatus.FAILED) {
    const _voteIndex = post.active_votes.findIndex((i) => i.voter === voteCache.voter);

    // if vote do not already exist
    if (_voteIndex < 0 && voteCache.status !== CacheStatus.DELETED) {
      post.total_payout += voteCache.amount * (voteCache.isDownvote ? -1 : 1);

      // calculate updated totalRShares and send to post
      const _totalRShares = post.active_votes.reduce(
        (accumulator: number, item: any) => accumulator + parseFloat(item.rshares),
        voteCache.rshares,
      );
      const _newVote = parseVote(voteCache, post, _totalRShares);
      post.active_votes = [...post.active_votes, _newVote];
    }

    // if vote already exist
    else {
      const _vote = post.active_votes[_voteIndex];

      // get older and new reward for the vote
      const _oldReward = calculateVoteReward(_vote.rshares, post);

      // update total payout
      const _voteAmount = voteCache.amount * (voteCache.isDownvote ? -1 : 1);
      post.total_payout += _voteAmount - _oldReward;

      // update vote entry
      _vote.rshares = voteCache.rshares;
      _vote.percent100 = _vote.percent && voteCache.percent / 100;

      post.active_votes[_voteIndex] = _vote;
      post.active_votes = [...post.active_votes];
    }
  }

  return post;
};

export const isVoted = async (activeVotes, currentUserName) => {
  if (!currentUserName) {
    return false;
  }
  const result = activeVotes.find(
    (element) => get(element, 'voter') === currentUserName && get(element, 'rshares', 0) > 0,
  );
  if (result) {
    return result.rshares;
  }
  return false;
};

export const isDownVoted = async (activeVotes, currentUserName) => {
  if (!currentUserName) {
    return false;
  }
  const result = activeVotes.find(
    (element) => get(element, 'voter') === currentUserName && get(element, 'rshares') < 0,
  );
  if (result) {
    return result.rshares;
  }
  return false;
};

export const parseActiveVotes = (post) => {
  const _totalRShares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);

  if (isArray(post.active_votes)) {
    post.active_votes = post.active_votes.map((vote) => parseVote(vote, post, _totalRShares));
  }

  return post.active_votes;
};

export const parseVote = (activeVote: any, post: any, _totalRShares?: number) => {
  activeVote.reward = calculateVoteReward(activeVote.rshares, post, _totalRShares).toFixed(3);
  activeVote.percent100 = activeVote.percent / 100;
  activeVote.is_down_vote = Math.sign(activeVote.rshares) < 0;
  activeVote.avatar = getResizedAvatar(activeVote.voter);

  return activeVote;
};

const parseTags = (post: any) => {
  if (post.json_metadata) {
    const _tags = get(post.json_metadata, 'tags', []);
    if (typeof _tags === 'string') {
      let separator = ' ';
      if (_tags.indexOf(', ') > -1) {
        separator = ', ';
      } else if (_tags.indexOf(',') > -1) {
        separator = ',';
      }
      post.json_metadata.tags = _tags.split(separator);
    }
  }
  return post;
};
