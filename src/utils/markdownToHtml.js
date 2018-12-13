import Remarkable from 'remarkable';

const md = new Remarkable({ html: true, breaks: true, linkify: true });
const isVideo = false;
const imgCenterRegex = /([<center>]http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|PNG|GIF|JPG)[</center>]/g;
const onlyImageLinkRegex = /([\n]http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|PNG|GIF|JPG)/g;
const onlyImageDoubleLinkRegex = /(\nhttps)(.*)(?=jpg|gif|png|PNG|GIF|JPG|)/g;
const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
const copiedPostRegex = /\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
const youTubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
const vimeoRegex = /(https?:\/\/)?(www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
const dTubeRegex = /(https?:\/\/d.tube.#!\/v\/)(\w+)\/(\w+)/g;
const authorNameRegex = /(^|[^a-zA-Z0-9_!#$%&*@＠\/]|(^|[^a-zA-Z0-9_+~.-\/]))[@＠]([a-z][-\.a-z\d]+[a-z\d])/gi;
const tagsRegex = /(^|\s|>)(#[-a-z\d]+)/gi;
const centerRegex = /(<center>)/g;
const steemitRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[steemit]+[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

export const markDown2Html = (input) => {
  if (!input) {
    return '';
  }
  let output = input;

  if (authorNameRegex.test(output)) {
    output = replaceAuthorNames(output);
  }

  if (tagsRegex.test(output)) {
    output = replaceTags(output);
  }

  if (youTubeRegex.test(output)) {
    output = createYoutubeIframe(output);
  }

  if (dTubeRegex.test(output)) {
    output = createDtubeIframe(output);
  }

  if (vimeoRegex.test(output)) {
    output = createVimeoIframe(output);
  }

  if (vimeoRegex.test(output)) {
    output = createVimeoIframe(output);
  }

  if (imgCenterRegex.test(output)) {
    output = createCenterImage(output);
  }

  if (onlyImageDoubleLinkRegex.test(output)) {
    output = createFromDoubleImageLink(output);
  }

  if (onlyImageLinkRegex.test(output)) {
    output = createImage(output);
  }

  if (centerRegex.test(output)) {
    output = centerStyling(output);
  }

  if (postRegex.test(output)) {
    output = steemitUrlHandle(output);
  }

  output = md.render(output);

  return output;
};

export const replaceAuthorNames = input => input.replace(authorNameRegex, (match, preceeding1, preceeding2, user) => {
  const userLower = user.toLowerCase();
  const preceedings = (preceeding1 || '') + (preceeding2 || '');
  return `${preceedings}<a class="markdown-author-link" href="${userLower}" data-author="${userLower}">@${user}</a>`;
});

export const replaceTags = input => input.replace(tagsRegex, (tag) => {
  if (/#[\d]+$/.test(tag)) return tag;
  const preceding = /^\s|>/.test(tag) ? tag[0] : '';
  tag = tag.replace('>', '');
  const tag2 = tag.trim().substring(1);
  const tagLower = tag2.toLowerCase();
  return `${preceding}<a class="markdown-tag-link" href="${tagLower}" data-tag="${tagLower}">${tag.trim()}</a>`;
});

export const removeOnlyPTag = input => input;

const centerStyling = input => input.replace(centerRegex, () => '<center style="text-align:center;">');

const createCenterImage = input => input.replace(imgCenterRegex, (link) => {
  let _link = link;

  _link = _link.split('>')[1];
  _link = _link.split('<')[0];
  return `><img data-href="${_link}" src="${_link}"><`;
});

const steemitUrlHandle = input => input.replace(postRegex, (link) => {
  const postMatch = link.match(postRegex);
  const tag = postMatch[2];
  const author = postMatch[3].replace('@', '');
  const permlink = postMatch[4];

  return `<a class="markdown-post-link" href="${permlink}" data_tag={${tag}} data_author="${author}">/${permlink}</a>`;
});

const createImage = input => input.replace(onlyImageLinkRegex, link => `<img data-href="${link}" src="${link}">`);

const createFromDoubleImageLink = input => input.replace(onlyImageDoubleLinkRegex, (link) => {
  const _link = link.trim();
  return `<img data-href="${_link}" src="${_link}">`;
});

const createYoutubeIframe = input => input.replace(youTubeRegex, (link) => {
  const videoID = link.split('=')[1];

  const embedLink = `https://www.youtube.com/embed/${videoID}`;

  return iframeBody(embedLink);
});

const createDtubeIframe = input => input.replace(dTubeRegex, (link) => {
  const execLink = dTubeRegex.exec(link);

  const embedLink = `https://emb.d.tube/#!/${execLink[2]}/${execLink[3]}`;

  return iframeBody(embedLink);
});

const createVimeoIframe = input => input.replace(vimeoRegex, (link) => {
  const execLink = vimeoRegex.exec(link);

  const embedLink = `https://player.vimeo.com/video/${execLink[3]}`;

  return iframeBody(embedLink);
});

const iframeBody = link => `<iframe frameborder='0' src="${link}"></iframe>`;
const imageBody = link => `<img data-href="${link}" src="${link}">`;
