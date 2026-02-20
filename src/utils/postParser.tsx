import { get } from 'lodash';
import { Platform } from 'react-native';
import { postBodySummary, renderPostBody, catchPostImage } from '@ecency/render-helper';
import { Image as ExpoImage } from 'expo-image';

// Utils
import parseAsset from './parseAsset';
import { getResizedAvatar } from './image';
import { parseReputation } from './user';
import { CacheStatus } from '../redux/reducers/cacheReducer';
import { calculateVoteReward } from './vote';

export const parsePost = (
  post,
  currentUserName,
  isPromoted,
  isList = false,
  discardBody = false,
  currentTime?: number, // Optional timestamp to avoid creating new Date for each post
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
  post.image = catchPostImage(post, 600, 500, 'match');
  post.thumbnail = catchPostImage(post, 10, 7, 'match');

  // find and inject thumbnail ratio
  if (post.json_metadata.image_ratios) {
    const imgRatios = post.json_metadata.image_ratios;
    if (typeof imgRatios[0] === 'number' && !Number.isNaN(imgRatios[0])) {
      [post.thumbRatio] = post.json_metadata.image_ratios;
    } else if (imgRatios.length && imgRatios[0]?.height && imgRatios[0]?.width) {
      // convert to image ratio if old meta data found
      post.json_metadata.image_ratios = imgRatios.map((item) => {
        const ratio = item.width / item.height;
        return item.width && item.height ? parseFloat(ratio.toFixed(4)) : item;
      });
    }
  }

  post.json_metadata = parseLinksMeta(post.json_metadata);

  post.author_reputation = parseReputation(post.author_reputation);
  post.avatar = getResizedAvatar(get(post, 'author'));
  if (!isList) {
    post.body = renderPostBody({ ...post, last_update: post.updated }, true, false);
  }
  // Use description from json_metadata if available, otherwise generate summary from body
  post.summary = post.json_metadata?.description || postBodySummary(post, 150, Platform.OS);
  post.max_payout = parseAsset(post.max_accepted_payout).amount || 0;
  post.is_declined_payout = post.max_payout === 0;

  const totalPayout =
    parseAsset(post.pending_payout_value).amount +
    parseAsset(post.author_payout_value).amount +
    parseAsset(post.curator_payout_value).amount;

  post.total_payout = totalPayout;

  // set mute status
  post.isMuted =
    post.stats?.gray ||
    post.stats?.hide ||
    post.author_reputation < 25 ||
    (post.net_rshares < -7000000000 && post.active_votes?.length > 3);

  // determine vote status
  const vote = (post.active_votes || []).find((element) => element.voter === currentUserName);
  post.isUpVoted = !!vote && vote.rshares > 0;
  post.isDownVoted = !!vote && vote.rshares < 0;

  // stamp posts with fetched time (use provided timestamp or create new one)
  post.post_fetched_at = currentTime || new Date().getTime();

  // discard post body if list
  if (discardBody) {
    post.body = '';
  }

  // cache image
  if (post.image) {
    ExpoImage.prefetch([post.image]);
  }

  return post;
};

export const parseDiscussionCollection = async (
  commentsMap: { [key: string]: any },
  currentUsername?: string,
) => {
  Object.keys(commentsMap).forEach((key) => {
    const comment = commentsMap[key];

    // prcoess first level comment
    if (comment) {
      commentsMap[key] = parseComment(comment, currentUsername);
    } else {
      delete commentsMap[key];
    }
  });

  console.log('parsed discussion collection', commentsMap);
  return commentsMap;
};

// TODO: discard/deprecate method after porting getComments in commentsContainer to getDiscussionCollection
export const parseCommentThreads = async (
  commentsMap: any,
  author: string,
  permlink: string,
  currentUsername?: string,
) => {
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
          const parsedComment = parseComment(comment, currentUsername);
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
      const _parsedComment = parseComment(comment, currentUsername);
      _parsedComment.replies = parseReplies(commentsMap, _parsedComment.replies, 1);
      comments.push(_parsedComment);
    }
  });

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
  });

  return comments;
};

export const parseComments = (comments: any[], currentUsername?: string) => {
  if (!comments) {
    return null;
  }

  return comments.map((comment) => parseComment(comment, currentUsername));
};

export const parseComment = (comment: any, currentUsername?: string, currentTime?: number) => {
  comment.pending_payout_value = parseFloat(get(comment, 'pending_payout_value', 0)).toFixed(3);
  comment.author_reputation = parseReputation(get(comment, 'author_reputation'));
  comment.avatar = getResizedAvatar(get(comment, 'author'));
  comment.markdownBody = get(comment, 'body');
  comment.body = renderPostBody({ ...comment, last_update: comment.updated }, true, false);

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

  // set mute status
  comment.isMuted =
    comment.stats?.gray ||
    comment.stats?.hide ||
    comment.author_reputation < 25 ||
    (comment.net_rshares < -7000000000 && comment.active_votes?.length > 3);

  // set user vote status on comment
  const vote = (comment.active_votes || []).find((element) => element.voter === currentUsername);
  comment.isUpVoted = !!vote && vote.rshares > 0;
  comment.isDownVoted = !!vote && vote.rshares < 0;

  // stamp comments with fetched time (use provided timestamp or create new one)
  comment.post_fetched_at = currentTime || new Date().getTime();

  comment.json_metadata = parseLinksMeta(comment.json_metadata);

  return comment;
};

export const injectPostCache = (
  commentsMap,
  _cachedComments,
  cachedVotes,
  _lastCacheUpdate?,
  _discussionContext?: { author?: string; permlink?: string },
) => {
  let shouldClone = false;
  let _comments = commentsMap || {};
  if (!cachedVotes) {
    return _comments;
  }

  if (!_comments || Object.keys(_comments).length === 0) {
    return _comments;
  }

  const commentPaths = Object.keys(_comments);

  // process votes cache - only for comments in this discussion
  if (cachedVotes) {
    commentPaths.forEach((path) => {
      const cachedVote = cachedVotes[path];
      if (cachedVote) {
        const updatedComment = injectVoteCache(_comments[path], cachedVote);
        // Only update if injectVoteCache returned a new reference (meaning cache was applied)
        if (updatedComment !== _comments[path]) {
          if (!shouldClone) {
            _comments = { ..._comments };
            shouldClone = true;
          }
          _comments[path] = updatedComment;
        }
      }
    });
  }

  return _comments;
};

export const injectVoteCache = (post, voteCache) => {
  // Defensive checks
  if (!post || !voteCache || voteCache.status === CacheStatus.FAILED) {
    return post;
  }

  const activeVotes = Array.isArray(post.active_votes) ? post.active_votes : [];

  const _voteIndex = activeVotes.findIndex((i) => i.voter === voteCache.voter);

  // handle unvote
  if (_voteIndex >= 0 && voteCache.status === CacheStatus.DELETED) {
    const _vote = activeVotes[_voteIndex];
    const clonedPost = { ...post };

    const _oldReward = calculateVoteReward(_vote.rshares, post);
    clonedPost.total_payout = post.total_payout - _oldReward;

    const updatedVotes = activeVotes.filter((_, index) => index !== _voteIndex);
    clonedPost.active_votes = updatedVotes;

    clonedPost.isUpVoted = false;
    clonedPost.isDownVoted = false;

    if (post.stats) {
      clonedPost.stats = { ...post.stats, total_votes: updatedVotes.length };
    }

    return clonedPost;
  }

  // if vote do not already exist
  if (_voteIndex < 0 && voteCache.status !== CacheStatus.DELETED) {
    // Clone post to avoid mutations
    const clonedPost = { ...post };
    const voteAmount = (voteCache.amount ?? 0) * (voteCache.isDownvote ? -1 : 1);
    clonedPost.total_payout = post.total_payout + voteAmount;

    // calculate updated totalRShares and send to post
    const _totalRShares = activeVotes.reduce(
      (accumulator: number, item: any) => accumulator + parseFloat(item.rshares),
      Number(voteCache.rshares) || 0,
    );
    const _newVote = parseVote(voteCache, post, _totalRShares);
    clonedPost.active_votes = [...activeVotes, _newVote];

    // update vote status here
    clonedPost.isUpVoted = !voteCache.isDownvote;
    clonedPost.isDownVoted = !!voteCache.isDownvote;

    // Clone stats object and update total_votes count
    if (post.stats) {
      clonedPost.stats = { ...post.stats, total_votes: clonedPost.active_votes.length };
    }

    return clonedPost;
  }

  // if vote already exist
  if (_voteIndex >= 0) {
    const _vote = activeVotes[_voteIndex];

    // Check if vote actually changed before cloning
    const currentIsUpVoted = !voteCache.isDownvote;
    const currentIsDownVoted = !!voteCache.isDownvote;

    if (
      _vote.rshares === voteCache.rshares &&
      post.isUpVoted === currentIsUpVoted &&
      post.isDownVoted === currentIsDownVoted
    ) {
      return post; // No changes, return original reference
    }

    // Clone post to avoid mutations
    const clonedPost = { ...post };

    // get older and new reward for the vote
    const _oldReward = calculateVoteReward(_vote.rshares, post);

    // update total payout
    const _voteAmount = (voteCache.amount ?? 0) * (voteCache.isDownvote ? -1 : 1);
    clonedPost.total_payout = post.total_payout + _voteAmount - _oldReward;

    // update vote entry
    const updatedVote = { ..._vote };
    updatedVote.rshares = voteCache.rshares;
    updatedVote.percent = voteCache.percent ?? updatedVote.percent;
    updatedVote.percent100 = (voteCache.percent ?? updatedVote.percent) / 100;

    const updatedVotes = [...activeVotes];
    updatedVotes[_voteIndex] = updatedVote;
    clonedPost.active_votes = updatedVotes;

    // update vote status here
    clonedPost.isUpVoted = !voteCache.isDownvote;
    clonedPost.isDownVoted = !!voteCache.isDownvote;

    // Clone stats object (vote count stays same for updates)
    if (post.stats) {
      clonedPost.stats = { ...post.stats };
    }

    return clonedPost;
  }

  // No changes needed
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
  const votes = Array.isArray(post.active_votes) ? post.active_votes : [];
  const _totalRShares = votes.reduce(
    (accumulator: number, item: any) => accumulator + parseFloat(item.rshares),
    0,
  );

  if (votes.length) {
    post.active_votes = votes.map((vote) => parseVote(vote, post, _totalRShares));
  } else {
    post.active_votes = votes;
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

const parseLinksMeta = (jsonMeta) => {
  // If jsonMeta is null, undefined, or doesn't have links_meta, return the original object
  if (!jsonMeta || !jsonMeta.links_meta) {
    return jsonMeta;
  }

  const validatedLinksMeta = {};
  let hasValidLinks = false;

  // Iterate through each key in links_meta
  Object.entries(jsonMeta.links_meta).forEach(([key, linkData]) => {
    // Check if linkData is an object and has the required title and summary properties
    if (
      linkData &&
      typeof linkData === 'object' &&
      typeof linkData.title === 'string' &&
      typeof linkData.summary === 'string' &&
      typeof linkData.image === 'string'
    ) {
      // This link is well-formed, add it to validated links
      validatedLinksMeta[key] = linkData;
      hasValidLinks = true;
    }
    // If not well-formed, don't include this link
  });

  // Create a new object with the validated links_meta
  const result = { ...jsonMeta };

  // Only set links_meta if we have valid links, otherwise remove it
  if (hasValidLinks) {
    result.links_meta = validatedLinksMeta;
  } else {
    delete result.links_meta;
  }

  return result;
};
