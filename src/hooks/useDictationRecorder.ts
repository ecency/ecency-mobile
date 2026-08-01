import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';

export type DictationRecorderState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'stopped'
  | 'denied'
  // A native call rejected. Distinct from 'denied' because the user did not refuse
  // anything -- the audio session or the recorder itself failed, and retrying is
  // reasonable.
  | 'failed';

interface Options {
  /** Server cap. Recording stops itself before this rather than being rejected after upload. */
  maxSeconds: number;
}

/**
 * Microphone recording for dictation, on top of expo-audio.
 *
 * HIGH_QUALITY records AAC in an .m4a container on both platforms, which the
 * transcription backend accepts directly.
 *
 * Duration is timed from the wall clock rather than read from the recorder, which
 * is deliberate on two counts.
 *
 * It avoids `useAudioRecorderState`, whose implementation polls the recorder's
 * SYNCHRONOUS native getStatus() on a setInterval. Sheets in this app stay mounted
 * (see CLAUDE.md), so that poll never stops -- it keeps calling into a native audio
 * object for the rest of the session, and once that object is no longer valid the
 * sync getter faults and takes the whole process down with EXC_BAD_ACCESS. That
 * crashed an iOS TestFlight build immediately after a successful transcription.
 *
 * It also survives stopping: the recorder zeroes its own duration on stop, which is
 * why the timer used to snap back to 0:00 the moment the user finished speaking.
 */
export function useDictationRecorder({ maxSeconds }: Options) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [state, setState] = useState<DictationRecorderState>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const [result, setResult] = useState<{ uri: string; durationMs: number } | null>(null);

  const startedAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Bumped by every reset/unmount. start() captures the value it began with, so a
  // permission prompt answered after the sheet closed can tell it is stale.
  const generationRef = useRef(0);

  // Round UP: the server bills whole units off the real duration, so flooring would
  // quote one unit for a clip that crosses into two.
  const seconds = Math.ceil(durationMs / 1000);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const stop = useCallback(async () => {
    if (!recorder.isRecording) {
      return;
    }
    clearTick();
    // Wall clock, captured before the native call so a slow stop does not inflate
    // the quote. This is the figure the user sees and is charged on.
    const elapsed = Date.now() - startedAtRef.current;
    try {
      await recorder.stop();
    } catch {
      // Leaving state as 'recording' would strand the sheet: the stop button stays
      // up but no longer works, and there is no recording to submit either.
      setResult(null);
      setState('failed');
      return;
    }
    // Kept rather than zeroed, so the sheet can show what was actually recorded.
    setDurationMs(elapsed);
    setResult(recorder.uri ? { uri: recorder.uri, durationMs: elapsed } : null);
    setState('stopped');
  }, [recorder, clearTick]);

  const start = useCallback(async () => {
    setResult(null);
    setDurationMs(0);
    setState('requesting');

    const generation = generationRef.current;

    // Every step here is a native call that can reject -- a denied prompt is only
    // the expected failure. An audio-service interruption rejects setAudioModeAsync
    // or prepareToRecordAsync, and without this the hook sat in 'requesting'
    // forever with Record disabled and no way out but reopening the sheet.
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (generation !== generationRef.current) {
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

      startedAtRef.current = Date.now();
      recorder.record();
      setState('recording');

      clearTick();
      tickRef.current = setInterval(() => {
        setDurationMs(Date.now() - startedAtRef.current);
      }, 250);
    } catch {
      if (generation !== generationRef.current) {
        // A rejection from a superseded attempt must not clobber the recording that
        // replaced it, same as the denial path above.
        return;
      }
      setState('failed');
    }
  }, [recorder, clearTick]);

  const reset = useCallback(() => {
    generationRef.current += 1;
    clearTick();
    if (recorder.isRecording) {
      // Fire-and-forget, but caught: an unhandled rejection here would surface over
      // a teardown the user cannot act on anyway.
      recorder.stop().catch(() => undefined);
    }
    setResult(null);
    setDurationMs(0);
    setState('idle');
  }, [recorder, clearTick]);

  // Stop at the cap. Without this a forgotten recording is only rejected once the
  // user has already waited through the upload. A second early, because the real
  // duration drifts past while the recorder flushes.
  useEffect(() => {
    if (state === 'recording' && durationMs >= (maxSeconds - 1) * 1000) {
      stop().catch(() => undefined);
    }
  }, [state, durationMs, maxSeconds, stop]);

  // Sheets in this app stay mounted, so this rarely fires -- but a real unmount must
  // not leave the microphone open or the ticker running.
  useEffect(
    () => () => {
      generationRef.current += 1;
      if (tickRef.current) {
        clearInterval(tickRef.current);
      }
      if (recorder.isRecording) {
        recorder.stop().catch(() => undefined);
      }
      setAudioModeAsync({ allowsRecording: false }).catch(() => undefined);
    },
    [recorder],
  );

  return { state, seconds, durationMs, result, start, stop, reset };
}
