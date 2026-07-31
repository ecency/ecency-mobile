import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { useQuery } from '@tanstack/react-query';
import { getAiTranscribePriceQueryOptions, useAiTranscribe } from '@ecency/sdk';
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
 * Dictation: record, see the cost while recording, insert the transcript.
 *
 * Billing is metered per 30s block, so the cost shown has to match the server's
 * arithmetic exactly -- rounding up to whole units, minimum one unit, and a free
 * allowance that discounts units rather than whole clips. All of those numbers come
 * from the price endpoint so a pricing change does not need an app release.
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

  // One key per recording, reused across retries. A retry after a lost response must
  // replay the finished transcription rather than pay for a second one.
  const idempotencyKeyRef = useRef<string | null>(null);
  const closedRef = useRef(false);

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

  // A new recording is a different operation and gets a fresh key.
  useEffect(() => {
    if (state === 'recording') {
      idempotencyKeyRef.current = null;
    }
  }, [state]);

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
        // A silent clip still costs Points, so say so rather than closing as if it worked.
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage({ id: 'dictation.error_empty' }),
        );
        return;
      }

      payload?.onInsert?.(response.text);
      close();
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
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), intl.formatMessage({ id }));
      // The key is kept deliberately so a retry replays instead of re-charging.
    }
  }, [result, isTranscribing, transcribe, payload, close, intl]);

  return (
    <ActionSheet
      id={SheetNames.DICTATION}
      gestureEnabled={!isTranscribing}
      closeOnPressBack={!isTranscribing}
      closeOnTouchBackdrop={!isTranscribing}
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

        <Text style={styles.cost}>
          {!isPriceReady
            ? intl.formatMessage({ id: 'dictation.price_loading' })
            : estimatedCost > 0
            ? intl.formatMessage({ id: 'dictation.cost' }, { n: estimatedCost })
            : intl.formatMessage({ id: 'dictation.free' })}
        </Text>

        {isPriceReady && (
          <Text style={styles.hint}>
            {intl.formatMessage({ id: 'dictation.max' }, { n: Math.floor(maxSeconds / 60) })}
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
          ) : (
            <MainButton
              style={styles.button}
              isDisabled={state === 'requesting' || isTranscribing || !isPriceReady}
              onPress={start}
              iconName="mic"
              iconType="MaterialIcons"
              text={intl.formatMessage({
                id: result ? 'dictation.rerecord' : 'dictation.start',
              })}
            />
          )}

          <MainButton
            style={styles.button}
            isDisabled={!result || isTranscribing || !isPriceReady}
            isLoading={isTranscribing}
            onPress={submit}
            text={intl.formatMessage({ id: 'dictation.insert' })}
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
