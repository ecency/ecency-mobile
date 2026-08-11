import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { captureException } from '../utils/sentryUtils';

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
 * SYNCHRONOUS native getStatus() on a setInterval. That poll outlives the recorder
 * it reads, and once the native object is gone the sync getter faults and takes the
 * whole process down with EXC_BAD_ACCESS. That crashed an iOS TestFlight build
 * immediately after a successful transcription.
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
  // Whether the native recorder is running, tracked here rather than read back from
  // `recorder.isRecording`.
  //
  // Every property on an expo shared object is a JSI accessor that calls into native
  // synchronously, and once expo-audio has released the object that call throws a
  // jsi::JSError at the access site -- NativeSharedObjectNotFoundException on iOS,
  // UsingReleasedSharedObjectException on Android. It is a synchronous throw, so a
  // `.catch()` cannot intercept it, and registered sheets unmount on hide and render
  // outside the app's ErrorBoundary, so any such read on a path that can straddle the
  // close is fatal. A plain ref cannot fault, and it stays correct across the release
  // because nothing native has to be consulted to know what we ourselves started.
  const isRecordingRef = useRef(false);

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
    if (!isRecordingRef.current) {
      return;
    }
    isRecordingRef.current = false;
    clearTick();
    // Wall clock, captured before the native call so a slow stop does not inflate
    // the quote. This is the figure the user sees and is charged on.
    const elapsed = Date.now() - startedAtRef.current;
    const generation = generationRef.current;
    // Read BEFORE awaiting the stop. `uri` is the output path the recorder was
    // prepared with rather than something the stop produces, so it is already correct
    // here, and reading it afterwards would leave a native getter on the far side of
    // an await that closing the sheet can outlive.
    const { uri } = recorder;
    try {
      await recorder.stop();
      if (generation !== generationRef.current) {
        // The sheet was closed while the recorder was flushing, so there is nothing
        // left to submit and nothing mounted to submit it to.
        return;
      }
    } catch (error) {
      if (generation !== generationRef.current) {
        return;
      }
      captureException(error, (scope) => scope.setTag('context', 'dictation-recorder-stop'));
      // The stop was refused, so the microphone may well still be open. Say so again,
      // and reset() on the way out will make one more attempt rather than leaving it
      // running for as long as the sheet stays up.
      isRecordingRef.current = true;
      // Leaving state as 'recording' would strand the sheet: the stop button stays
      // up but no longer works, and there is no recording to submit either.
      setResult(null);
      setState('failed');
      return;
    }
    // Kept rather than zeroed, so the sheet can show what was actually recorded.
    setDurationMs(elapsed);
    setResult(uri ? { uri, durationMs: elapsed } : null);
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
      // Only after record() returns: it is a synchronous native call, and if it
      // throws there is nothing running to stop.
      isRecordingRef.current = true;
      setState('recording');

      clearTick();
      tickRef.current = setInterval(() => {
        setDurationMs(Date.now() - startedAtRef.current);
      }, 250);
    } catch (error) {
      if (generation !== generationRef.current) {
        // A rejection from a superseded attempt must not clobber the recording that
        // replaced it, same as the denial path above.
        return;
      }
      captureException(error, (scope) => scope.setTag('context', 'dictation-recorder-start'));
      setState('failed');
    }
  }, [recorder, clearTick]);

  const reset = useCallback(() => {
    generationRef.current += 1;
    clearTick();
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      // Fire-and-forget, but caught: stop() is an AsyncFunction, so unlike the
      // property getters it reports a released object as a rejection rather than a
      // synchronous throw, and an unhandled rejection would surface as a redbox over
      // a teardown the user cannot act on anyway.
      recorder.stop().catch((error) => {
        captureException(error, (scope) => scope.setTag('context', 'dictation-recorder-reset'));
      });
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
      stop().catch((error) => {
        captureException(error, (scope) => scope.setTag('context', 'dictation-recorder-cap'));
      });
    }
  }, [state, durationMs, maxSeconds, stop]);

  // Registered sheets UNMOUNT on hide, so this runs every time the sheet is closed.
  //
  // It must not touch `recorder`. expo-audio's useAudioRecorder is the first hook
  // here, so its useReleasingSharedObject cleanup runs BEFORE this one and has
  // already called release(), detaching the JS object from its native counterpart.
  // Reading even `recorder.isRecording` at this point throws
  // NativeSharedObjectNotFoundException on iOS / InvalidSharedObjectIdException on
  // Android, and sheets render outside the app's ErrorBoundary, so the throw reaches
  // React Native's global handler as a fatal and kills the app.
  //
  // Nothing is leaked by staying away from it: release() already stops a running
  // recorder (iOS sharedObjectWillRelease, Android sharedObjectDidRelease -> reset).
  // setAudioModeAsync is a module function rather than a method on the released
  // object, so deactivating the recording session here is still safe.
  useEffect(
    () => () => {
      generationRef.current += 1;
      isRecordingRef.current = false;
      if (tickRef.current) {
        clearInterval(tickRef.current);
      }
      setAudioModeAsync({ allowsRecording: false }).catch((error) => {
        captureException(error, (scope) => scope.setTag('context', 'dictation-audio-mode-release'));
      });
    },
    [],
  );

  return { state, seconds, durationMs, result, start, stop, reset };
}
