// Mock external dependencies before imports
import {
  parsePost,
  parseComment,
  parseComments,
  parseCommentThreads,
  mapDiscussionToThreads,
  parseActiveVotes,
  parseVote,
  isVoted,
  isDownVoted,
} from './postParser';

jest.mock('@ecency/render-helper', () => ({
  renderPostBody: jest.fn((post) => `<p>${post.body || ''}</p>`),
  postBodySummary: jest.fn(() => 'summary text'),
  catchPostImage: jest.fn((post, w, _h) =>
    w > 100 ? 'https://img.com/cover.jpg' : 'https://img.com/thumb.jpg',
  ),
}));

jest.mock('expo-image', () => ({
  Image: { prefetch: jest.fn() },
}));

jest.mock('./image', () => ({
  getResizedAvatar: jest.fn((author) => `https://images.ecency.com/u/${author}/avatar`),
}));

jest.mock('./user', () => ({
  parseReputation: jest.fn((rep) => {
    if (typeof rep === 'number' && rep > 0 && rep <= 100) return Math.floor(rep);
    if (rep === 0) return 25;
    return 50; // default mock
  }),
}));

jest.mock('./vote', () => ({
  calculateVoteReward: jest.fn(() => 0.5),
}));

jest.mock('./parseAsset', () => ({
  __esModule: true,
  default: jest.fn((str) => {
    if (typeof str !== 'string') return { amount: 0, symbol: '' };
    const parts = str.split(' ');
    return { amount: parseFloat(parts[0]) || 0, symbol: parts[1] || '' };
  }),
}));

describe('isVoted', () => {
  it('returns rshares when user has upvoted', () => {
    const votes = [{ voter: 'alice', rshares: 1000 }];
    expect(isVoted(votes, 'alice')).toBe(1000);
  });

  it('returns false when user has not voted', () => {
    const votes = [{ voter: 'bob', rshares: 1000 }];
    expect(isVoted(votes, 'alice')).toBe(false);
  });

  it('returns false when user has downvoted', () => {
    const votes = [{ voter: 'alice', rshares: -500 }];
    expect(isVoted(votes, 'alice')).toBe(false);
  });

  it('returns false when no currentUserName', () => {
    const votes = [{ voter: 'alice', rshares: 1000 }];
    expect(isVoted(votes, null)).toBe(false);
    expect(isVoted(votes, undefined)).toBe(false);
    expect(isVoted(votes, '')).toBe(false);
  });
});

describe('isDownVoted', () => {
  it('returns rshares when user has downvoted', () => {
    const votes = [{ voter: 'alice', rshares: -500 }];
    expect(isDownVoted(votes, 'alice')).toBe(-500);
  });

  it('returns false when user has upvoted', () => {
    const votes = [{ voter: 'alice', rshares: 1000 }];
    expect(isDownVoted(votes, 'alice')).toBe(false);
  });

  it('returns false when no currentUserName', () => {
    const votes = [{ voter: 'alice', rshares: -500 }];
    expect(isDownVoted(votes, null)).toBe(false);
  });
});

describe('parsePost', () => {
  const makePost = (overrides = {}) => ({
    author: 'testuser',
    body: 'Hello world',
    json_metadata: '{"tags":["test","hive"]}',
    author_reputation: 65,
    pending_payout_value: '1.000 HBD',
    author_payout_value: '0.000 HBD',
    curator_payout_value: '0.000 HBD',
    max_accepted_payout: '100000.000 HBD',
    active_votes: [],
    net_rshares: 1000,
    updated: '2024-01-01T00:00:00',
    ...overrides,
  });

  it('returns null for null/undefined input', () => {
    expect(parsePost(null, 'user', false)).toBeNull();
    expect(parsePost(undefined, 'user', false)).toBeNull();
  });

  it('parses JSON string metadata', () => {
    const post = makePost({ json_metadata: '{"tags":["a","b"]}' });
    const result = parsePost(post, 'viewer', false);
    expect(result!.json_metadata.tags).toEqual(['a', 'b']);
  });

  it('handles malformed JSON metadata gracefully', () => {
    const post = makePost({ json_metadata: '{invalid json' });
    const result = parsePost(post, 'viewer', false);
    expect(result!.json_metadata).toEqual({});
  });

  it('preserves already-parsed json_metadata objects', () => {
    const post = makePost({ json_metadata: { tags: ['test'] } });
    const result = parsePost(post, 'viewer', false);
    expect(result!.json_metadata.tags).toEqual(['test']);
  });

  it('sets markdownBody when currentUser is author', () => {
    const post = makePost({ author: 'alice', body: '# Hello' });
    const result = parsePost(post, 'alice', false);
    expect(result!.markdownBody).toBe('# Hello');
  });

  it('does not set markdownBody when currentUser is not author', () => {
    const post = makePost({ author: 'alice', body: '# Hello' });
    const result = parsePost(post, 'bob', false);
    expect(result!.markdownBody).toBeUndefined();
  });

  it('sets is_promoted flag', () => {
    const post = makePost();
    expect(parsePost(post, 'user', true)!.is_promoted).toBe(true);
    expect(parsePost(post, 'user', false)!.is_promoted).toBe(false);
  });

  it('calculates total_payout from three sources', () => {
    const post = makePost({
      pending_payout_value: '1.500 HBD',
      author_payout_value: '2.000 HBD',
      curator_payout_value: '0.500 HBD',
    });
    const result = parsePost(post, 'viewer', false);
    expect(result!.total_payout).toBe(4);
  });

  it('detects declined payout', () => {
    const post = makePost({ max_accepted_payout: '0.000 HBD' });
    const result = parsePost(post, 'viewer', false);
    expect(result!.is_declined_payout).toBe(true);
  });

  it('detects upvote status', () => {
    const post = makePost({
      active_votes: [{ voter: 'alice', rshares: 1000 }],
    });
    const result = parsePost(post, 'alice', false);
    expect(result!.isUpVoted).toBe(true);
    expect(result!.isDownVoted).toBe(false);
  });

  it('detects downvote status', () => {
    const post = makePost({
      active_votes: [{ voter: 'alice', rshares: -500 }],
    });
    const result = parsePost(post, 'alice', false);
    expect(result!.isUpVoted).toBe(false);
    expect(result!.isDownVoted).toBe(true);
  });

  it('sets no vote status when user has not voted', () => {
    const post = makePost({
      active_votes: [{ voter: 'bob', rshares: 1000 }],
    });
    const result = parsePost(post, 'alice', false);
    expect(result!.isUpVoted).toBe(false);
    expect(result!.isDownVoted).toBe(false);
  });

  it('sets isMuted for gray stats', () => {
    const post = makePost({ stats: { gray: true }, author_reputation: 50 });
    const result = parsePost(post, 'viewer', false);
    expect(result!.isMuted).toBe(true);
  });

  it('sets isMuted for low reputation', () => {
    const post = makePost({ author_reputation: 10 });
    // parseReputation mock returns floor of input if 0 < x <= 100
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { parseReputation } = require('./user');
    parseReputation.mockReturnValueOnce(10);
    const result = parsePost(post, 'viewer', false);
    expect(result!.isMuted).toBe(true);
  });

  it('sets isMuted for heavily downvoted posts', () => {
    const post = makePost({
      net_rshares: -8000000000,
      active_votes: [{ voter: 'a' }, { voter: 'b' }, { voter: 'c' }, { voter: 'd' }],
      author_reputation: 50,
    });
    const result = parsePost(post, 'viewer', false);
    expect(result!.isMuted).toBe(true);
  });

  it('stamps post_fetched_at', () => {
    const post = makePost();
    const result = parsePost(post, 'viewer', false, false, false, 1700000000);
    expect(result!.post_fetched_at).toBe(1700000000);
  });

  it('uses current time when no timestamp provided', () => {
    const before = Date.now();
    const post = makePost();
    const result = parsePost(post, 'viewer', false);
    expect(result!.post_fetched_at).toBeGreaterThanOrEqual(before);
  });

  it('discards body when discardBody is true', () => {
    const post = makePost();
    const result = parsePost(post, 'viewer', false, false, true);
    expect(result!.body).toBe('');
  });

  it('uses json_metadata description for summary when available', () => {
    const post = makePost({
      json_metadata: { tags: ['test'], description: 'custom desc' },
    });
    const result = parsePost(post, 'viewer', false);
    expect(result!.summary).toBe('custom desc');
  });

  describe('parseTags (via parsePost)', () => {
    it('splits comma-space separated tag strings', () => {
      const post = makePost({ json_metadata: { tags: 'tag1, tag2, tag3' } });
      const result = parsePost(post, 'viewer', false);
      expect(result!.json_metadata.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('splits comma separated tag strings', () => {
      const post = makePost({ json_metadata: { tags: 'tag1,tag2,tag3' } });
      const result = parsePost(post, 'viewer', false);
      expect(result!.json_metadata.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('splits space separated tag strings', () => {
      const post = makePost({ json_metadata: { tags: 'tag1 tag2 tag3' } });
      const result = parsePost(post, 'viewer', false);
      expect(result!.json_metadata.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('leaves array tags unchanged', () => {
      const post = makePost({ json_metadata: { tags: ['a', 'b'] } });
      const result = parsePost(post, 'viewer', false);
      expect(result!.json_metadata.tags).toEqual(['a', 'b']);
    });
  });

  describe('parseLinksMeta (via parsePost)', () => {
    it('keeps well-formed links_meta', () => {
      const post = makePost({
        json_metadata: {
          tags: [],
          links_meta: {
            'https://example.com': {
              title: 'Example',
              summary: 'A test link',
              image: 'https://img.com/x.jpg',
            },
          },
        },
      });
      const result = parsePost(post, 'viewer', false);
      expect(result!.json_metadata.links_meta['https://example.com']).toBeDefined();
    });

    it('removes malformed links_meta entries', () => {
      const post = makePost({
        json_metadata: {
          tags: [],
          links_meta: {
            'https://bad.com': { title: 'Only title' }, // missing summary and image
          },
        },
      });
      const result = parsePost(post, 'viewer', false);
      expect(result!.json_metadata.links_meta).toBeUndefined();
    });

    it('preserves json_metadata without links_meta', () => {
      const post = makePost({
        json_metadata: { tags: ['test'] },
      });
      const result = parsePost(post, 'viewer', false);
      expect(result!.json_metadata.links_meta).toBeUndefined();
    });
  });

  describe('image_ratios', () => {
    it('uses numeric ratio directly as thumbRatio', () => {
      const post = makePost({
        json_metadata: { tags: [], image_ratios: [1.5, 0.75] },
      });
      const result = parsePost(post, 'viewer', false);
      expect(result!.thumbRatio).toBe(1.5);
    });

    it('converts width/height objects to ratios', () => {
      const post = makePost({
        json_metadata: { tags: [], image_ratios: [{ width: 800, height: 400 }] },
      });
      const result = parsePost(post, 'viewer', false);
      expect(result!.json_metadata.image_ratios[0]).toBe(2);
    });

    it('ignores NaN ratios', () => {
      const post = makePost({
        json_metadata: { tags: [], image_ratios: [NaN] },
      });
      const result = parsePost(post, 'viewer', false);
      expect(result!.thumbRatio).toBeUndefined();
    });
  });
});

describe('parseComment', () => {
  const makeComment = (overrides = {}) => ({
    author: 'commenter',
    body: 'Nice post!',
    json_metadata: '{}',
    author_reputation: 55,
    pending_payout_value: '0.100 HBD',
    author_payout_value: '0.000 HBD',
    curator_payout_value: '0.000 HBD',
    max_accepted_payout: '100000.000 HBD',
    active_votes: [],
    children: 0,
    net_rshares: 100,
    updated: '2024-01-01T00:00:00',
    ...overrides,
  });

  it('stores markdownBody from original body', () => {
    const comment = makeComment({ body: '**bold**' });
    const result = parseComment(comment, 'viewer');
    expect(result.markdownBody).toBe('**bold**');
  });

  it('renders body as HTML', () => {
    const comment = makeComment({ body: 'test content' });
    const result = parseComment(comment, 'viewer');
    expect(result.body).toContain('<p>');
  });

  it('calculates total_payout', () => {
    const comment = makeComment({
      pending_payout_value: '0.500 HBD',
      author_payout_value: '0.300 HBD',
      curator_payout_value: '0.200 HBD',
    });
    const result = parseComment(comment, 'viewer');
    expect(result.total_payout).toBe(1);
  });

  it('sets isDeletable when no votes, children, or rshares', () => {
    const comment = makeComment({
      active_votes: [],
      children: 0,
      net_rshares: 0,
    });
    const result = parseComment(comment, 'viewer');
    expect(result.isDeletable).toBe(true);
  });

  it('sets isDeletable false when has votes', () => {
    const comment = makeComment({
      active_votes: [{ voter: 'alice', rshares: 100 }],
      children: 0,
      net_rshares: 100,
    });
    const result = parseComment(comment, 'viewer');
    expect(result.isDeletable).toBe(false);
  });

  it('sets isDeletable false when has children', () => {
    const comment = makeComment({ children: 2 });
    const result = parseComment(comment, 'viewer');
    expect(result.isDeletable).toBe(false);
  });

  it('sets vote status', () => {
    const comment = makeComment({
      active_votes: [{ voter: 'alice', rshares: 500 }],
    });
    const result = parseComment(comment, 'alice');
    expect(result.isUpVoted).toBe(true);
    expect(result.isDownVoted).toBe(false);
  });
});

describe('parseComments', () => {
  it('returns null for null input', () => {
    expect(parseComments(null as any)).toBeNull();
  });

  it('parses array of comments', () => {
    const comments = [
      {
        author: 'a',
        body: 'x',
        json_metadata: '{}',
        author_reputation: 50,
        pending_payout_value: '0',
        author_payout_value: '0',
        curator_payout_value: '0',
        max_accepted_payout: '100000.000 HBD',
        active_votes: [],
        children: 0,
        net_rshares: 0,
        updated: '',
      },
      {
        author: 'b',
        body: 'y',
        json_metadata: '{}',
        author_reputation: 60,
        pending_payout_value: '0',
        author_payout_value: '0',
        curator_payout_value: '0',
        max_accepted_payout: '100000.000 HBD',
        active_votes: [],
        children: 0,
        net_rshares: 0,
        updated: '',
      },
    ];
    const result = parseComments(comments);
    expect(result).toHaveLength(2);
    expect(result![0].avatar).toContain('a');
    expect(result![1].avatar).toContain('b');
  });
});

describe('parseCommentThreads', () => {
  it('returns null for null commentsMap', async () => {
    const result = await parseCommentThreads(null, 'author', 'permlink');
    expect(result).toBeNull();
  });

  it('builds thread from flat map', async () => {
    const commentsMap = {
      'author/permlink': {
        author: 'author',
        body: 'root',
        json_metadata: '{}',
        author_reputation: 50,
        pending_payout_value: '0',
        author_payout_value: '0',
        curator_payout_value: '0',
        max_accepted_payout: '100000.000 HBD',
        active_votes: [],
        children: 1,
        net_rshares: 0,
        updated: '',
        parent_author: 'op',
        parent_permlink: 'post',
        replies: ['replier/re-post'],
      },
      'replier/re-post': {
        author: 'replier',
        body: 'reply',
        json_metadata: '{}',
        author_reputation: 40,
        pending_payout_value: '0',
        author_payout_value: '0',
        curator_payout_value: '0',
        max_accepted_payout: '100000.000 HBD',
        active_votes: [],
        children: 0,
        net_rshares: 0,
        updated: '',
        parent_author: 'author',
        parent_permlink: 'permlink',
        replies: [],
      },
    };
    const result = await parseCommentThreads(commentsMap, 'op', 'post');
    expect(result).toHaveLength(1);
    expect(result![0].author).toBe('author');
  });
});

describe('mapDiscussionToThreads', () => {
  it('returns null for null input', async () => {
    expect(await mapDiscussionToThreads(null, 'a', 'p')).toBeNull();
  });

  it('builds threads without parsing comments', async () => {
    const commentsMap = {
      'commenter/reply': {
        author: 'commenter',
        body: 'hi',
        parent_author: 'op',
        parent_permlink: 'post',
        replies: [],
      },
    };
    const result = await mapDiscussionToThreads(commentsMap, 'op', 'post');
    expect(result).toHaveLength(1);
    expect(result![0].body).toBe('hi'); // raw, not parsed
  });
});

describe('parseActiveVotes', () => {
  it('parses votes and adds reward info', () => {
    const post = {
      active_votes: [
        { voter: 'alice', rshares: 1000, percent: 10000 },
        { voter: 'bob', rshares: 500, percent: 5000 },
      ],
    };
    const result = parseActiveVotes(post);
    expect(result).toHaveLength(2);
    expect(result[0].reward).toBeDefined();
    expect(result[0].percent100).toBe(100);
    expect(result[1].percent100).toBe(50);
  });

  it('handles empty votes array', () => {
    const post = { active_votes: [] };
    const result = parseActiveVotes(post);
    expect(result).toEqual([]);
  });

  it('handles missing active_votes', () => {
    const post = {};
    const result = parseActiveVotes(post);
    expect(result).toEqual([]);
  });
});

describe('parseVote', () => {
  it('adds reward, percent100, is_down_vote, and avatar', () => {
    const vote = { voter: 'alice', rshares: 1000, percent: 10000 };
    const post = { total_payout: 10 };
    const result = parseVote(vote, post, 2000);

    expect(result.reward).toBeDefined();
    expect(result.percent100).toBe(100);
    expect(result.is_down_vote).toBe(false);
    expect(result.avatar).toContain('alice');
  });

  it('detects downvotes', () => {
    const vote = { voter: 'bob', rshares: -500, percent: -5000 };
    const result = parseVote(vote, {}, 1000);
    expect(result.is_down_vote).toBe(true);
    expect(result.percent100).toBe(-50);
  });
});
