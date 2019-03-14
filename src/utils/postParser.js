// Utils
import { markDown2Html } from './markdownToHtml';
import { getPostSummary } from './formatter';
import { getReputation } from './reputation';

export const parsePosts = (posts, currentUserName, isSummary) => (!posts ? null : posts.map(post => parsePost(post, currentUserName, isSummary)));

export const parsePost = (post, currentUserName, isSummary = false) => {
  if (!post) {
    return null;
  }
  const _post = post;

  _post.json_metadata = JSON.parse(post.json_metadata);
  _post.image = postImage(post.json_metadata, post.body);
  _post.vote_count = post.active_votes.length;
  _post.author_reputation = getReputation(post.author_reputation);
  _post.avatar = `https://steemitimages.com/u/${post.author}/avatar/small`;
  _post.active_votes.sort((a, b) => b.rshares - a.rshares);

  _post.body = markDown2Html(post.body);
  _post.summary = getPostSummary(post.body, 150);
  _post.is_declined_payout = Number(parseFloat(post.max_accepted_payout)) === 0;

  if (currentUserName) {
    _post.is_voted = isVoted(_post.active_votes, currentUserName);
  } else {
    _post.is_voted = false;
  }

  if (currentUserName === _post.author) {
    _post.markdownBody = post.body;
  }

  const totalPayout = parseFloat(_post.pending_payout_value)
    + parseFloat(_post.total_payout_value)
    + parseFloat(_post.curator_payout_value);

  _post.total_payout = totalPayout.toFixed(3);

  const voteRshares = _post.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares;

  if (_post.active_votes && _post.active_votes.length > 0) {
    for (const i in _post.active_votes) {
      _post.vote_perecent = post.active_votes[i].voter === currentUserName ? post.active_votes[i].percent : null;
      _post.active_votes[i].value = (post.active_votes[i].rshares * ratio).toFixed(3);
      _post.active_votes[i].reputation = getReputation(post.active_votes[i].reputation);
      _post.active_votes[i].percent = post.active_votes[i].percent / 100;
      _post.active_votes[i].is_down_vote = Math.sign(post.active_votes[i].percent) < 0;
      _post.active_votes[i].avatar = `https://steemitimages.com/u/${
        _post.active_votes[i].voter
      }/avatar/small`;
    }
  }

  return _post;
};

const isVoted = (activeVotes, currentUserName) => activeVotes.some(v => v.voter === currentUserName && v.percent > 0);

const postImage = (metaData, body) => {
  const imgTagRegex = /(<img[^>]*>)/g;
  const markdownImageRegex = /!\[[^\]]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/g;
  const urlRegex = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gm;
  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
  let imageLink;

  if (metaData && metaData.image && metaData.image[0]) {
    imageLink = metaData.image[0];
  } else if (body && markdownImageRegex.test(body)) {
    const markdownMatch = body.match(markdownImageRegex);
    if (markdownMatch[0]) {
      const firstMarkdownMatch = markdownMatch[0];
      imageLink = firstMarkdownMatch.match(urlRegex)[0];
    }
  }

  if (!imageLink && imageRegex.test(body)) {
    const imageMatch = body.match(imageRegex);
    imageLink = imageMatch[0];
  }

  if (!imageLink && imgTagRegex.test(body)) {
    const _imgTag = body.match(imgTagRegex);
    const match = _imgTag[0].match(urlRegex);

    if (match && match[0]) {
      imageLink = match[0];
    }
  }

  if (imageLink) {
    return `https://steemitimages.com/600x0/${imageLink}`;
  }
  return '';
};

// export const protocolUrl2Obj = (url) => {
//   let urlPart = url.split('://')[1];

//   // remove last char if /
//   if (urlPart.endsWith('/')) {
//     urlPart = urlPart.substring(0, urlPart.length - 1);
//   }

//   const parts = urlPart.split('/');

//   // filter
//   if (parts.length === 1) {
//     return { type: 'filter' };
//   }

//   // filter with tag
//   if (parts.length === 2) {
//     return { type: 'filter-tag', filter: parts[0], tag: parts[1] };
//   }

//   // account
//   if (parts.length === 1 && parts[0].startsWith('@')) {
//     return { type: 'account', account: parts[0].replace('@', '') };
//   }

//   // post
//   if (parts.length === 3 && parts[1].startsWith('@')) {
//     return {
//       type: 'post',
//       cat: parts[0],
//       author: parts[1].replace('@', ''),
//       permlink: parts[2],
//     };
//   }
// };

export const parseComments = (comments) => {
  comments.map((comment) => {
    comment.pending_payout_value = parseFloat(comment.pending_payout_value).toFixed(3);
    comment.vote_count = comment.active_votes.length;
    comment.author_reputation = getReputation(comment.author_reputation);
    comment.avatar = `https://steemitimages.com/u/${comment.author}/avatar/small`;
    comment.body = markDown2Html(comment.body);
    comment.summary = getPostSummary(comment.body, 100, true);
  });
  return comments;
};
