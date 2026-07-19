import { cleanAiTools, makeJsonMetadata } from './editor';

// The AI-usage disclosure is optional and PeakD-compatible: only truthy flags are kept,
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
