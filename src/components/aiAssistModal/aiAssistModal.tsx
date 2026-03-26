import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { getPointsQueryOptions, getAiAssistPriceQueryOptions, useAiAssist } from '@ecency/sdk';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAuth } from '../../hooks';
import { SheetNames } from '../../navigation/sheets';
import styles from './aiAssistModal.styles';

const ACTIONS = [
  'improve',
  'suggest_tags',
  'generate_title',
  'summarize',
  'check_grammar',
] as const;
type AiAssistAction = (typeof ACTIONS)[number];

const MAX_INPUT = 10000;

const getMinInput = (action: AiAssistAction | null) => {
  if (!action) return 50;
  if (action === 'improve' || action === 'check_grammar') return 50;
  return 100;
};

export const AiAssistModal = ({ payload }: SheetProps<SheetNames.AI_ASSIST>) => {
  const intl = useIntl();
  const { username, code } = useAuth();

  const initialText = payload?.text?.slice(0, MAX_INPUT) || '';
  const availableActions = useMemo(() => {
    if (payload?.supportedActions?.length) {
      return ACTIONS.filter((a) => payload.supportedActions!.includes(a));
    }
    return [...ACTIONS];
  }, [payload?.supportedActions]);

  const [selectedAction, setSelectedAction] = useState<AiAssistAction | null>(null);
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<{ output: string; action: AiAssistAction } | null>(null);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);

  // Reset state when payload changes (sheets stay mounted)
  useEffect(() => {
    const newText = payload?.text?.slice(0, MAX_INPUT) || '';
    setText(newText);
    setSelectedAction(null);
    setResult(null);
    setSelectedTitleIndex(0);
  }, [payload]);

  // Fetch points balance
  const pointsQuery = useQuery({
    ...getPointsQueryOptions(username || '', 0),
    enabled: !!username,
  });

  // Fetch AI assist prices via SDK
  const pricesQuery = useQuery({
    ...getAiAssistPriceQueryOptions(username, code || ''),
    enabled: !!code,
  });

  // AI assist mutation via SDK
  const assistMutation = useAiAssist(username, code);

  const selectedPrice = useMemo(() => {
    if (!selectedAction || !pricesQuery.data) return null;
    return pricesQuery.data.find((p) => p.action === selectedAction) ?? null;
  }, [selectedAction, pricesQuery.data]);

  const minInput = getMinInput(selectedAction);
  const isFree = selectedPrice ? (selectedPrice.free_remaining ?? 0) > 0 : false;
  const cost = isFree ? 0 : selectedPrice?.cost ?? 0;

  const balance = useMemo(() => {
    if (!pointsQuery.data?.points) return 0;
    return parseFloat(String(pointsQuery.data.points).replace(/,/g, ''));
  }, [pointsQuery.data]);

  const isInsufficientBalance = useMemo(() => {
    if (isFree) return false;
    if (selectedPrice) return balance < selectedPrice.cost;
    return false;
  }, [balance, selectedPrice, isFree]);

  const canSubmit =
    selectedAction &&
    selectedPrice &&
    !pricesQuery.isLoading &&
    text.trim().length >= minInput &&
    !isInsufficientBalance &&
    !assistMutation.isPending;

  const handleSubmit = useCallback(async () => {
    if (!selectedAction || !text.trim()) return;
    if (text.trim().length < minInput) return;

    try {
      const res = await assistMutation.mutateAsync({
        action: selectedAction,
        text: text.trim().slice(0, MAX_INPUT),
      });

      const resAction = ACTIONS.includes(res.action as AiAssistAction)
        ? (res.action as AiAssistAction)
        : selectedAction;
      setResult({ output: res.output, action: resAction });
    } catch (err: any) {
      const status = err?.status;
      const data = err?.data;

      if (status === 402) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage(
            { id: 'ai_assist.error_insufficient_points' },
            { required: data?.required ?? cost, available: data?.available ?? '0' },
          ),
        );
      } else if (status === 422) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage({ id: 'ai_assist.error_content_policy' }),
        );
      } else if (status === 429) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage({ id: 'ai_assist.error_rate_limit' }),
        );
      } else {
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage({ id: 'ai_assist.error_generic' }),
        );
      }
    }
  }, [selectedAction, text, assistMutation, cost, intl, minInput]);

  // Parse result for structured output
  const parsedResult = useMemo(() => {
    if (!result) return null;

    const stripped = result.output
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();

    if (result.action === 'generate_title') {
      try {
        const titles = JSON.parse(stripped);
        if (
          Array.isArray(titles) &&
          titles.length > 0 &&
          titles.every((t) => typeof t === 'string')
        ) {
          return {
            type: 'titles' as const,
            titles: [...new Set(titles.map((t: string) => t.trim()).filter(Boolean))],
          };
        }
      } catch {
        // fall through
      }
    }

    if (result.action === 'suggest_tags') {
      try {
        const tags = JSON.parse(stripped);
        if (Array.isArray(tags) && tags.length > 0 && tags.every((t) => typeof t === 'string')) {
          return {
            type: 'tags' as const,
            tags: [...new Set(tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean))],
          };
        }
      } catch {
        // fall through
      }
    }

    return { type: 'text' as const };
  }, [result]);

  const getApplyValue = useCallback(() => {
    if (!result) return '';
    if (parsedResult?.type === 'titles') {
      return parsedResult.titles[selectedTitleIndex] || parsedResult.titles[0];
    }
    if (parsedResult?.type === 'tags') {
      return JSON.stringify(parsedResult.tags);
    }
    return result.output;
  }, [result, parsedResult, selectedTitleIndex]);

  const _handleApply = useCallback(() => {
    if (!result) return;
    payload?.onApply?.(getApplyValue(), result.action);
    SheetManager.hide(SheetNames.AI_ASSIST);
  }, [result, getApplyValue, payload]);

  const _handleCopy = useCallback(() => {
    if (!result) return;
    let value: string;
    if (parsedResult?.type === 'tags') {
      value = parsedResult.tags.join(', ');
    } else if (parsedResult?.type === 'titles') {
      value = parsedResult.titles[selectedTitleIndex] || parsedResult.titles[0];
    } else {
      value = result.output;
    }
    Clipboard.setString(value);
    Alert.alert(intl.formatMessage({ id: 'alert.copied' }));
  }, [result, parsedResult, selectedTitleIndex, intl]);

  const _handleTryAgain = useCallback(() => {
    setResult(null);
  }, []);

  const _handleTryAnother = useCallback(() => {
    setResult(null);
    setSelectedAction(null);
  }, []);

  const _renderActionCard = (action: AiAssistAction) => {
    const isSelected = selectedAction === action;
    const price = pricesQuery.data?.find((p) => p.action === action);
    const freeRemaining = price?.free_remaining ?? 0;

    return (
      <TouchableOpacity
        key={action}
        style={[styles.actionCard, isSelected && styles.actionCardSelected]}
        onPress={() => setSelectedAction(action)}
        activeOpacity={0.7}
      >
        <View style={styles.actionCardContent}>
          <Text style={[styles.actionName, isSelected && styles.actionNameSelected]}>
            {intl.formatMessage({ id: `ai_assist.action_${action}` })}
          </Text>
          <Text style={[styles.actionDesc, isSelected && styles.actionDescSelected]}>
            {intl.formatMessage({ id: `ai_assist.action_${action}_desc` })}
          </Text>
        </View>
        <View style={styles.costRow}>
          {freeRemaining > 0 && (
            <Text style={styles.freeLabel}>
              {intl.formatMessage({ id: 'ai_assist.free_remaining' }, { count: freeRemaining })}
            </Text>
          )}
          <Text style={[styles.actionCost, isSelected && styles.actionCostSelected]}>
            {price?.cost ?? '?'} {intl.formatMessage({ id: 'ai_assist.points_unit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const _renderResultView = () => {
    if (!result) return null;

    return (
      <ScrollView>
        <Text style={styles.resultLabel}>
          {intl.formatMessage({ id: 'ai_assist.result_title' })}
        </Text>

        {parsedResult?.type === 'titles' ? (
          <View>
            {parsedResult.titles.map((title) => (
              <TouchableOpacity
                key={title}
                style={[
                  styles.titleOption,
                  selectedTitleIndex === parsedResult.titles.indexOf(title) &&
                    styles.titleOptionSelected,
                ]}
                onPress={() => setSelectedTitleIndex(parsedResult.titles.indexOf(title))}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.titleOptionText,
                    selectedTitleIndex === parsedResult.titles.indexOf(title) &&
                      styles.titleOptionTextSelected,
                  ]}
                >
                  {title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : parsedResult?.type === 'tags' ? (
          <View style={styles.resultBox}>
            <View style={styles.tagsContainer}>
              {parsedResult.tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <ScrollView style={styles.resultBox} nestedScrollEnabled>
            <Text style={styles.resultText}>{result.output}</Text>
          </ScrollView>
        )}

        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.actionButton} onPress={_handleApply} activeOpacity={0.7}>
            <Text style={styles.actionButtonText}>
              {intl.formatMessage({ id: 'ai_assist.apply_button' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={_handleCopy}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              {intl.formatMessage({ id: 'ai_assist.copy_button' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={_handleTryAgain}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              {intl.formatMessage({ id: 'ai_assist.try_again' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={_handleTryAnother}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              {intl.formatMessage({ id: 'ai_assist.try_another' })}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const _renderFormView = () => (
    <ScrollView keyboardShouldPersistTaps="handled">
      {/* Balance and cost row */}
      <View style={styles.header}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>
            {intl.formatMessage({ id: 'ai_assist.balance_label' })}:
          </Text>
          <Text style={styles.balanceValue}>
            {pointsQuery.isLoading
              ? '...'
              : `${pointsQuery.data?.points ?? '0'} ${intl.formatMessage({
                  id: 'ai_assist.points_unit',
                })}`}
          </Text>
        </View>
        {selectedPrice && (
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>
              {intl.formatMessage({ id: 'ai_assist.cost_label' })}:
            </Text>
            <Text style={isFree ? styles.freeCostValue : styles.costValue}>
              {isFree
                ? intl.formatMessage({ id: 'ai_assist.free_label' })
                : `${selectedPrice.cost} ${intl.formatMessage({ id: 'ai_assist.points_unit' })}`}
            </Text>
          </View>
        )}
      </View>

      {/* Hint */}
      <Text style={styles.hintText}>{intl.formatMessage({ id: 'ai_assist.hint' })}</Text>

      {/* Action selection */}
      <Text style={styles.sectionLabel}>
        {intl.formatMessage({ id: 'ai_assist.action_label' })}
      </Text>
      {pricesQuery.isLoading ? (
        <ActivityIndicator />
      ) : (
        availableActions.map((action) => _renderActionCard(action))
      )}

      {/* Text input */}
      {selectedAction && (
        <>
          <Text style={styles.sectionLabelWithMargin}>
            {intl.formatMessage({ id: 'ai_assist.text_label' })}
          </Text>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={(v) => setText(v.slice(0, MAX_INPUT))}
            placeholder={intl.formatMessage({ id: 'ai_assist.text_placeholder' })}
            multiline
            maxLength={MAX_INPUT}
          />
          <Text style={[styles.charCount, text.length < minInput && styles.charCountError]}>
            {text.length < minInput
              ? intl.formatMessage({ id: 'ai_assist.min_chars' }, { count: minInput })
              : intl.formatMessage(
                  { id: 'ai_assist.chars_remaining' },
                  { count: MAX_INPUT - text.length },
                )}
          </Text>
        </>
      )}

      {/* Insufficient balance error */}
      {isInsufficientBalance && (
        <Text style={styles.errorText}>
          {intl.formatMessage(
            { id: 'ai_assist.error_insufficient_points' },
            { required: selectedPrice?.cost ?? 0, available: balance },
          )}
        </Text>
      )}

      {/* Submit button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          styles.actionButton,
          !canSubmit && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        activeOpacity={0.7}
      >
        {assistMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonTextCentered}>
            {intl.formatMessage({ id: 'ai_assist.submit_button' })}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <ActionSheet id={SheetNames.AI_ASSIST} gestureEnabled containerStyle={styles.sheetContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'ai_assist.title' })}</Text>
        {result ? _renderResultView() : _renderFormView()}
      </View>
    </ActionSheet>
  );
};
