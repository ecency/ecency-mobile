export default url => {
  const parseCatAuthorPermlink = u => {
    const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
    const postMatch = u.match(postRegex);
    if (postMatch && postMatch.length === 5) {
      return {
        author: postMatch[3].replace('@', ''),
        permlink: postMatch[4],
      };
    }
    const authorRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w.\d-]+)/i;
    const authorMatch = u.match(authorRegex);
    if (authorMatch && authorMatch.length === 4) {
      return {
        author: authorMatch[3].replace('@', ''),
        permlink: null,
      };
    }
    return null;
  };

  const parseAuthorPermlink = u => {
    const r = /^https?:\/\/(.*)\/(@[\w.\d-]+)\/(.*)/i;
    const match = u.match(r);
    if (match && match.length === 4) {
      return {
        author: match[2].replace('@', ''),
        permlink: match[3],
      };
    }
    const authorRegex = /^https?:\/\/(.*)\/(@[\w.\d-]+)/i;
    const authorMatch = u.match(authorRegex);
    if (authorMatch && authorMatch.length === 3) {
      return {
        author: authorMatch[2].replace('@', ''),
        permlink: null,
      };
    }

    return null;
  };

  if (
    ['https://esteem.app', 'https://steemit.com', 'https://steempeak.com'].some(x =>
      url.startsWith(x),
    )
  ) {
    return parseCatAuthorPermlink(url);
  }

  if (['https://busy.org', 'https://steemhunt.com'].some(x => url.startsWith(x))) {
    return parseAuthorPermlink(url);
  }

  // For non urls like @good-karma/esteem-london-presentation-e3105ba6637ed
  let match = url.match(/^[/]?(@[\w.\d-]+)\/(.*)/);
  if (match && match.length === 3) {
    return {
      author: match[1].replace('@', ''),
      permlink: match[2],
    };
  }

  // For non urls with category like esteem/@good-karma/esteem-london-presentation-e3105ba6637ed
  match = url.match(/^[/]?([\w.\d-]+)\/(@[\w.\d-]+)\/(.*)/);
  if (match && match.length === 4) {
    return {
      category: match[1],
      author: match[2].replace('@', ''),
      permlink: match[3],
    };
  }

  return null;
};
