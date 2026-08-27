import applyMediaLink from './applyMediaLink';
import { MediaInsertStatus, Modes } from '../../../uploadsGalleryModal/types';

// Helper: run applyMediaLink and capture what it writes back (null when it
// decided nothing changed and skipped the write).
const run = async (
  text: string,
  selection: { start: number; end: number },
  items: any[],
  otherPending?: string[],
) => {
  let result: { text: string; selection: { start: number; end: number } } | null = null;
  await applyMediaLink({
    text,
    selection,
    setTextAndSelection: (args) => {
      result = args;
    },
    items,
    otherPending,
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

    it('shifts a caret sitting exactly at the end of the replaced placeholder', async () => {
      // index 31 is the character right after the placeholder's closing paren; the
      // text from there on moves, so the caret must move with it
      const result = await run(body, { start: 31, end: 31 }, [
        { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
      ]);
      expect(result?.selection).toEqual({ start: 26, end: 26 });
    });

    it('replaces a placeholder whose filename contains parentheses', async () => {
      const result = await run('a\n![](Uploading... IMG_2024 (1).jpg)\nb', { start: 0, end: 0 }, [
        {
          filename: 'IMG_2024 (1).jpg',
          url: 'https://x/y.png',
          text: '',
          status: MediaInsertStatus.READY,
        },
      ]);
      expect(result?.text).toBe('a\n![](https://x/y.png)\nb');
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

    it('never repairs a lone placeholder while another upload is still in flight', async () => {
      // b.jpg's placeholder is intact and belongs to it; a.jpg's was deleted by the
      // user. Repairing here would put a.jpg's url in b.jpg's slot and then lose b.
      const result = await run(
        'a\n![](Uploading... b.jpg)\nb',
        { start: 0, end: 0 },
        [{ filename: 'a.jpg', url: 'https://x/a.png', text: '', status: MediaInsertStatus.READY }],
        ['b.jpg'],
      );
      expect(result).toBeNull();
    });

    it('never repairs a lone placeholder when the same batch carries another upload', async () => {
      const result = await run('a\n![](Uploading... b.jpg)\nb', { start: 27, end: 27 }, [
        { filename: 'a.jpg', url: 'https://x/a.png', text: '', status: MediaInsertStatus.READY },
        { filename: 'b.jpg', url: '', text: '', status: MediaInsertStatus.UPLOADING },
      ]);
      // a's ambiguous repair is refused: b's slot must never receive a's url
      expect(result?.text).not.toContain('https://x/a.png');
      expect(result?.text).toContain('![](Uploading... b.jpg)');
    });

    it('does not remove another upload’s placeholder when a failed upload lost its own', async () => {
      const result = await run(
        'a\n![](Uploading... b.jpg)\nb',
        { start: 0, end: 0 },
        [{ filename: 'a.jpg', url: '', text: '', status: MediaInsertStatus.FAILED }],
        ['b.jpg'],
      );
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
    it('removes the exact placeholder and its line break, shifting a caret after it', async () => {
      const result = await run('hello\n![](Uploading... img.jpg)\nworld', { start: 37, end: 37 }, [
        { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.FAILED },
      ]);
      // no blank line left where the image was
      expect(result?.text).toBe('hello\nworld');
      expect(result?.selection).toEqual({ start: 11, end: 11 });
    });

    it('lands a caret that sat inside the failed placeholder at its start', async () => {
      const result = await run('hello\n![](Uploading... img.jpg)\nworld', { start: 15, end: 15 }, [
        { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.FAILED },
      ]);
      expect(result?.selection).toEqual({ start: 6, end: 6 });
    });

    it('removes a lone mangled placeholder', async () => {
      const result = await run('a\n![](Uploading... imgXX)\nb', { start: 0, end: 0 }, [
        { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.FAILED },
      ]);
      expect(result?.text).toBe('a\nb');
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

describe('range selections', () => {
  // 'hello\n![](Uploading... img.jpg)\nworld' — the placeholder spans [6, 31)
  const body = 'hello\n![](Uploading... img.jpg)\nworld';

  const selectedText = (r: { text: string; selection: { start: number; end: number } }) =>
    r.text.slice(r.selection.start, r.selection.end);

  it('keeps a range that spans the placeholder covering the same surviving text', async () => {
    // start before the placeholder, end inside 'world'. The replacement is 5 chars
    // shorter, so the end must come back by 5 — leaving it put would grow the
    // selection over the trailing 'ld', which the next keystroke would replace.
    const result = await run(body, { start: 2, end: 35 }, [
      { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
    ]);
    expect(result?.selection).toEqual({ start: 2, end: 30 });
    expect(selectedText(result!)).toBe('llo\n![](https://x/y.png)\nwor');
    expect(body.slice(2, 35).endsWith('wor')).toBe(true);
  });

  it('keeps a spanning range correct when a failed upload removes the placeholder', async () => {
    const result = await run(body, { start: 2, end: 35 }, [
      { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.FAILED },
    ]);
    expect(selectedText(result!)).toBe('llo\nwor');
  });

  it('collapses a range that sat entirely inside the placeholder', async () => {
    const result = await run(body, { start: 12, end: 20 }, [
      { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
    ]);
    expect(result?.selection.start).toBe(result?.selection.end);
  });

  it('maps a range that starts inside the placeholder and ends after it', async () => {
    const result = await run(body, { start: 12, end: 35 }, [
      { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
    ]);
    // start collapses to where the replaced span began, end shifts with the text
    expect(result?.selection).toEqual({ start: 9, end: 30 });
    expect(result!.selection.start).toBeLessThanOrEqual(result!.selection.end);
  });
});

describe('selection safety', () => {
  it('clamps a range selection that straddled the replaced placeholder', async () => {
    // start before the placeholder, end after it: neither endpoint is shifted, so
    // the end would otherwise point past the shortened body (Android throws on that)
    const body = 'hello\n![](Uploading... img.jpg)\nworld';
    const result = await run(body, { start: 2, end: 37 }, [
      { filename: 'img.jpg', url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
    ]);
    expect(result).not.toBeNull();
    const { start, end } = result!.selection;
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeLessThanOrEqual(result!.text.length);
    expect(start).toBeLessThanOrEqual(end);
  });

  it('never returns a selection past the end of a body shortened by a failed upload', async () => {
    const body = 'hello\n![](Uploading... img.jpg)\nworld';
    const result = await run(body, { start: 2, end: 37 }, [
      { filename: 'img.jpg', url: '', text: '', status: MediaInsertStatus.FAILED },
    ]);
    expect(result!.selection.end).toBeLessThanOrEqual(result!.text.length);
  });
});
