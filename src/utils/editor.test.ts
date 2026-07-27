import {
  cleanAiTools,
  collectVideoThumbUrls,
  makeJsonMetadata,
  restoreVideoThumbs,
} from './editor';

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

// A saved draft stores its cover as a flat meta.image[0] with no link to the video it came
// from, so the association has to be inferred, and only when it is unambiguous.
describe('restoreVideoThumbs', () => {
  const embedA = 'https://3speak.tv/embed?v=alice/aaa';
  const embedB = 'https://3speak.tv/embed?v=bob/bbb';
  const cover = 'https://img/a.jpg';

  it('rebuilds the association for a single video draft', () => {
    expect(restoreVideoThumbs(`text\n${embedA}\n`, [cover])).toEqual([
      { embedUrl: embedA, thumbUrl: cover },
    ]);
  });

  it('returns nothing when the draft has no cover or no embed', () => {
    expect(restoreVideoThumbs(`\n${embedA}\n`, [])).toEqual([]);
    expect(restoreVideoThumbs(`\n${embedA}\n`, undefined)).toEqual([]);
    expect(restoreVideoThumbs('just text', [cover])).toEqual([]);
    expect(restoreVideoThumbs(undefined, [cover])).toEqual([]);
  });

  // With several embeds the cover cannot be attributed to one of them. Guessing would let a
  // removed video's cover survive into a post that no longer contains it.
  it('refuses to guess in a multi video draft', () => {
    expect(restoreVideoThumbs(`\n${embedA}\n${embedB}\n`, [cover])).toEqual([]);
  });

  it('drops the restored cover once its video is removed from the body', () => {
    // Reopen a single video draft, then delete the video
    const restored = restoreVideoThumbs(`\n${embedA}\n`, [cover]);
    expect(collectVideoThumbUrls({ videoThumbs: restored, body: `\n${embedA}\n` })).toEqual([
      cover,
    ]);
    expect(collectVideoThumbUrls({ videoThumbs: restored, body: 'video deleted' })).toEqual([]);
  });

  it('does not carry the cover over to a replacement video', () => {
    const restored = restoreVideoThumbs(`\n${embedA}\n`, [cover]);
    expect(collectVideoThumbUrls({ videoThumbs: restored, body: `\n${embedB}\n` })).toEqual([]);
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
