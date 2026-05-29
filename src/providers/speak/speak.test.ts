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

describe('uploadVideoEmbed', () => {
  const media = (size: number) =>
    ({ path: 'file:///tmp/video.mp4', size, filename: 'video.mp4' } as any);

  beforeEach(() => {
    mockTus.runUpload = () => {};
    // Token request returns a usable token + endpoint; the local-file fetch
    // (used to build the Blob) returns a minimal blob-like object.
    global.fetch = jest.fn((url: any) => {
      if (String(url).includes('/api/threespeak/upload-token')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: 'tok', upload_url: 'https://embed.test/uploads' }),
        });
      }
      return Promise.resolve({ blob: () => Promise.resolve({ size: 0 }) });
    }) as any;
  });

  it('falls back to sequential when the parallel attempt has no final-concat URL', async () => {
    mockTus.runUpload = (options: any) => {
      if (options.parallelUploads > 1) {
        // Parallel attempt: only a partial-creation URL, no final concat -> rejects.
        options.onAfterResponse(
          mockReq('partial'),
          mockRes('https://play.3speak.tv/embed?v=a/PART01'),
        );
        options.onSuccess();
      } else {
        // Sequential retry: backend returns a usable embed URL.
        options.onAfterResponse(mockReq(), mockRes('https://play.3speak.tv/embed?v=a/SEQFALL01'));
        options.onSuccess();
      }
    };
    await expect(uploadVideoEmbed(media(11 * MB), 'a', 'token', false, () => {})).resolves.toEqual({
      embedUrl: 'https://play.3speak.tv/embed?v=a/SEQFALL01',
      permlink: 'SEQFALL01',
    });
  });

  it('resolves a parallel upload to the final-concat embed URL', async () => {
    mockTus.runUpload = (options: any) => {
      options.onAfterResponse(
        mockReq('partial'),
        mockRes('https://play.3speak.tv/embed?v=a/PART01'),
      );
      options.onAfterResponse(
        mockReq('final;https://embed.test/a https://embed.test/b'),
        mockRes('https://play.3speak.tv/embed?v=a/FINAL567'),
      );
      options.onSuccess();
    };
    await expect(uploadVideoEmbed(media(11 * MB), 'a', 'token', false, () => {})).resolves.toEqual({
      embedUrl: 'https://play.3speak.tv/embed?v=a/FINAL567',
      permlink: 'FINAL567',
    });
  });

  it('uses the last-seen embed URL for a sequential upload (no concat step)', async () => {
    mockTus.runUpload = (options: any) => {
      options.onAfterResponse(mockReq(), mockRes('https://play.3speak.tv/embed?v=a/SEQ12345'));
      options.onSuccess();
    };
    await expect(uploadVideoEmbed(media(1024), 'a', 'token', false, () => {})).resolves.toEqual({
      embedUrl: 'https://play.3speak.tv/embed?v=a/SEQ12345',
      permlink: 'SEQ12345',
    });
  });

  it('propagates the error when both the parallel and sequential attempts fail', async () => {
    mockTus.runUpload = (options: any) => {
      options.onError(new Error('network down'));
    };
    await expect(uploadVideoEmbed(media(11 * MB), 'a', 'token', false, () => {})).rejects.toThrow(
      /network down/,
    );
  });
});
