import { buildEditorRcPayload } from './rcPayload';

jest.mock('react-native-version-number', () => ({ appVersion: '3.0.0' }));

const draft = {
  title: 'Who the DHF has actually paid',
  body: 'A post about proposal payouts.\n\n![chart](https://images.ecency.com/chart.png)',
  tags: ['hive', 'dhf'],
};

const parent = {
  author: 'alice',
  permlink: 'a-post',
  json_metadata: { tags: ['photography'] },
};

describe('buildEditorRcPayload', () => {
  it('builds the post operation the editor broadcasts', async () => {
    const payload = await buildEditorRcPayload({ username: 'spacecop', fields: draft });

    expect(payload?.kind).toBe('comment');
    expect(payload?.op.author).toBe('spacecop');
    expect(payload?.op.parent_author).toBe('');
    // Category is the first tag.
    expect(payload?.op.parent_permlink).toBe('hive');
    expect(payload?.op.title).toBe(draft.title);
    // Mobile broadcasts the body as written, with no transformation.
    expect(payload?.op.body).toBe(draft.body);
    // generatePermlink caps the slug at five words, which is what the editor
    // sends, and only its length feeds the estimate.
    expect(payload?.op.permlink).toBe('who-the-dhf-has-actually');
  });

  /**
   * The reason the estimate is built from this rather than the raw draft: cost
   * tracks serialized size, and the real metadata is much larger than tags
   * alone.
   */
  it('carries the full metadata, not just tags', async () => {
    const payload = await buildEditorRcPayload({ username: 'spacecop', fields: draft });
    const meta = JSON.parse(payload!.op.json_metadata);

    expect(meta.tags).toEqual(['hive', 'dhf']);
    expect(meta.app).toContain('ecency');
    expect(meta.format).toBe('markdown+html');
    expect(meta.image).toContain('https://images.ecency.com/chart.png');
    expect(payload!.op.json_metadata.length).toBeGreaterThan(
      JSON.stringify({ tags: draft.tags }).length * 2,
    );
  });

  it('grows the payload with the body, which is what moves the estimate', async () => {
    const small = await buildEditorRcPayload({ username: 'spacecop', fields: draft });
    const large = await buildEditorRcPayload({
      username: 'spacecop',
      fields: { ...draft, body: `${draft.body}\n\n${'x'.repeat(40000)}` },
    });

    expect(large!.op.body.length).toBeGreaterThan(small!.op.body.length + 39000);
  });

  it('falls back to the default tag when the draft has none, as the editor does', async () => {
    const payload = await buildEditorRcPayload({
      username: 'spacecop',
      fields: { ...draft, tags: [] },
    });

    expect(payload?.op.parent_permlink).toBe('hive-125125');
  });

  it('drops blank tags the same way the editor does', async () => {
    const payload = await buildEditorRcPayload({
      username: 'spacecop',
      fields: { ...draft, tags: [' ', '', 'hive'] as any },
    });

    expect(payload?.op.parent_permlink).toBe('hive');
    expect(JSON.parse(payload!.op.json_metadata).tags).toEqual(['hive']);
  });

  it('folds in an AI disclosure when one is set', async () => {
    const payload = await buildEditorRcPayload({
      username: 'spacecop',
      fields: { ...draft, aiTools: { writing_edit: true } },
    });

    expect(JSON.parse(payload!.op.json_metadata).ai_tools).toEqual({ writing_edit: true });
  });

  describe('replies', () => {
    it('targets the parent and carries no title', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { body: 'nice post, thanks' },
        post: parent,
        isReply: true,
        replyPermlink: 're-alice-20260814t120000000z',
      });

      expect(payload?.op.parent_author).toBe('alice');
      expect(payload?.op.parent_permlink).toBe('a-post');
      expect(payload?.op.title).toBe('');
      expect(payload?.op.permlink).toBe('re-alice-20260814t120000000z');
      // A reply inherits the parent's tags, which is what the editor sends.
      expect(JSON.parse(payload!.op.json_metadata).tags).toEqual(['photography']);
    });

    it('falls back to the ecency tag when the parent has none', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { body: 'nice post' },
        post: { author: 'alice', permlink: 'a-post', json_metadata: {} },
        isReply: true,
        replyPermlink: 're-alice-1',
      });

      expect(JSON.parse(payload!.op.json_metadata).tags).toEqual(['ecency']);
    });
  });

  describe('when there is nothing to price', () => {
    it('returns nothing without a body', async () => {
      expect(
        await buildEditorRcPayload({ username: 'spacecop', fields: { ...draft, body: '' } }),
      ).toBeUndefined();
    });

    it('returns nothing without an account', async () => {
      expect(await buildEditorRcPayload({ username: '', fields: draft })).toBeUndefined();
    });
  });

  // Regression: a post always broadcasts comment_options beside the comment,
  // even on default reward settings. Omitting it understated every post.
  describe('comment_options', () => {
    it('carries options for a new post, on default settings', async () => {
      const payload = await buildEditorRcPayload({ username: 'spacecop', fields: draft });

      expect(payload?.options).toBeDefined();
    });

    it('carries the beneficiaries the post will actually send', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: draft,
        beneficiaries: [{ account: 'ecency', weight: 500 }],
      });

      expect(payload?.options?.beneficiaries).toEqual([{ account: 'ecency', weight: 500 }]);
    });

    it('carries none for a reply, which sends no options', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { body: 'nice post' },
        post: parent,
        isReply: true,
        replyPermlink: 're-alice-1',
      });

      expect(payload?.options).toBeUndefined();
    });
  });

  // Regression: a poll goes into json_metadata and can be large, so a poll post
  // could pass the precheck and still be rejected.
  it('prices the poll the post will carry', async () => {
    const withoutPoll = await buildEditorRcPayload({ username: 'spacecop', fields: draft });
    const withPoll = await buildEditorRcPayload({
      username: 'spacecop',
      fields: draft,
      pollDraft: {
        title: 'Which proposal deserves funding the most this year?',
        choices: Array.from({ length: 12 }, (_, i) => `A reasonably long choice number ${i}`),
        interpretation: 'number_of_votes',
        endTime: '2026-09-01T00:00:00.000Z',
        voteChange: true,
        hideVotes: false,
        hideResults: false,
        maxChoicesVoted: 1,
        filters: { accountAge: 7 },
      } as any,
    });

    expect(withPoll!.op.json_metadata.length).toBeGreaterThan(withoutPoll!.op.json_metadata.length);
  });

  it('prices the video thumbnails the post will carry', async () => {
    const plain = await buildEditorRcPayload({ username: 'spacecop', fields: draft });
    const withThumbs = await buildEditorRcPayload({
      username: 'spacecop',
      fields: draft,
      videoThumbUrls: ['https://images.ecency.com/video-thumb-one.png'],
    });

    expect(withThumbs!.op.json_metadata).toContain('video-thumb-one');
    expect(withThumbs!.op.json_metadata.length).toBeGreaterThan(plain!.op.json_metadata.length);
  });

  /**
   * Regression: an edit keeps the post's identity and usually sends a diff, so
   * pricing it as a brand new post invents warnings rather than missing them.
   */
  describe('edits', () => {
    const editedPost = {
      permlink: 'the-original-permlink',
      parent_author: '',
      parent_permlink: 'hive',
      markdownBody: `${'The original body. '.repeat(500)}`,
      json_metadata: { tags: ['hive'], app: 'ecency/3.0.0-mobile' },
    };

    it('keeps the original permlink and parent rather than deriving new ones', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { ...draft, body: `${editedPost.markdownBody}One added sentence.` },
        post: editedPost,
        isEdit: true,
      });

      expect(payload?.op.permlink).toBe('the-original-permlink');
      expect(payload?.op.parent_permlink).toBe('hive');
      expect(payload?.op.parent_author).toBe('');
    });

    it('sends a diff, so a small change to a long post stays small', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { ...draft, body: `${editedPost.markdownBody}One added sentence.` },
        post: editedPost,
        isEdit: true,
      });

      expect(payload!.op.body.length).toBeLessThan(editedPost.markdownBody.length / 2);
    });

    it('sends the whole body when a diff would not be smaller', async () => {
      const replacement = 'Completely different text, nothing in common with what came before.';
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { ...draft, body: replacement },
        post: editedPost,
        isEdit: true,
      });

      expect(payload?.op.body).toBe(replacement);
    });

    it('sends no comment_options, matching the update path', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { ...draft, body: 'edited' },
        post: editedPost,
        isEdit: true,
      });

      expect(payload?.options).toBeUndefined();
    });

    it('keeps an AI disclosure the author is not touching', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { ...draft, body: 'edited', aiTools: undefined },
        post: {
          ...editedPost,
          json_metadata: { ...editedPost.json_metadata, ai_tools: { writing_edit: true } },
        },
        isEdit: true,
      });

      expect(JSON.parse(payload!.op.json_metadata).ai_tools).toEqual({ writing_edit: true });
    });

    it('returns nothing when there is no post to edit', async () => {
      expect(
        await buildEditorRcPayload({ username: 'spacecop', fields: draft, isEdit: true }),
      ).toBeUndefined();
    });
  });

  // Regression: the stored list is not what gets broadcast. Submit adds a
  // mandatory 3Speak row for an embedded video and the author's support row
  // when they never set a list, and each lands in comment_options.
  describe('submit-time beneficiaries', () => {
    // The matcher looks for the embed URL specifically, not a watch link.
    const THREESPEAK_BODY = `${draft.body}\n\n<iframe src="https://3speak.tv/embed?v=spacecop/abcdefghi"></iframe>`;

    it('adds the 3Speak beneficiary an embed forces', async () => {
      const plain = await buildEditorRcPayload({ username: 'spacecop', fields: draft });
      const withVideo = await buildEditorRcPayload({
        username: 'spacecop',
        fields: { ...draft, body: THREESPEAK_BODY },
      });

      expect(plain?.options?.beneficiaries ?? []).toHaveLength(0);
      expect(withVideo?.options?.beneficiaries?.length).toBeGreaterThan(0);
    });

    it('adds the support beneficiary when the author never set a list', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: draft,
        hasExplicitBeneficiaries: false,
        supportPercent: 5,
      });

      expect(payload?.options?.beneficiaries?.length).toBeGreaterThan(0);
    });

    it('leaves an author-set list alone, as the submit path does', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: draft,
        beneficiaries: [{ account: 'alice', weight: 1000 }],
        hasExplicitBeneficiaries: true,
        supportPercent: 5,
      });

      expect(payload?.options?.beneficiaries).toEqual([{ account: 'alice', weight: 1000 }]);
    });

    it('adds nothing for the support account itself', async () => {
      const payload = await buildEditorRcPayload({
        username: 'ecency',
        fields: draft,
        hasExplicitBeneficiaries: false,
        supportPercent: 5,
      });

      expect(payload?.options?.beneficiaries ?? []).toHaveLength(0);
    });

    it('adds nothing when the support percentage is unset or unknown', async () => {
      const payload = await buildEditorRcPayload({
        username: 'spacecop',
        fields: draft,
        hasExplicitBeneficiaries: false,
      });

      expect(payload?.options?.beneficiaries ?? []).toHaveLength(0);
    });
  });
});
