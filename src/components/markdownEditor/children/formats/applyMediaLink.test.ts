import applyMediaLink from './applyMediaLink';
import { MediaInsertStatus, Modes } from '../../../uploadsGalleryModal/types';

// Helper: run applyMediaLink and capture what it writes back (null when it
// decided nothing changed and skipped the write).
const run = async (text: string, selection: { start: number; end: number }, items: any[]) => {
  let result: { text: string; selection: { start: number; end: number } } | null = null;
  await applyMediaLink({
    text,
    selection,
    setTextAndSelection: (args) => {
      result = args;
    },
    items,
  });
  return result as { text: string; selection: { start: number; end: number } } | null;
};

describe('applyMediaLink', () => {
  describe('UPLOADING', () => {
    it('inserts a placeholder at the selection and moves the caret after it', async () => {
      const result = await run('hello world', { start: 5, end: 5 }, [
        { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.UPLOADING },
      ]);
      expect(result?.text).toBe('hello\n![](Uploading... img.jpg)\n world');
      expect(result?.selection).toEqual({ start: 32, end: 32 });
    });

    it('does nothing without a filename', async () => {
      const result = await run('hello', { start: 5, end: 5 }, [
        { filename: '', url: '', text: '', status: MediaInsertStatus.UPLOADING },
      ]);
      expect(result).toBeNull();
    });
  });

  describe('READY with a placeholder in the body', () => {
    const body = 'hello\n![](Uploading... img.jpg)\nworld';

    it('replaces the exact placeholder with the url', async () => {
      const result = await run(body, { start: 37, end: 37 }, [
        { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
      ]);
      expect(result?.text).toBe('hello\n![](https://x/y.png)\nworld');
      // caret was after the placeholder: shifted by the length difference
      expect(result?.selection).toEqual({ start: 32, end: 32 });
    });

    it('leaves a caret before the placeholder untouched', async () => {
      const result = await run(body, { start: 3, end: 3 }, [
        { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
      ]);
      expect(result?.text).toBe('hello\n![](https://x/y.png)\nworld');
      expect(result?.selection).toEqual({ start: 3, end: 3 });
    });

    it('repairs a lone placeholder whose filename got mangled', async () => {
      const result = await run('a\n![](Uploading... imgXX)\nb', { start: 27, end: 27 }, [
        { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
      ]);
      expect(result?.text).toBe('a\n![](https://x/y.png)\nb');
    });

    it('repairs a lone placeholder that gained alt text', async () => {
      const result = await run('a\n![zz](Uploading... img.jpg2)\nb', { start: 0, end: 0 }, [
        { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
      ]);
      expect(result?.text).toBe('a\n![zz](https://x/y.png)\nb');
    });
  });

  describe('READY with no recoverable placeholder', () => {
    it('drops the insert instead of writing at the caret when it was removed', async () => {
      // the wrong-position bug: the url used to be inserted mid-sentence at the
      // live caret; now the insert is dropped (the upload is in the gallery)
      const result = await run('hello world', { start: 5, end: 5 }, [
        { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
      ]);
      expect(result).toBeNull();
    });

    it('drops the insert when several mangled placeholders make the target ambiguous', async () => {
      const body = '![](Uploading... aXX)\n![](Uploading... bXX)';
      const result = await run(body, { start: 0, end: 0 }, [
        { filename: 'a.jpg', url: 'https://x/a.png', text: '', status: MediaInsertStatus.READY },
      ]);
      expect(result).toBeNull();
    });
  });

  describe('READY without a placeholder (deliberate insert)', () => {
    it('inserts an image at the caret when the item has no filename (gallery tap)', async () => {
      const result = await run('hello world', { start: 5, end: 5 }, [
        { filename: '', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
      ]);
      expect(result?.text).toBe('hello\n![](https://x/y.png)\n world');
    });

    it('inserts a raw url for a video embed', async () => {
      const result = await run('hello', { start: 5, end: 5 }, [
        {
          filename: '',
          url: 'https://3speak.tv/watch?v=a/b',
          text: '',
          status: MediaInsertStatus.READY,
          mode: Modes.MODE_VIDEO,
        },
      ]);
      expect(result?.text).toBe('hello\nhttps://3speak.tv/watch?v=a/b\n');
    });
  });

  describe('FAILED', () => {
    it('removes the exact placeholder and shifts a caret after it', async () => {
      const result = await run('hello\n![](Uploading... img.jpg)\nworld', { start: 37, end: 37 }, [
        { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.FAILED },
      ]);
      expect(result?.text).toBe('hello\n\nworld');
      expect(result?.selection).toEqual({ start: 12, end: 12 });
    });

    it('removes a lone mangled placeholder', async () => {
      const result = await run('a\n![](Uploading... imgXX)\nb', { start: 0, end: 0 }, [
        { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.FAILED },
      ]);
      expect(result?.text).toBe('a\n\nb');
    });

    it('does nothing when no placeholder remains', async () => {
      const result = await run('hello world', { start: 5, end: 5 }, [
        { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.FAILED },
      ]);
      expect(result).toBeNull();
    });
  });

  it('applies a batched UPLOADING + READY pair in one pass (deferred flush)', async () => {
    const result = await run('hello world', { start: 5, end: 5 }, [
      { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.UPLOADING },
      { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
    ]);
    expect(result?.text).toBe('hello\n![](https://x/y.png)\n world');
  });
});
