import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export type DictationRecorderState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'denied';

interface Options {
  /** Server cap. Recording stops itself before this rather than being rejected after upload. */
  maxSeconds: number;
}

/**
 * Microphone recording for dictation, on top of expo-audio.
 *
 * HIGH_QUALITY records AAC in an .m4a container on both platforms, which the
 * transcription backend accepts directly -- no transcode, and no dependence on
 * whatever container a given OS version happens to prefer.
 */
export function useDictationRecorder({ maxSeconds }: Options) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // 250ms so the timer and the running cost read as live without spinning.
  const recorderState = useAudioRecorderState(recorder, 250);

  const [state, setState] = useState<DictationRecorderState>('idle');
  const [result, setResult] = useState<{ uri: string; durationMs: number } | null>(null);

  // Bumped by every reset/unmount. start() captures the value it began with, so a
  // permission prompt answered after the sheet closed can tell it is stale instead
  // of opening a microphone with no UI left to stop it.
  const generationRef = useRef(0);

  const durationMs = recorderState.durationMillis ?? 0;
  // Round UP: the server bills whole units off the real duration, so flooring would
  // quote one unit for a clip that crosses into two.
  const seconds = Math.ceil(durationMs / 1000);

  const stop = useCallback(async () => {
    if (!recorder.isRecording) {
      return;
    }
    const elapsed = recorderState.durationMillis ?? 0;
    await recorder.stop();
    setResult(recorder.uri ? { uri: recorder.uri, durationMs: elapsed } : null);
    setState('stopped');
  }, [recorder, recorderState.durationMillis]);

  const start = useCallback(async () => {
    setResult(null);
    setState('requesting');

    const generation = generationRef.current;

    const permission = await requestRecordingPermissionsAsync();
    if (generation !== generationRef.current) {
      // Superseded while the OS prompt was open.
      return;
    }
    if (!permission.granted) {
      setState('denied');
      return;
    }

    // iOS records nothing unless the session allows it, and stays muted by the
    // hardware silent switch without playsInSilentMode.
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    if (generation !== generationRef.current) {
      return;
    }

    await recorder.prepareToRecordAsync();
    if (generation !== generationRef.current) {
      return;
    }

    recorder.record();
    setState('recording');
  }, [recorder]);

  const reset = useCallback(() => {
    generationRef.current += 1;
    if (recorder.isRecording) {
      recorder.stop();
    }
    setResult(null);
    setState('idle');
  }, [recorder]);

  // Stop itself at the cap. Without this a forgotten recording is only rejected
  // once the user has already waited through the upload.
  useEffect(() => {
    if (state === 'recording' && durationMs >= (maxSeconds - 1) * 1000) {
      stop();
    }
  }, [state, durationMs, maxSeconds, stop]);

  // Leaving the screen mid-recording would otherwise keep the microphone open with
  // no UI left able to close it.
  useEffect(
    () => () => {
      generationRef.current += 1;
      if (recorder.isRecording) {
        recorder.stop();
      }
      setAudioModeAsync({ allowsRecording: false }).catch(() => {
        // Restoring the audio mode is best-effort; failing it must not crash unmount.
      });
    },
    [recorder],
  );

  return { state, seconds, durationMs, result, start, stop, reset };
}
