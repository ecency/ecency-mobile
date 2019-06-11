import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import { postBodySummary, renderPostBody } from '@esteemapp/esteem-render-helpers';
// Utils
import { getReputation } from './reputation';

export const parsePosts = (posts, currentUserName) =>
  !posts ? null : posts.map(post => parsePost(post, currentUserName));

export const parsePost = (post, currentUserName) => {
  if (!post) {
    return null;
  }

  if (currentUserName === post.author) {
    post.markdownBody = post.body;
  }

  post.json_metadata = JSON.parse(post.json_metadata);
  post.image = postImage(post.json_metadata, post.body);
  post.vote_count = post.active_votes.length;
  post.author_reputation = getReputation(post.author_reputation);
  post.avatar = `https://steemitimages.com/u/${post.author}/avatar/small`;
  post.active_votes.sort((a, b) => b.rshares - a.rshares);

  post.body = renderPostBody(post);
  post.summary = postBodySummary(post, 150);
  post.is_declined_payout = Number(parseFloat(post.max_accepted_payout)) === 0;

  if (currentUserName) {
    post.is_voted = isVoted(post.active_votes, currentUserName);
  } else {
    post.is_voted = false;
  }

  const totalPayout =
    parseFloat(post.pending_payout_value) +
    parseFloat(post.total_payout_value) +
    parseFloat(post.curator_payout_value);

  post.total_payout = totalPayout.toFixed(3);

  const voteRshares = post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares;

  if (!isEmpty(post.active_votes)) {
    forEach(post.active_votes, value => {
      post.vote_perecent = value.voter === currentUserName ? value.percent : null;
      value.value = (value.rshares * ratio).toFixed(3);
      value.reputation = getReputation(value.reputation);
      value.percent /= 100;
      value.is_down_vote = Math.sign(value.percent) < 0;
      value.avatar = `https://steemitimages.com/u/${value.voter}/avatar/small`;
    });
  }

  return post;
};

const isVoted = (activeVotes, currentUserName) =>
  activeVotes.some(v => v.voter === currentUserName && v.percent > 0);

const postImage = (metaData, body) => {
  const imgTagRegex = /(<img[^>]*>)/g;
  const markdownImageRegex = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
  // eslint-disable-next-line max-len
  const urlRegex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gm;
  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
  let imageLink;

  if (metaData && metaData.image && metaData.image[0]) {
    [imageLink] = metaData.image;
  } else if (body && markdownImageRegex.test(body)) {
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
    return `https://steemitimages.com/600x0/${imageLink}`;
  }
  return '';
};

export const parseComments = (comments, currentUserName) => {
  forEach(comments, comment => {
    comment.pending_payout_value = parseFloat(comment.pending_payout_value).toFixed(3);
    comment.vote_count = comment.active_votes.length;
    comment.author_reputation = getReputation(comment.author_reputation);
    comment.avatar = `https://steemitimages.com/u/${comment.author}/avatar/small`;
    comment.markdownBody = comment.body;
    comment.body = renderPostBody(comment);
    comment.summary = `"${postBodySummary(comment, 100, true)}"`;

    if (currentUserName) {
      comment.is_voted = isVoted(comment.active_votes, currentUserName);
    } else {
      comment.is_voted = false;
    }
  });
  return comments;
};
