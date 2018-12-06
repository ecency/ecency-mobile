import Remarkable from 'remarkable';

const md = new Remarkable({ html: true, breaks: true, linkify: true });

export const markDown2Html = (input) => {
  if (!input) {
    return '';
  }
  const isVideo = false;
  const imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
  const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
  const copiedPostRegex = /\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
  const youTubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
  const vimeoRegex = /(https?:\/\/)?(www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const dTubeRegex = /(https?:\/\/d.tube.#!\/v\/)(\w+)\/(\w+)/g;

  // Start replacing user names
  let output = replaceAuthorNames(input);

  // Replace tags
  output = replaceTags(output);

  output = md.render(output);

  // TODO: Implement Regex  --> Look at utls/formatter.js

//   if (output.startsWith('<p>')) {
//     output.substring(3, output.length - 3);
//   }

  return output;
};

export const replaceAuthorNames = input => input.replace(
  /* eslint-disable-next-line */
    /(^|[^a-zA-Z0-9_!#$%&*@＠\/]|(^|[^a-zA-Z0-9_+~.-\/]))[@＠]([a-z][-\.a-z\d]+[a-z\d])/gi,
  (match, preceeding1, preceeding2, user) => {
    const userLower = user.toLowerCase();
    const preceedings = (preceeding1 || '') + (preceeding2 || '');

    return `${preceedings}<a class="markdown-author-link" href="${userLower}" data-author="${userLower}">@${user}</a>`;
  },
);

export const replaceTags = input => input.replace(/(^|\s|>)(#[-a-z\d]+)/gi, (tag) => {
  if (/#[\d]+$/.test(tag)) return tag; // do not allow only numbers (like #1)
  const preceding = /^\s|>/.test(tag) ? tag[0] : ''; // space or closing tag (>)
  tag = tag.replace('>', ''); // remove closing tag
  const tag2 = tag.trim().substring(1);
  const tagLower = tag2.toLowerCase();
  return `${preceding}<a class="markdown-tag-link" href="${tagLower}" data-tag="${tagLower}">${tag.trim()}</a>`;
});

export const removeOnlyPTag = input => input;
