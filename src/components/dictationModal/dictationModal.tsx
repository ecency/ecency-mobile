import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { useQuery } from '@tanstack/react-query';
import { getAiTranscribePriceQueryOptions, useAiTranscribe } from '@ecency/sdk';
import { captureException } from '../../utils/sentryUtils';
import { useAuth } from '../../hooks';
import { useDictationRecorder } from '../../hooks/useDictationRecorder';
import { SheetNames } from '../../navigation/sheets';
import { MainButton } from '..';
import styles from './dictationModal.styles';

const DEFAULT_MAX_SECONDS = 300;

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Dictation: record, stop, and the transcript goes straight into the editor.
 *
 * Transcription fires on stop rather than behind an Insert button, and the sheet
 * stays open afterwards, so dictating several paragraphs is record-stop-record-stop
 * rather than a four-tap cycle per paragraph.
 *
 * That makes stopping the moment Points are spent, with no separate confirmation, so
 * the running cost is shown throughout recording and the button says as much.
 *
 * Billing is metered per 30s block and the numbers all come from the price endpoint,
 * so the quote matches the server's arithmetic and a pricing change needs no app
 * release: round up to whole units, minimum one unit, free allowance discounting
 * units rather than whole clips.
 */
export const DictationModal = ({ payload }: SheetProps<SheetNames.DICTATION>) => {
  const intl = useIntl();
  const { username, code } = useAuth();

  const {
    data: price,
    isLoading: isPriceLoading,
    isError: isPriceError,
    refetch: refetchPrice,
  } = useQuery(getAiTranscribePriceQueryOptions(username, code ?? ''));

  const { mutateAsync: transcribe, isPending: isTranscribing } = useAiTranscribe(username, code);

  const maxSeconds = price?.max_seconds ?? DEFAULT_MAX_SECONDS;
  const { state, seconds, result, start, stop, reset } = useDictationRecorder({ maxSeconds });

  // One key per recording, reused across retries so a request that landed but lost
  // its response replays instead of transcribing and charging a second time.
  const idempotencyKeyRef = useRef<string | null>(null);
  const closedRef = useRef(false);
  // Guards the auto-submit effect against firing twice for the same recording.
  const submittedForRef = useRef<string | null>(null);

  // Segments inserted this session. Tells the user their words landed even though
  // the sheet never closed, and switches the button to "Record more".
  const [segments, setSegments] = useState(0);
  // Transcription failed. The audio is kept so retrying reuses it rather than making
  // the user say it all again.
  const [needsRetry, setNeedsRetry] = useState(false);

  const isPriceReady = !!price && !isPriceLoading && !isPriceError;

  const estimatedCost = useMemo(() => {
    if (!isPriceReady) {
      return 0;
    }
    const units = Math.max(1, Math.ceil(seconds / price!.unit_seconds));
    const billable = Math.max(0, units - (price!.free_remaining ?? 0));
    return billable * price!.unit_cost;
  }, [isPriceReady, seconds, price]);

  const close = useCallback(() => {
    closedRef.current = true;
    reset();
    idempotencyKeyRef.current = null;
    SheetManager.hide(SheetNames.DICTATION);
  }, [reset]);

  // Reset per open: stale segment counts, or a failed recording offered for retry
  // against a different draft, must never survive into the next presentation.
  // The sheet unmounts on hide, so this runs on mount for every presentation.
  useEffect(() => {
    closedRef.current = false;
    reset();
    idempotencyKeyRef.current = null;
    submittedForRef.current = null;
    setSegments(0);
    setNeedsRetry(false);
  }, [payload, reset]);

  useEffect(
    () => () => {
      closedRef.current = true;
    },
    [],
  );

  const submit = useCallback(async () => {
    if (!result || isTranscribing) {
      return;
    }

    if (!idempotencyKeyRef.current) {
      // Matches the backend validator [A-Za-z0-9_-]{8,64}.
      idempotencyKeyRef.current = `m${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
    }

    setNeedsRetry(false);

    try {
      const response = await transcribe({
        audio: { uri: result.uri, name: 'dictation.m4a', type: 'audio/m4a' } as any,
        durationMs: result.durationMs,
        fileName: 'dictation.m4a',
        idempotency_key: idempotencyKeyRef.current,
      });

      if (closedRef.current) {
        return;
      }

      if (!response.text.trim()) {
        // A silent clip still costs Points, so say so rather than quietly resetting
        // as though it had worked.
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage({ id: 'dictation.error_empty' }),
        );
        idempotencyKeyRef.current = null;
        reset();
        return;
      }

      payload?.onInsert?.(response.text);
      // Stay open with a clean recorder: the whole point of transcribing on stop is
      // that someone can keep dictating without reopening the sheet each time.
      setSegments((n) => n + 1);
      idempotencyKeyRef.current = null;
      reset();
    } catch (err: any) {
      if (closedRef.current) {
        return;
      }
      const status = err?.status;
      const id =
        status === 402
          ? 'dictation.error_insufficient_points'
          : status === 429
          ? 'dictation.error_rate_limited'
          : status === 400
          ? 'dictation.error_too_long'
          : 'dictation.error_failed';
      if (id === 'dictation.error_failed') {
        // The three status codes above are conditions the user can act on and the
        // message already says so. Anything else is a defect, and the Points were
        // charged or not on the server's terms, so it needs to be diagnosable.
        captureException(err, (scope) => {
          scope.setTag('context', 'dictation-transcribe');
          scope.setTag('dictation_status', String(status ?? 'none'));
        });
      }
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), intl.formatMessage({ id }));
      // Recording and key are both kept: retry reuses the audio, and the same key
      // means a request that actually landed replays rather than charging twice.
      setNeedsRetry(true);
    }
  }, [result, isTranscribing, transcribe, payload, reset, intl]);

  // Transcribe as soon as recording stops. Keyed on the recording's uri so a retry
  // or a re-render cannot fire a second paid request for the same audio.
  useEffect(() => {
    if (state === 'stopped' && result && submittedForRef.current !== result.uri) {
      submittedForRef.current = result.uri;
      submit();
    }
  }, [state, result, submit]);

  const busy = isTranscribing || state === 'requesting';

  return (
    <ActionSheet
      id={SheetNames.DICTATION}
      gestureEnabled={!busy}
      closeOnPressBack={!busy}
      closeOnTouchBackdrop={!busy}
      onClose={() => {
        closedRef.current = true;
        reset();
      }}
      containerStyle={styles.sheetContent}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'dictation.title' })}</Text>

        {state === 'denied' && (
          <Text style={styles.error}>{intl.formatMessage({ id: 'dictation.denied' })}</Text>
        )}

        {state === 'failed' && (
          // Distinct from 'denied': nothing was refused, the audio session or recorder
          // itself failed, so retrying is worth offering rather than sending the user
          // to Settings.
          <Text style={styles.error}>{intl.formatMessage({ id: 'dictation.error_recorder' })}</Text>
        )}

        {isPriceError && (
          <View>
            <Text style={styles.error}>{intl.formatMessage({ id: 'dictation.price_error' })}</Text>
            <MainButton
              style={styles.retryButton}
              onPress={() => refetchPrice()}
              text={intl.formatMessage({ id: 'alert.try_again' })}
            />
          </View>
        )}

        <Text style={styles.clock}>{formatClock(seconds)}</Text>

        {state === 'recording' && (
          <View style={styles.recordingRow}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingLabel}>
              {intl.formatMessage({ id: 'dictation.recording' })}
            </Text>
          </View>
        )}

        {/* Before recording this must show the RATE, not the cost of a hypothetical
            minimum clip. Showing "15 Points" next to "up to 5 minutes" reads as
            15 Points for five minutes, when it is 15 Points per 30s block. Once
            recording, the running total is the honest number. */}
        <Text style={styles.cost}>
          {!isPriceReady
            ? intl.formatMessage({ id: 'dictation.price_loading' })
            : state === 'recording'
            ? estimatedCost > 0
              ? intl.formatMessage({ id: 'dictation.cost_running' }, { n: estimatedCost })
              : intl.formatMessage({ id: 'dictation.cost_running_free' })
            : intl.formatMessage(
                { id: 'dictation.rate' },
                { n: price!.unit_cost, s: price!.unit_seconds },
              )}
        </Text>

        {isPriceReady && state !== 'recording' && (price!.free_remaining ?? 0) > 0 && (
          <Text style={styles.hint}>
            {intl.formatMessage(
              { id: 'dictation.free_remaining' },
              { n: price!.free_remaining, s: price!.unit_seconds },
            )}
          </Text>
        )}

        {isPriceReady && !isTranscribing && (
          <Text style={styles.hint}>
            {intl.formatMessage(
              { id: segments > 0 ? 'dictation.inserted' : 'dictation.stop_hint' },
              { m: Math.floor(maxSeconds / 60) },
            )}
          </Text>
        )}

        <View style={styles.actions}>
          {state === 'recording' ? (
            <MainButton
              style={styles.button}
              onPress={stop}
              iconName="stop"
              iconType="MaterialIcons"
              text={intl.formatMessage({ id: 'dictation.stop' })}
            />
          ) : needsRetry ? (
            <MainButton
              style={styles.button}
              isDisable={busy}
              onPress={submit}
              iconName="refresh"
              iconType="MaterialIcons"
              text={intl.formatMessage({ id: 'alert.try_again' })}
            />
          ) : (
            <MainButton
              style={styles.button}
              isDisable={busy || !isPriceReady}
              onPress={start}
              iconName="mic"
              iconType="MaterialIcons"
              text={intl.formatMessage({
                id: segments > 0 ? 'dictation.record_more' : 'dictation.start',
              })}
            />
          )}

          <MainButton
            style={styles.button}
            isDisable={busy}
            onPress={close}
            text={intl.formatMessage({ id: 'dictation.done' })}
          />
        </View>

        {isTranscribing && (
          <View style={styles.transcribingRow}>
            <ActivityIndicator />
            <Text style={styles.hint}>{intl.formatMessage({ id: 'dictation.transcribing' })}</Text>
          </View>
        )}
      </View>
    </ActionSheet>
  );
};
