import { TNode } from 'react-native-render-html';

export interface LinkData {
  type: string;
  href?: string;
  author?: string;
  permlink?: string;
  tag?: string;
  proposal?: string;
  videoHref?: string;
  youtubeId?: string;
  startTime?: number;
  filter?: string;
  community?: string;
}

export const parseLinkData = (tnode: TNode): LinkData => {
  if (!tnode) {
    return null;
  }

  if (tnode.classes.includes('markdown-external-link')) {
    // inline external links can contain video links, for such tags and video id or url is contained as
    // attribute if that is the case, use in app video modal to play content
    // for now, only youtube id is supported
    const youtubeId = tnode.attributes['data-youtube'];
    const startTime = tnode.attributes['data-start-time'];
    if (youtubeId) {
      return {
        type: 'markdown-video-link-youtube',
        youtubeId,
        startTime: parseInt(startTime) || 0,
      };
    }
    // TOOD: support other video link later

    // use default markdown-external-link with url;
    return {
      type: 'markdown-external-link',
      href: tnode.attributes['data-href'],
    };
  }

  if (tnode.classes.includes('markdown-author-link')) {
    const author = tnode.attributes['data-author'];
    return {
      type: 'markdown-author-link',
      author,
    };
  }

  if (tnode.classes.includes('markdown-post-link')) {
    let author = tnode.attributes['data-author'];
    let permlink = tnode.attributes['data-permlink'];

    // snippets checks if there is anchored post inside permlink and use that instead
    const anchoredPostRegex = /(.*?\#\@)(.*)\/(.*)/;
    const matchedLink = permlink.match(anchoredPostRegex);
    if (matchedLink) {
      [, , author, permlink] = matchedLink;
    }

    // check if permlink has trailing query param, remove that if is the case
    const queryIndex = permlink.lastIndexOf('?');
    if (queryIndex > -1) {
      permlink = permlink.substring(0, queryIndex);
    }

    return {
      type: 'markdown-post-link',
      author,
      permlink,
    };
  }

  if (tnode.classes.includes('markdown-tag-link')) {
    const tag = tnode.attributes['data-tag'];
    const filter = tnode.attributes['data-filter'];

    return {
      type: 'markdown-tag-link',
      tag,
      filter,
    };
  }

  if (tnode.classes.includes('markdown-witnesses-link')) {
    return {
      type: 'markdown-witnesses-link',
      href: tnode.attributes['data-href'],
    };
  }

  if (tnode.classes.includes('markdown-proposal-link')) {
    const proposal = tnode.attributes['data-proposal'];
    return {
      type: 'markdown-proposal-link',
      proposal,
      href: tnode.attributes['data-href'],
    };
  }

  if (tnode.classes.includes('markdown-community-link')) {
    return {
      type: 'markdown-community-link',
      community: tnode.attributes['data-community'],
      filter: tnode.attributes['data-filter'],
    };
  }

  if (tnode.classes.includes('markdown-video-link-youtube')) {
    const youtubeId = tnode.attributes['data-youtube'];
    const startTime = tnode.attributes['data-start-time'];

    if (youtubeId) {
      return {
        type: 'markdown-video-link-youtube',
        youtubeId,
        startTime: parseInt(startTime) || 0,
      };
    }
  }

  if (tnode.classes.includes('markdown-video-link')) {
    const videoHref =
      tnode.attributes['data-embed-src'] ||
      tnode.attributes['data-video-href'] ||
      tnode.children[0].attributes.src;
    if (videoHref) {
      return {
        type: 'markdown-video-link',
        videoHref,
      };
    }
  }
};
