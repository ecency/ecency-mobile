import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

// Mirrors expo-audio for real: useAudioRecorder delegates to useReleasingSharedObject,
// which registers its release() cleanup FIRST, so it runs before any cleanup declared
// later in useDictationRecorder. After release the JS object is detached from its
// native counterpart and every native member access throws.
//
// The distinction the tests below lean on is real too: `isRecording` and `uri` are JSI
// accessors, so a post-release read throws SYNCHRONOUSLY at the access site and no
// `.catch()` can intercept it, while `stop()` is an AsyncFunction whose failure arrives
// as a rejection.
const mockState = {
  released: false,
  recording: false,
  // Reads of a native property that happened after release. Any of these is a fatal
  // in the app, so the hook must never make one.
  readsAfterRelease: [] as string[],
  // Set to a promise to hold stop() open, so a stop can be left in flight across the
  // sheet closing.
  holdStop: null as Promise<void> | null,
  stopCalls: 0,
  // Make the next stop() reject, as a refused native stop does.
  failStop: false,
  // Every native property the hook read, released or not. `isRecording` must never
  // appear: the hook knows whether it started the recorder, so consulting native for
  // it buys nothing and puts a throwing accessor on paths that straddle the close.
  propertyReads: [] as string[],
};

const mockSetAudioModeAsync = jest.fn(async () => undefined);
const mockCaptureException = jest.fn();

jest.mock('../utils/sentryUtils', () => ({
  captureException: (...args: any[]) => (mockCaptureException as any)(...args),
  captureMessage: jest.fn(),
}));

// The scope mutator is where the context tag lives, so run it against a stub to see
// which flow each report was filed under.
function capturedContexts() {
  return mockCaptureException.mock.calls.map(([, applyScope]: any[]) => {
    const tags: Record<string, string> = {};
    applyScope?.({
      setTag: (key: string, value: string) => {
        tags[key] = value;
      },
    });
    return tags.context;
  });
}

function mockThrowIfReleased(member: string) {
  if (mockState.released) {
    mockState.readsAfterRelease.push(member);
    throw new Error(
      `Unable to find the native shared object associated with given JavaScript object (${member})`,
    );
  }
}

jest.mock('expo-audio', () => {
  const makeRecorder = () => ({
    get isRecording() {
      mockState.propertyReads.push('isRecording');
      mockThrowIfReleased('isRecording');
      return mockState.recording;
    },
    get uri() {
      mockState.propertyReads.push('uri');
      mockThrowIfReleased('uri');
      return 'file:///dictation.m4a';
    },
    record: jest.fn(() => {
      mockThrowIfReleased('record');
      mockState.recording = true;
    }),
    // Async, so a released object rejects rather than throwing at the call site.
    stop: jest.fn(async () => {
      mockState.stopCalls += 1;
      mockThrowIfReleased('stop');
      if (mockState.failStop) {
        throw new Error('stop refused');
      }
      if (mockState.holdStop) {
        await mockState.holdStop;
      }
      mockState.recording = false;
    }),
    prepareToRecordAsync: jest.fn(async () => mockThrowIfReleased('prepareToRecordAsync')),
  });

  return {
    RecordingPresets: { HIGH_QUALITY: {} },
    requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })),
    setAudioModeAsync: (...args: any[]) => (mockSetAudioModeAsync as any)(...args),
    useAudioRecorder: () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useEffect, useRef } = require('react');
      // useReleasingSharedObject hands back the SAME object across renders.
      const ref = useRef(null);
      if (!ref.current) {
        ref.current = makeRecorder();
      }
      useEffect(
        () => () => {
          mockState.released = true;
        },
        [],
      );
      return ref.current;
    },
  };
});

// eslint-disable-next-line import/first
import { useDictationRecorder } from './useDictationRecorder';

type Api = ReturnType<typeof useDictationRecorder>;

let api: Api;

function Probe() {
  api = useDictationRecorder({ maxSeconds: 300 });
  return null;
}

function mount() {
  let renderer: any;
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });
  return renderer;
}

describe('useDictationRecorder unmount', () => {
  beforeEach(() => {
    mockState.released = false;
    mockState.recording = false;
    mockState.readsAfterRelease = [];
    mockState.holdStop = null;
    mockState.stopCalls = 0;
    mockState.failStop = false;
    mockState.propertyReads = [];
    mockSetAudioModeAsync.mockClear();
    mockCaptureException.mockClear();
  });

  // Registered sheets unmount on hide, so this is what happens every time the user
  // closes the dictation sheet. Touching the recorder here used to throw an uncaught
  // fatal, because expo-audio had already released it.
  it('does not touch the recorder after expo-audio released it', () => {
    const renderer = mount();

    expect(() => act(() => renderer.unmount())).not.toThrow();
    expect(mockState.readsAfterRelease).toEqual([]);
    // A clean close is not an incident.
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('still deactivates the recording session on unmount', () => {
    const renderer = mount();
    act(() => renderer.unmount());

    expect(mockSetAudioModeAsync).toHaveBeenCalledWith({ allowsRecording: false });
  });

  // Done is tappable while recording, so this is the close path with the recorder
  // still running underneath it.
  it('does not touch the recorder when the sheet closes mid-recording', async () => {
    const renderer = mount();
    await act(async () => {
      await api.start();
    });
    expect(mockState.recording).toBe(true);

    expect(() => act(() => renderer.unmount())).not.toThrow();
    expect(mockState.readsAfterRelease).toEqual([]);
    expect(mockState.propertyReads).not.toContain('isRecording');
  });

  // reset() runs from close() and from the sheet's onClose prop. It is a plain
  // synchronous function, so a native property read inside it would be fatal rather
  // than a rejection if the ordering ever put it after release.
  it('reset stops a running recorder without reading a native property', async () => {
    const renderer = mount();
    await act(async () => {
      await api.start();
    });

    act(() => api.reset());
    expect(mockState.recording).toBe(false);
    expect(mockState.stopCalls).toBe(1);

    // A second reset must not float another stop at an object it no longer owns.
    act(() => api.reset());
    expect(mockState.stopCalls).toBe(1);

    expect(() => act(() => renderer.unmount())).not.toThrow();
    expect(mockState.readsAfterRelease).toEqual([]);
    expect(mockState.propertyReads).not.toContain('isRecording');
  });

  // The sheet takes ~300ms to animate out before it unmounts, so a slow flush can
  // still be in flight when expo-audio releases the recorder underneath it.
  it('does not read the recorder from a stop that outlived the sheet', async () => {
    let releaseStop: () => void = () => undefined;
    mockState.holdStop = new Promise<void>((resolve) => {
      releaseStop = resolve;
    });

    const renderer = mount();
    await act(async () => {
      await api.start();
    });

    let pending: Promise<void>;
    act(() => {
      pending = api.stop();
    });

    act(() => renderer.unmount());

    await act(async () => {
      releaseStop();
      await pending;
    });

    expect(mockState.readsAfterRelease).toEqual([]);
  });

  // A refused stop leaves the microphone open, and the hook can no longer ask native
  // whether it is. It has to remember, so closing still makes one last attempt.
  it('retries the stop on close when the recorder refused to stop', async () => {
    const renderer = mount();
    await act(async () => {
      await api.start();
    });

    mockState.failStop = true;
    await act(async () => {
      await api.stop();
    });
    expect(api.state).toBe('failed');
    // Used to be swallowed by a bare catch, which is why none of this was ever
    // visible in Sentry.
    expect(capturedContexts()).toContain('dictation-recorder-stop');

    mockState.failStop = false;
    act(() => api.reset());
    expect(mockState.recording).toBe(false);

    expect(() => act(() => renderer.unmount())).not.toThrow();
    expect(mockState.propertyReads).not.toContain('isRecording');
  });
});
