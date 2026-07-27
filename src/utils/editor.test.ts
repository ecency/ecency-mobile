import { cleanAiTools, collectVideoThumbUrls, makeJsonMetadata } from './editor';

// Video thumbnails are not present in the body, so they are carried in state keyed by the
// embed they belong to. Only thumbnails whose embed is still in the body stay eligible.
describe('collectVideoThumbUrls', () => {
  const thumbA = { embedUrl: 'https://3speak.tv/embed?v=alice/aaa', thumbUrl: 'https://img/a.jpg' };
  const thumbB = { embedUrl: 'https://3speak.tv/embed?v=bob/bbb', thumbUrl: 'https://img/b.jpg' };

  it('returns an empty list for missing input', () => {
    expect(collectVideoThumbUrls({ body: 'body' })).toEqual([]);
    expect(collectVideoThumbUrls({ videoThumbs: [], body: 'body' })).toEqual([]);
    expect(collectVideoThumbUrls({ videoThumbs: [thumbA] })).toEqual([]);
    expect(collectVideoThumbUrls({ videoThumbs: [thumbA], body: '' })).toEqual([]);
  });

  it('keeps a thumbnail while its embed is in the body', () => {
    expect(
      collectVideoThumbUrls({ videoThumbs: [thumbA], body: `text\n${thumbA.embedUrl}\nmore` }),
    ).toEqual([thumbA.thumbUrl]);
  });

  it('drops a thumbnail once its embed is removed from the body', () => {
    expect(collectVideoThumbUrls({ videoThumbs: [thumbA], body: 'the video was deleted' })).toEqual(
      [],
    );
  });

  it('keeps only the embeds still present when several were uploaded', () => {
    expect(
      collectVideoThumbUrls({
        videoThumbs: [thumbA, thumbB],
        body: `only ${thumbB.embedUrl} left`,
      }),
    ).toEqual([thumbB.thumbUrl]);
  });

  it('does not keep a removed video whose embed url is a prefix of the one replacing it', () => {
    const replacement = { embedUrl: `${thumbA.embedUrl}2`, thumbUrl: 'https://img/a2.jpg' };
    expect(
      collectVideoThumbUrls({
        videoThumbs: [thumbA, replacement],
        body: `\n${replacement.embedUrl}\n`,
      }),
    ).toEqual([replacement.thumbUrl]);
  });

  it('drops everything when the editor is cleared', () => {
    expect(collectVideoThumbUrls({ videoThumbs: [thumbA, thumbB], body: '' })).toEqual([]);
  });

  it('restores a reopened draft cover while a video embed is still in the body', () => {
    expect(
      collectVideoThumbUrls({
        restoredThumbUrls: [thumbA.thumbUrl],
        body: `\n${thumbA.embedUrl}\n`,
      }),
    ).toEqual([thumbA.thumbUrl]);
  });

  it('ignores a restored cover when the body holds no video embed', () => {
    expect(
      collectVideoThumbUrls({ restoredThumbUrls: [thumbA.thumbUrl], body: 'just text' }),
    ).toEqual([]);
  });

  it('omits thumbnails that are already images in the body, to avoid duplicates', () => {
    const inBody = 'https://img/a.jpg';
    expect(
      collectVideoThumbUrls({
        videoThumbs: [thumbA],
        body: `![x](${inBody})\n${thumbA.embedUrl}\n`,
      }),
    ).toEqual([]);
  });
});

// The AI-usage disclosure is optional and interoperable with other Hive frontends: only
// the truthy flags are kept,
// and the object is dropped entirely when nothing is disclosed.
describe('cleanAiTools', () => {
  it('returns undefined for undefined/null input', () => {
    expect(cleanAiTools(undefined)).toBeUndefined();
    expect(cleanAiTools(null)).toBeUndefined();
  });

  it('returns undefined for an empty object', () => {
    expect(cleanAiTools({})).toBeUndefined();
  });

  it('returns undefined when every flag is false', () => {
    expect(cleanAiTools({ media_generation: false, writing_edit: false })).toBeUndefined();
  });

  it('keeps only the truthy flags', () => {
    expect(cleanAiTools({ media_generation: true, writing_edit: false })).toEqual({
      media_generation: true,
    });
  });

  it('keeps both flags when both are disclosed', () => {
    expect(cleanAiTools({ media_generation: true, writing_edit: true })).toEqual({
      media_generation: true,
      writing_edit: true,
    });
  });
});

describe('makeJsonMetadata ai_tools passthrough', () => {
  it('carries ai_tools set on meta into json_metadata', () => {
    const meta = { image: [], ai_tools: { media_generation: true } };
    const json = makeJsonMetadata(meta, ['ecency']);
    expect(json.ai_tools).toEqual({ media_generation: true });
    expect(json.tags).toEqual(['ecency']);
  });

  it('omits ai_tools when meta has none', () => {
    const json = makeJsonMetadata({ image: [] }, ['ecency']);
    expect(json.ai_tools).toBeUndefined();
  });
});
