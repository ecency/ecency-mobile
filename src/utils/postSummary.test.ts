// Deliberately NOT mocking @ecency/render-helper: the guarantees below (markdown
// stripped, cap honoured, text without spaces still excerpted) only mean
// something against the real summariser.
import { postBodySummary } from '@ecency/render-helper';
import { parseSummary, summarizeText, SUMMARY_LENGTH } from './postSummary';

// What a client that copies the whole post into `description` publishes.
const MARKDOWN_BODY = [
  'https://youtu.be/abc123',
  '',
  '![Image](https://images.hive.blog/cover.png)',
  '',
  '# Dev Update',
  '',
  '## Inbox Rendering Fix',
  '',
  '* Fixed an issue where text lines could appear in the **wrong order** on the Inbox page.',
  '* Added **preLinkMentions** processing to **hiveBodyRenderer.ts**.',
  '',
  '| | |',
  '|---|---|',
  '| [![](https://images.hive.blog/a.png)](https://example.com/) | [Docs](https://x.io/d) |',
]
  .join('\n')
  .repeat(6);

const CJK = '這是一段完全沒有空格的中文描述文字'.repeat(20);

const post = (description: unknown, body = 'Plain body text for the fallback.') => ({
  author: 'alice',
  permlink: `summary-${Math.random().toString(36).slice(2)}`,
  updated: '2024-01-01T00:00:00',
  body,
  json_metadata: description === undefined ? {} : { description },
});

describe('summarizeText', () => {
  it('strips markdown and caps at the requested length', () => {
    const text = summarizeText(MARKDOWN_BODY, SUMMARY_LENGTH);
    // postBodySummary's joiner may overshoot the cap by one word, never by more.
    expect(text.length).toBeLessThanOrEqual(SUMMARY_LENGTH + 10);
    expect(text.startsWith('Dev Update Inbox Rendering Fix')).toBe(true);
    expect(text).not.toMatch(/[#*|]|!\[|http/);
  });

  it('keeps a bounded excerpt of text without spaces instead of dropping it', () => {
    expect(postBodySummary(CJK, SUMMARY_LENGTH, 'ios')).toBe(''); // the helper's own behaviour
    const text = summarizeText(CJK, SUMMARY_LENGTH);
    expect(text).toBe(CJK.slice(0, SUMMARY_LENGTH));
  });

  it('cuts space-less text by code point, never through a surrogate pair', () => {
    const text = summarizeText('🎉'.repeat(400), SUMMARY_LENGTH);
    expect(Array.from(text)).toHaveLength(SUMMARY_LENGTH);
    expect(text).toBe('🎉'.repeat(SUMMARY_LENGTH));
  });

  it('returns an empty string for text that strips to nothing', () => {
    expect(summarizeText('![](https://images.hive.blog/x.png)', SUMMARY_LENGTH)).toBe('');
  });
});

describe('parseSummary', () => {
  it('keeps a short author-written description, trimmed', () => {
    expect(parseSummary(post('  Author summary  '))).toBe('Author summary');
  });

  it('strips markdown from a whole-body description and caps it', () => {
    const text = parseSummary(post(MARKDOWN_BODY));
    expect(text.length).toBeLessThanOrEqual(SUMMARY_LENGTH + 10);
    expect(text.startsWith('Dev Update Inbox Rendering Fix')).toBe(true);
  });

  it('keeps an excerpt of a description without spaces', () => {
    expect(parseSummary(post(CJK))).toBe(CJK.slice(0, SUMMARY_LENGTH));
  });

  it('ignores a non-string description and summarises the body', () => {
    expect(parseSummary(post({ en: 'nope' }))).toBe('Plain body text for the fallback.');
  });

  it('falls back to the body when the description is blank', () => {
    expect(parseSummary(post('   '))).toBe('Plain body text for the fallback.');
  });

  it('falls back to the body when the description strips to nothing', () => {
    expect(parseSummary(post('![](https://images.hive.blog/x.png)'))).toBe(
      'Plain body text for the fallback.',
    );
  });

  it('summarises the body when there is no description', () => {
    expect(parseSummary(post(undefined, '## Body **heading** here'))).toBe('Body heading here');
  });
});
