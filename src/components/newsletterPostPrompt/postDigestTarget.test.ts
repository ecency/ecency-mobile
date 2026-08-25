import { pickPostDigestTarget, postPromptStorageKey } from './postDigestTarget';

const rootPost = { author: 'alice', category: 'photography', parent_author: '', depth: 0 };
const communityPost = { author: 'alice', category: 'hive-125125', parent_author: '', depth: 0 };

describe('pickPostDigestTarget', () => {
  it('offers a reader the author creator digest on a root post', () => {
    expect(pickPostDigestTarget(rootPost, 'bob')).toEqual({ type: 'creator', target: 'alice' });
    expect(pickPostDigestTarget(communityPost, 'bob')).toEqual({
      type: 'creator',
      target: 'alice',
    });
  });

  it('offers the author of a community post that community digest, and nothing on their own blog post', () => {
    expect(pickPostDigestTarget(communityPost, 'alice')).toEqual({
      type: 'community',
      target: 'hive-125125',
    });
    expect(pickPostDigestTarget(rootPost, 'alice')).toBeNull();
  });

  it('offers nothing on comments or to anonymous viewers', () => {
    expect(pickPostDigestTarget({ ...rootPost, parent_author: 'x', depth: 1 }, 'bob')).toBeNull();
    expect(pickPostDigestTarget({ ...rootPost, depth: 2, parent_author: 'x' }, 'bob')).toBeNull();
    expect(pickPostDigestTarget(rootPost, null)).toBeNull();
    expect(pickPostDigestTarget(rootPost, undefined)).toBeNull();
    expect(pickPostDigestTarget(null, 'bob')).toBeNull();
  });

  it('scopes the dismissal key per viewer and list', () => {
    expect(postPromptStorageKey('bob', 'creator', 'alice')).toBe(
      'digest_post_prompt_bob_creator_alice',
    );
    expect(postPromptStorageKey('bob', 'creator', 'alice')).not.toBe(
      postPromptStorageKey('carol', 'creator', 'alice'),
    );
  });
});
