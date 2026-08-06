import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

// Mirrors expo-audio for real: useAudioRecorder delegates to useReleasingSharedObject,
// which registers its release() cleanup FIRST, so it runs before any cleanup declared
// later in useDictationRecorder. After release the JS object is detached from its
// native counterpart and every native member access throws.
const mockState = { released: false };
const mockSetAudioModeAsync = jest.fn(async () => undefined);

function mockThrowIfReleased(member: string) {
  if (mockState.released) {
    throw new Error(
      `Unable to find the native shared object associated with given JavaScript object (${member})`,
    );
  }
}

jest.mock('expo-audio', () => ({
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })),
  setAudioModeAsync: (...args: any[]) => (mockSetAudioModeAsync as any)(...args),
  useAudioRecorder: () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useEffect } = require('react');
    useEffect(
      () => () => {
        mockState.released = true;
      },
      [],
    );
    return {
      get isRecording() {
        mockThrowIfReleased('isRecording');
        return false;
      },
      get uri() {
        mockThrowIfReleased('uri');
        return null;
      },
      record: jest.fn(() => mockThrowIfReleased('record')),
      stop: jest.fn(async () => mockThrowIfReleased('stop')),
      prepareToRecordAsync: jest.fn(async () => mockThrowIfReleased('prepareToRecordAsync')),
    };
  },
}));

// eslint-disable-next-line import/first
import { useDictationRecorder } from './useDictationRecorder';

function Probe() {
  useDictationRecorder({ maxSeconds: 300 });
  return null;
}

describe('useDictationRecorder unmount', () => {
  beforeEach(() => {
    mockState.released = false;
    mockSetAudioModeAsync.mockClear();
  });

  // Registered sheets unmount on hide, so this is what happens every time the user
  // closes the dictation sheet. Touching the recorder here used to throw an uncaught
  // fatal, because expo-audio had already released it.
  it('does not touch the recorder after expo-audio released it', () => {
    let renderer: any;
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });

    expect(() => act(() => renderer.unmount())).not.toThrow();
  });

  it('still deactivates the recording session on unmount', () => {
    let renderer: any;
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
    act(() => renderer.unmount());

    expect(mockSetAudioModeAsync).toHaveBeenCalledWith({ allowsRecording: false });
  });
});
