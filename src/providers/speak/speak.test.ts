import { extractPermlink, getUploadTuning, uploadVideoEmbed } from './speak';

// Controllable tus-js-client mock. Must be named `mock*` so jest's hoist allows
// referencing it from the (hoisted) jest.mock factory below.
const mockTus = {
  runUpload: (_options: any) => {},
};

jest.mock('tus-js-client', () => ({
  Upload: class {
    options: any;

    constructor(_file: any, options: any) {
      this.options = options;
    }

    start() {
      mockTus.runUpload(this.options);
    }

    abort() {
      return Promise.resolve();
    }
  },
}));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { ECENCY_BACKEND_API: 'https://ecency.test' },
}));

const MB = 1024 * 1024;

// A tus response whose getHeader returns `embedUrl` for the X-Embed-URL header.
const mockRes = (embedUrl: string | null) => ({
  getHeader: (h: string) => (/^x-embed-url$/i.test(h) ? embedUrl : null),
});
// A tus request whose getHeader returns `uploadConcat` for Upload-Concat.
const mockReq = (uploadConcat?: string) => ({
  getHeader: (h: string) => (h === 'Upload-Concat' ? uploadConcat : undefined),
});

describe('extractPermlink', () => {
  it('extracts permlink from ?v=user/permlink', () => {
    expect(extractPermlink('https://play.3speak.tv/embed?v=alice/abcd1234')).toBe('abcd1234');
  });

  it('extracts permlink from @user/permlink', () => {
    expect(extractPermlink('@alice/abcd1234')).toBe('abcd1234');
  });
});

describe('getUploadTuning', () => {
  it('keeps small files (<= 10 MB) sequential', () => {
    expect(getUploadTuning(0)).toEqual({ chunkSize: 5 * MB, parallelUploads: 1 });
    expect(getUploadTuning(10 * MB)).toEqual({ chunkSize: 5 * MB, parallelUploads: 1 });
  });

  it('uses 10 MB x 3 parallel above 10 MB up to 500 MB', () => {
    expect(getUploadTuning(10 * MB + 1)).toEqual({ chunkSize: 10 * MB, parallelUploads: 3 });
    expect(getUploadTuning(500 * MB)).toEqual({ chunkSize: 10 * MB, parallelUploads: 3 });
  });

  it('uses 20 MB x 3 parallel above 500 MB', () => {
    expect(getUploadTuning(500 * MB + 1)).toEqual({ chunkSize: 20 * MB, parallelUploads: 3 });
  });
});

const media = (size: number) =>
  ({ path: 'file:///tmp/video.mp4', size, filename: 'video.mp4' } as any);

// Token request returns a usable token (+ optional permlink/embed_url); the
// local-file fetch (used to build the Blob) returns a minimal blob-like object.
function stubFetch(tokenExtra: Record<string, unknown> = {}) {
  global.fetch = jest.fn((url: any) => {
    if (String(url).includes('/api/threespeak/upload-token')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'tok',
            upload_url: 'https://embed.test/uploads',
            ...tokenExtra,
          }),
      });
    }
    return Promise.resolve({ blob: () => Promise.resolve({ size: 0 }) });
  }) as any;
}

describe('uploadVideoEmbed with a token-bound permlink (preferred path)', () => {
  beforeEach(() => {
    mockTus.runUpload = () => {};
    stubFetch({ permlink: 'TOK12345', embed_url: 'https://play.3speak.tv/embed?v=a/TOK12345' });
  });

  it('keeps parallel uploads on for big files and resolves with the token URL', async () => {
    let seenParallel = -1;
    mockTus.runUpload = (options: any) => {
      seenParallel = options.parallelUploads;
      options.onSuccess();
    };
    await expect(uploadVideoEmbed(media(11 * MB), 'a', 'token', false, () => {})).resolves.toEqual({
      embedUrl: 'https://play.3speak.tv/embed?v=a/TOK12345',
      permlink: 'TOK12345',
    });
    expect(seenParallel).toBe(3);
  });

  it('uploads small files sequentially and resolves with the token URL', async () => {
    let seenParallel = -1;
    mockTus.runUpload = (options: any) => {
      seenParallel = options.parallelUploads;
      options.onSuccess();
    };
    await expect(uploadVideoEmbed(media(1024), 'a', 'token', false, () => {})).resolves.toEqual({
      embedUrl: 'https://play.3speak.tv/embed?v=a/TOK12345',
      permlink: 'TOK12345',
    });
    expect(seenParallel).toBe(1);
  });

  it('never re-uploads: a failed upload rejects without a second attempt', async () => {
    let attempts = 0;
    mockTus.runUpload = (options: any) => {
      attempts += 1;
      options.onError(new Error('network down'));
    };
    await expect(uploadVideoEmbed(media(11 * MB), 'a', 'token', false, () => {})).rejects.toThrow(
      /network down/,
    );
    expect(attempts).toBe(1);
  });
});

describe('uploadVideoEmbed against a legacy backend (header fallback)', () => {
  beforeEach(() => {
    mockTus.runUpload = () => {};
    stubFetch(); // no permlink/embed_url in the token response
  });

  it('uploads sequentially even for big files and reads the X-Embed-URL header', async () => {
    let seenParallel = -1;
    mockTus.runUpload = (options: any) => {
      seenParallel = options.parallelUploads;
      options.onAfterResponse(mockReq(), mockRes('https://play.3speak.tv/embed?v=a/SEQ12345'));
      options.onSuccess();
    };
    await expect(uploadVideoEmbed(media(11 * MB), 'a', 'token', false, () => {})).resolves.toEqual({
      embedUrl: 'https://play.3speak.tv/embed?v=a/SEQ12345',
      permlink: 'SEQ12345',
    });
    // Legacy path must avoid the racy parallel/concat header delivery.
    expect(seenParallel).toBe(1);
  });

  it('falls back to the header path when the token carries only a permlink', async () => {
    // Partial token response (permlink but no embed_url) must not be used as the
    // result — it should fall through to the sequential header path.
    stubFetch({ permlink: 'TOK12345' });
    let seenParallel = -1;
    mockTus.runUpload = (options: any) => {
      seenParallel = options.parallelUploads;
      options.onAfterResponse(mockReq(), mockRes('https://play.3speak.tv/embed?v=a/SEQ99999'));
      options.onSuccess();
    };
    await expect(uploadVideoEmbed(media(11 * MB), 'a', 'token', false, () => {})).resolves.toEqual({
      embedUrl: 'https://play.3speak.tv/embed?v=a/SEQ99999',
      permlink: 'SEQ99999',
    });
    expect(seenParallel).toBe(1);
  });

  it('rejects when the backend returns no embed URL header', async () => {
    mockTus.runUpload = (options: any) => {
      options.onSuccess();
    };
    await expect(uploadVideoEmbed(media(1024), 'a', 'token', false, () => {})).rejects.toThrow(
      /no embed URL was returned/,
    );
  });

  it('propagates the upload error', async () => {
    mockTus.runUpload = (options: any) => {
      options.onError(new Error('network down'));
    };
    await expect(uploadVideoEmbed(media(1024), 'a', 'token', false, () => {})).rejects.toThrow(
      /network down/,
    );
  });
});
