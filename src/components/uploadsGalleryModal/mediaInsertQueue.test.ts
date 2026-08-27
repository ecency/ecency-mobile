import {
  flushPendingEditorWork,
  prepareInsertDispatch,
  registerPendingFlush,
  shouldQueueInsert,
} from './mediaInsertQueue';
import { MediaInsertData, MediaInsertStatus } from './types';

const uploading = (filename: string): MediaInsertData => ({
  filename,
  url: '',
  text: '',
  status: MediaInsertStatus.UPLOADING,
});

const ready = (filename: string, url = 'https://x/y.png'): MediaInsertData => ({
  filename,
  url,
  text: '',
  status: MediaInsertStatus.READY,
});

const failed = (filename: string): MediaInsertData => ({
  filename,
  url: '',
  text: '',
  status: MediaInsertStatus.FAILED,
});

describe('shouldQueueInsert', () => {
  it('queues while the user is typing', () => {
    expect(shouldQueueInsert(true, 0)).toBe(true);
  });

  it('dispatches directly when idle with nothing queued', () => {
    expect(shouldQueueInsert(false, 0)).toBe(false);
  });

  it('queues behind an existing item even when typing has stopped', () => {
    // the ordering guard: a READY result must never overtake its own queued
    // UPLOADING placeholder, or the image is dropped and the placeholder sticks
    expect(shouldQueueInsert(false, 1)).toBe(true);
  });
});

describe('prepareInsertDispatch', () => {
  it('reports no rivals for a lone upload', () => {
    const inFlight = new Set<string>();
    expect(prepareInsertDispatch(inFlight, [uploading('a.jpg')])).toEqual({ otherPending: [] });
    expect([...inFlight]).toEqual(['a.jpg']);
  });

  it('excludes the batch’s own filenames from otherPending', () => {
    const inFlight = new Set(['a.jpg']);
    const context = prepareInsertDispatch(inFlight, [ready('a.jpg')]);
    expect(context.otherPending).toEqual([]);
  });

  it('reports another upload still in flight as a rival', () => {
    const inFlight = new Set(['b.jpg']);
    const context = prepareInsertDispatch(inFlight, [ready('a.jpg')]);
    expect(context.otherPending).toEqual(['b.jpg']);
  });

  it('clears an upload from the in-flight set once it resolves', () => {
    const inFlight = new Set<string>();
    prepareInsertDispatch(inFlight, [uploading('a.jpg'), uploading('b.jpg')]);
    expect([...inFlight].sort()).toEqual(['a.jpg', 'b.jpg']);

    prepareInsertDispatch(inFlight, [ready('a.jpg')]);
    expect([...inFlight]).toEqual(['b.jpg']);

    prepareInsertDispatch(inFlight, [failed('b.jpg')]);
    expect([...inFlight]).toEqual([]);
  });

  it('nets out an UPLOADING and its READY flushed in the same batch', () => {
    const inFlight = new Set<string>();
    const context = prepareInsertDispatch(inFlight, [uploading('a.jpg'), ready('a.jpg')]);
    expect(context.otherPending).toEqual([]);
    expect([...inFlight]).toEqual([]);
  });

  it('ignores items with no filename (gallery taps and video embeds)', () => {
    const inFlight = new Set(['a.jpg']);
    const context = prepareInsertDispatch(inFlight, [
      { url: 'https://x/y.png', text: '', status: MediaInsertStatus.READY },
    ]);
    expect(context.otherPending).toEqual(['a.jpg']);
    expect([...inFlight]).toEqual(['a.jpg']);
  });
});

describe('registerPendingFlush / flushPendingEditorWork', () => {
  it('runs registered flushes and stops after unregister', () => {
    const calls: string[] = [];
    const un = registerPendingFlush(() => calls.push('a'));
    flushPendingEditorWork();
    expect(calls).toEqual(['a']);

    un();
    flushPendingEditorWork();
    expect(calls).toEqual(['a']);
  });

  it('runs every registered flush, not just the first', () => {
    const calls: string[] = [];
    const unA = registerPendingFlush(() => calls.push('a'));
    const unB = registerPendingFlush(() => calls.push('b'));
    flushPendingEditorWork();
    expect(calls.sort()).toEqual(['a', 'b']);
    unA();
    unB();
  });

  it('keeps going when one flush throws, so teardown is never broken', () => {
    const calls: string[] = [];
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const unA = registerPendingFlush(() => {
      throw new Error('boom');
    });
    const unB = registerPendingFlush(() => calls.push('b'));
    expect(() => flushPendingEditorWork()).not.toThrow();
    expect(calls).toEqual(['b']);
    warn.mockRestore();
    unA();
    unB();
  });

  it('is a no-op with nothing registered', () => {
    expect(() => flushPendingEditorWork()).not.toThrow();
  });
});
