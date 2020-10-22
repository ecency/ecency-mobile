import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import { get } from 'lodash';
import { Platform } from 'react-native';
import { postBodySummary, renderPostBody } from '@esteemapp/esteem-render-helpers';

// Utils
import parseAsset from './parseAsset';
import { getReputation } from './reputation';
import { getResizedImage, getResizedAvatar } from './image';

const webp = Platform.OS === 'ios' ? false : true;

export const parsePosts = (posts, currentUserName) => {
  if (posts) {
    const formattedPosts = posts.map((post) => parsePost(post, currentUserName));
    return formattedPosts;
  }
  return null;
};

export const parsePost = (post, currentUserName, isPromoted) => {
  if (!post) {
    return null;
  }
  if (currentUserName === post.author) {
    post.markdownBody = post.body;
  }
  post.is_promoted = isPromoted;
  try {
    post.json_metadata = JSON.parse(post.json_metadata);
  } catch (error) {
    post.json_metadata = {};
  }
  post.image = postImage(post.json_metadata, post.body);
  post.author_reputation = getReputation(post.author_reputation);
  post.avatar = getResizedAvatar(get(post, 'author'));

  post.body = renderPostBody(post, true, webp);
  post.summary = postBodySummary(post, 150);
  post.is_declined_payout = parseAsset(post.max_accepted_payout).amount === 0;

  const totalPayout =
    parseAsset(post.pending_payout_value).amount +
    parseAsset(post.author_payout_value).amount +
    parseAsset(post.curator_payout_value).amount;

  post.total_payout = totalPayout;

  return post;
};

const postImage = (metaData, body) => {
  const imgTagRegex = /(<img[^>]*>)/g;
  const markdownImageRegex = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
  // eslint-disable-next-line max-len
  const urlRegex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gm;
  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
  let imageLink;
  if (metaData && metaData.image && metaData.image[0]) {
    [imageLink] = metaData.image;
  } else if (!imageLink && body && markdownImageRegex.test(body)) {
    const markdownMatch = body.match(markdownImageRegex);
    if (markdownMatch[0]) {
      const firstMarkdownMatch = markdownMatch[0];
      [imageLink] = firstMarkdownMatch.match(urlRegex);
    }
  }

  if (!imageLink && imageRegex.test(body)) {
    const imageMatch = body.match(imageRegex);
    [imageLink] = imageMatch;
  }

  if (!imageLink && imgTagRegex.test(body)) {
    const _imgTag = body.match(imgTagRegex);
    const match = _imgTag[0].match(urlRegex);

    if (match && match[0]) {
      [imageLink] = match;
    }
  }

  if (imageLink) {
    return getResizedImage(imageLink, 600);
  }
  return '';
};

export const parseComments = async (comments) => {
  return comments.map((comment) => {
    comment.pending_payout_value = parseFloat(get(comment, 'pending_payout_value', 0)).toFixed(3);
    comment.author_reputation = getReputation(get(comment, 'author_reputation'));
    comment.avatar = getResizedAvatar(get(comment, 'author'));
    comment.markdownBody = get(comment, 'body');
    comment.body = renderPostBody(comment, true, webp);

    return comment;
  });
};

export const isVoted = (activeVotes, currentUserName) => {
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

export const isDownVoted = (activeVotes, currentUserName) => {
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
  const totalPayout =
    post.total_payout ||
    parseFloat(post.pending_payout_value) +
      parseFloat(post.total_payout_value) +
      parseFloat(post.curator_payout_value);

  const voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares || 0;

  if (!isEmpty(post.active_votes)) {
    forEach(post.active_votes, (value) => {
      value.reward = (value.rshares * ratio).toFixed(3);
      //value.reputation = getReputation(get(value, 'reputation'));
      value.percent /= 100;
      value.is_down_vote = Math.sign(value.percent) < 0;
      value.avatar = getResizedAvatar(get(value, 'voter'));
    });
  }

  return post.active_votes;
};
