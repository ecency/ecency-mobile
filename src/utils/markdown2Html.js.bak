import { JSDOM } from 'jsdom';
import Remarkable from 'remarkable';
import proxifyImageSrc from './proxifyImageSrc';

const md = new Remarkable({ html: true, breaks: true, linkify: true });

export const sanitizeNode = (node) => {
  const ALLOWED_TAGS = [
    'A',
    'STRONG',
    'B',
    'I',
    'EM',
    'CODE',
    'PRE',
    'BLOCKQUOTE',
    'SUP',
    'SUB',
    'H2',
    'H1',
    'H3',
    'H4',
    'H5',
    'H6',
    'DIV',
    'P',
    'IFRAME',
    'CENTER',
    'UL',
    'OL',
    'LI',
    'TABLE',
    'THEAD',
    'TBODY',
    'TR',
    'TD',
    'TH',
    'HR',
    'BR',
    'IMG',
    'DEL',
    'INS',
  ];

  const ALLOWED_ATTRS = [
    'data-permlink',
    'data-tag',
    'data-author',
    'data-href',
    'class',
    'src',
    'alt',
    'title',
    'width',
    'height',
    'border',
    'frameborder',
    'allowfullscreen',
    'mozallowfullscreen',
    'webkitallowfullscreen',
  ];

  const allElems = node.querySelectorAll('*');
  allElems.forEach((el) => {
    if (ALLOWED_TAGS.indexOf(el.tagName) === -1) {
      el.outerHTML = `<span>${el.textContent.replace('>', '&gt;').replace('<', '&lt;')}</span>`;
    }

    [...el.attributes].forEach((attr) => {
      if (
        ALLOWED_ATTRS.indexOf(attr.name) === -1
        || attr.value.toLowerCase().indexOf('javascript:') !== -1
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return node;
};

const traverse = (node, depth = 0) => {
  if (!node || !node.childNodes) return;

  node.childNodes.forEach((child) => {
    if (child.nodeName === '#text') linkifyNode(child);
    if (child.nodeName === 'IMG') img(child);

    traverse(child, depth + 1);
  });
};

const img = (node) => {
  node.removeAttribute('width');
  node.removeAttribute('height');

  const src = node.getAttribute('src');

  node.setAttribute('src', proxifyImageSrc(src));
};

const linkifyNode = (node) => {
  if (['A', 'CODE'].includes(node.parentNode.nodeName)) return;

  const linkified = linkify(node.nodeValue);
  if (linkified !== node.nodeValue) {
    const replaceNode = node.ownerDocument.createElement('span');
    replaceNode.setAttribute('class', 'will-replaced'); // it will be replaced with its own innerHTML
    node.parentNode.insertBefore(replaceNode, node);
    node.parentNode.removeChild(node);
    replaceNode.innerHTML = linkified;
  }
};

export const linkify = (content) => {
  // Tags
  content = content.replace(/(^|\s|>)(#[-a-z\d]+)/gi, (tag) => {
    if (/#[\d]+$/.test(tag)) return tag; // do not allow only numbers (like #1)
    const preceding = /^\s|>/.test(tag) ? tag[0] : ''; // space or closing tag (>)
    tag = tag.replace('>', ''); // remove closing tag
    const tag2 = tag.trim().substring(1);
    const tagLower = tag2.toLowerCase();
    return `${preceding}<a class="markdown-tag-link" data-tag="${tagLower}">${tag.trim()}</a>`;
  });

  // User mentions
  content = content.replace(
    /(^|[^a-zA-Z0-9_!#$%&*@＠/]|(^|[^a-zA-Z0-9_+~.-/]))[@＠]([a-z][-.a-z\d]+[a-z\d])/gi,
    (match, preceeding1, preceeding2, user) => {
      const userLower = user.toLowerCase();
      const preceedings = (preceeding1 || '') + (preceeding2 || '');

      return `${preceedings}<a class="markdown-author-link" data-author="${userLower}">@${user}</a>`;
    },
  );

  return content;
};

export default (input) => {
  if (!input) {
    return '';
  }

  let output = md.render(input);

  const imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
  const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
  const copiedPostRegex = /\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
  const youTubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
  const vimeoRegex = /(https?:\/\/)?(www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const dTubeRegex = /(https?:\/\/d.tube.#!\/v\/)(\w+)\/(\w+)/g;

  // Create temporary document to manipulate html
  const dom = new JSDOM(output, {
    ProcessExternalResources: false,
  });

  // Manipulate link (a) elements
  const links = dom.window.document.body.querySelectorAll('a');
  links.forEach((el) => {
    const href = el.getAttribute('href');

    // Continue if href has no value
    if (!href) {
      return;
    }

    // Don't touch user and hashtag links
    if (['markdown-author-link', 'markdown-tag-link'].indexOf(el.className) !== -1) {
      return;
    }

    let f = false;

    // Do not allow js hrefs
    if (href.startsWith('javascript')) {
      el.removeAttribute('href');
      f = true;
    }

    // if href is an image url and innerHTML same with href then mark it as image
    // & => &amp; can break equality
    if (
      href.match(imgRegex)
      && href.trim().replace(/&amp;/g, '&') === el.innerHTML.trim().replace(/&amp;/g, '&')
    ) {
      el.setAttribute('data-href', href);
      el.removeAttribute('href');

      el.className = 'markdown-img-link';
      el.innerHTML = `<img src="${href}">`;
      f = true;
    }

    // If a steem post
    if (!f) {
      const postMatch = href.match(postRegex);
      if (postMatch) {
        el.className = 'markdown-post-link';
        el.removeAttribute('href');

        el.setAttribute('data-tag', postMatch[2]);
        el.setAttribute('data-author', postMatch[3].replace('@', ''));
        el.setAttribute('data-permlink', postMatch[4]);

        f = true;
      }
    }

    // If a copied post link
    if (!f) {
      const postMatch = href.match(copiedPostRegex);
      if (postMatch) {
        el.className = 'markdown-post-link';
        el.removeAttribute('href');

        el.setAttribute('data-tag', postMatch[1]);
        el.setAttribute('data-author', postMatch[2].replace('@', ''));
        el.setAttribute('data-permlink', postMatch[3]);

        f = true;
      }
    }

    // If a youtube video
    if (!f) {
      const match = href.match(youTubeRegex);
      if (match && el.textContent.trim() === href) {
        const e = youTubeRegex.exec(href);
        if (e[1]) {
          el.className = 'markdown-video-link markdown-video-link-youtube';
          el.removeAttribute('href');

          const vid = e[1];
          const embedSrc = `https://www.youtube.com/embed/${vid}`;
          el.innerHTML = `<iframe frameborder='0' allowfullscreen src='${embedSrc}'></iframe>`;
          f = true;
        }
      }
    }

    // If vimeo video
    if (!f) {
      const match = href.match(vimeoRegex);
      if (match && href === el.textContent) {
        const e = vimeoRegex.exec(href);
        if (e[3]) {
          el.className = 'markdown-video-link markdown-video-link-vimeo';
          el.removeAttribute('href');

          const embedSrc = `https://player.vimeo.com/video/${e[3]}`;
          el.innerHTML = `<iframe frameborder='0' allowfullscreen src='${embedSrc}'></iframe>`;
          f = true;
        }
      }
    }

    // If a d.tube video
    if (!f) {
      const match = href.match(dTubeRegex);
      if (match) {
        // Only d.tube links contains an image
        const imgEls = el.querySelectorAll('img');
        if (el.textContent === href || imgEls.length === 1) {
          const e = dTubeRegex.exec(href);
          // e[2] = username, e[3] object id
          if (e[2] && e[3]) {
            el.className = 'markdown-video-link markdown-video-link-dtube';
            el.removeAttribute('href');

            const embedSrc = `https://emb.d.tube/#!/${e[2]}/${e[3]}`;
            el.innerHTML = `<iframe frameborder='0' allowfullscreen src='${embedSrc}'></iframe>`;
            f = true;
          }
        }
      }
    }

    if (!f) {
      if (
        href.indexOf('https://steemit.com/~witnesses') === 0
        || href.indexOf('https://steemconnect.com/sign/account-witness-vote?witness=') === 0
      ) {
        el.className = 'markdown-witnesses-link';

        el.setAttribute('data-href', href);
        el.removeAttribute('href');

        f = true;
      }
    }

    // Convert image links using steemitimages proxy
    if (!f) {
      if (href.trim().indexOf('https://steemitimages.com/0x0/') === 0) {
        el.setAttribute('data-href', href);
        el.removeAttribute('href');

        el.className = 'markdown-img-link';
        el.innerHTML = `<img src="${href}">`;
        f = true;
      }
    }

    // If nothing matched element as external link so it will be opened in external window
    if (!f) {
      el.className = 'markdown-external-link';

      el.setAttribute('data-href', href);
      el.removeAttribute('href');
    }
  });

  // Try to convert image links that are Remarkable could not converted.
  // Find text nodes not wrapper with a and node value matchs with image regex
  const pars = dom.window.document.body.querySelectorAll('*');
  pars.forEach((el) => {
    el.childNodes.forEach((n) => {
      if (
        n.nodeValue
        && n.nodeValue.trim()
        && ['P', 'DIV', 'CENTER', 'STRONG'].indexOf(n.parentNode.tagName) !== -1
      ) {
        const href = n.nodeValue.trim();
        if (href.match(imgRegex)) {
          const replace = dom.window.document.createElement('a');
          replace.setAttribute('data-href', href);

          replace.className = 'markdown-img-link';
          replace.innerHTML = `<img src="${n.nodeValue}">`;

          n.parentNode.insertBefore(replace, n);
          n.parentNode.removeChild(n);
        }
      }
    });
  });

  // Sanitize
  const tempEl = sanitizeNode(dom.window.document.body);

  // traverse over elements and manipulate
  traverse(tempEl);

  // replace temporary elements with their innerHTML's
  const replaceElems = tempEl.querySelectorAll('.will-replaced');
  replaceElems.forEach((child) => {
    child.outerHTML = child.innerHTML;
  });

  output = tempEl.innerHTML;

  return output;
};
