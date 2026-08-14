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
});
