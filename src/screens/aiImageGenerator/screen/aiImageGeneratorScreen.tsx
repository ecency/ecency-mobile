import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getAiGeneratePriceQueryOptions, getPointsQueryOptions } from '@ecency/sdk';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BasicHeader } from '../../../components/basicHeader';
import { MainButton } from '../../../components/mainButton';
import { useGenerateImageMutation } from '../../../providers/sdk/mutations';
import { useAuth } from '../../../hooks';
import globalStyles from '../../../globalStyles';
import styles from '../styles/aiImageGeneratorScreen.styles';

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'];
const DEFAULT_RATIO = '4:3';
const MAX_PROMPT_LENGTH = 1000;

const POWER_LABELS: Record<number, string> = {
  1: '1x',
  2: '2x',
  4: '4x',
  6: '6x',
};

interface AiImageGeneratorParams {
  onInsert?: (url: string) => void;
  suggestedPrompt?: string;
}

const AiImageGeneratorScreen = () => {
  const intl = useIntl();
  const navigation = useNavigation();
  const route = useRoute();
  const { username, code } = useAuth();

  const { onInsert, suggestedPrompt } = (route.params ?? {}) as AiImageGeneratorParams;

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_RATIO);
  const [selectedPower, setSelectedPower] = useState(1);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const generateMutation = useGenerateImageMutation();

  const priceQuery = useQuery({
    ...getAiGeneratePriceQueryOptions(code || ''),
    enabled: !!code,
  });

  const pointsQuery = useQuery({
    ...getPointsQueryOptions(username || '', 0),
    enabled: !!username,
  });

  const prices = priceQuery.data?.prices;
  const powerTiers = priceQuery.data?.power;

  const balance = useMemo(() => {
    if (!pointsQuery.data?.points) return 0;
    const normalized = String(pointsQuery.data.points).replace(/,/g, '');
    const value = Math.round(parseFloat(normalized) * 1000) / 1000;
    return Number.isNaN(value) ? 0 : value;
  }, [pointsQuery.data]);

  const baseCost = useMemo(() => {
    if (!prices || prices.length === 0) return 150;
    const match = prices.find((p) => p.aspect_ratio === aspectRatio);
    return match?.cost ?? prices[0]?.cost ?? 150;
  }, [prices, aspectRatio]);

  const powerMultiplier = useMemo(() => {
    if (!powerTiers) return 1;
    const tier = powerTiers.find((t) => t.power === selectedPower);
    return tier?.multiplier ?? 1;
  }, [powerTiers, selectedPower]);

  const cost = baseCost * powerMultiplier;

  const canGenerate = prompt.trim().length > 0 && balance >= cost && !generateMutation.isPending;

  const _handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert(intl.formatMessage({ id: 'ai_image_generator.error_prompt_required' }));
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio,
        power: selectedPower,
      });
      setGeneratedUrl(result.url);
      // Refresh balance
      pointsQuery.refetch();
    } catch (error: any) {
      const status = error?.response?.status || error?.status;
      let messageId = 'ai_image_generator.error_generic';

      if (status === 402) {
        messageId = 'ai_image_generator.error_insufficient_points';
      } else if (status === 422) {
        messageId = 'ai_image_generator.error_content_policy';
      } else if (status === 429) {
        messageId = 'ai_image_generator.error_rate_limit';
      }

      if (messageId === 'ai_image_generator.error_insufficient_points') {
        Alert.alert(
          intl.formatMessage(
            { id: messageId },
            { required: String(cost), available: String(balance) },
          ),
        );
      } else {
        Alert.alert(intl.formatMessage({ id: messageId }));
      }
    }
  };

  const _handleInsert = () => {
    if (generatedUrl && onInsert) {
      onInsert(generatedUrl);
      navigation.goBack();
    }
  };

  const _handleShare = async () => {
    if (generatedUrl) {
      try {
        await Share.share({ message: generatedUrl });
      } catch (e) {
        console.error('Share failed:', e);
      }
    }
  };

  const _handleGenerateAgain = () => {
    setGeneratedUrl(null);
  };

  const _getAspectRatioNumber = (ratio: string): number => {
    const parts = ratio.split(':').map(Number);
    const w = parts[0];
    const h = parts[1];
    if (!Number.isFinite(w) || !Number.isFinite(h) || h === 0) {
      return 4 / 3;
    }
    return w / h;
  };

  const _renderPromptInput = () => (
    <View>
      <Text style={styles.promptLabel}>
        {intl.formatMessage({ id: 'ai_image_generator.prompt_label' })}
      </Text>
      <TextInput
        style={styles.promptInput}
        value={prompt}
        onChangeText={(text) => setPrompt(text.slice(0, MAX_PROMPT_LENGTH))}
        placeholder={intl.formatMessage({ id: 'ai_image_generator.prompt_placeholder' })}
        placeholderTextColor="#c1c5c7"
        multiline
        maxLength={MAX_PROMPT_LENGTH}
        editable={!generateMutation.isPending}
      />
      <Text style={styles.charCount}>
        {intl.formatMessage(
          { id: 'ai_image_generator.chars_remaining' },
          { count: MAX_PROMPT_LENGTH - prompt.length },
        )}
      </Text>
      {suggestedPrompt && !prompt.trim() && (
        <TouchableOpacity
          style={styles.suggestionPill}
          onPress={() => setPrompt(suggestedPrompt.slice(0, MAX_PROMPT_LENGTH))}
        >
          <Text style={styles.suggestionPillText} numberOfLines={2}>
            {intl.formatMessage(
              { id: 'ai_image_generator.use_suggestion' },
              {
                suggestion:
                  suggestedPrompt.length > 80
                    ? `${suggestedPrompt.slice(0, 80)}\u2026`
                    : suggestedPrompt,
              },
            )}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const _renderAspectRatioSelector = () => (
    <View>
      <Text style={styles.sectionLabel}>
        {intl.formatMessage({ id: 'ai_image_generator.select_aspect_ratio' })}
      </Text>
      <View style={styles.ratioContainer}>
        {ASPECT_RATIOS.map((ratio) => {
          const isActive = ratio === aspectRatio;
          return (
            <TouchableOpacity
              key={ratio}
              style={[styles.ratioPill, isActive && styles.ratioPillActive]}
              onPress={() => setAspectRatio(ratio)}
              disabled={generateMutation.isPending}
            >
              <Text style={[styles.ratioPillText, isActive && styles.ratioPillTextActive]}>
                {ratio}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const _renderPowerSelector = () => {
    if (!powerTiers || powerTiers.length <= 1) return null;

    return (
      <View>
        <Text style={styles.sectionLabel}>
          {intl.formatMessage({ id: 'ai_image_generator.select_power' })}
        </Text>
        <View style={styles.ratioContainer}>
          {powerTiers.map((tier) => {
            const isActive = tier.power === selectedPower;
            return (
              <TouchableOpacity
                key={tier.power}
                style={[styles.ratioPill, isActive && styles.ratioPillActive]}
                onPress={() => setSelectedPower(tier.power)}
                disabled={generateMutation.isPending}
              >
                <Text style={[styles.ratioPillText, isActive && styles.ratioPillTextActive]}>
                  {POWER_LABELS[tier.power] ?? `${tier.power}x`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const _renderCostAndBalance = () => (
    <View style={styles.balanceContainer}>
      <Text style={styles.balanceLabel}>
        {intl.formatMessage({ id: 'ai_image_generator.balance_label' })}:{' '}
        <Text style={styles.balanceValue}>
          {balance} {intl.formatMessage({ id: 'ai_image_generator.points_unit' })}
        </Text>
      </Text>
      <Text style={styles.costLabel}>
        {intl.formatMessage({ id: 'ai_image_generator.cost_label' })}:{' '}
        <Text style={styles.costValue}>
          {cost} {intl.formatMessage({ id: 'ai_image_generator.points_unit' })}
        </Text>
      </Text>
    </View>
  );

  const _renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>
        {intl.formatMessage({ id: 'ai_image_generator.generating' })}
      </Text>
    </View>
  );

  const _renderResult = () => (
    <View style={styles.resultContainer}>
      <ExpoImage
        source={{ uri: generatedUrl! }}
        style={[styles.resultImage, { aspectRatio: _getAspectRatioNumber(aspectRatio) }]}
        contentFit="contain"
      />
      <View style={styles.resultActions}>
        {onInsert && (
          <MainButton
            style={styles.actionButton}
            onPress={_handleInsert}
            text={intl.formatMessage({ id: 'ai_image_generator.insert_button' })}
          />
        )}
        <MainButton
          style={styles.actionButton}
          onPress={_handleShare}
          text={intl.formatMessage({ id: 'ai_image_generator.share_button' })}
        />
      </View>
      <MainButton
        style={styles.generateAgainButton}
        onPress={_handleGenerateAgain}
        text={intl.formatMessage({ id: 'ai_image_generator.generate_again' })}
        isTransparent
      />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={globalStyles.defaultContainer}>
      <BasicHeader title={intl.formatMessage({ id: 'ai_image_generator.title' })} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {_renderCostAndBalance()}

        {!generatedUrl && (
          <>
            {_renderPromptInput()}
            {_renderAspectRatioSelector()}
            {_renderPowerSelector()}

            {generateMutation.isPending ? (
              _renderLoading()
            ) : (
              <MainButton
                style={styles.generateButton}
                onPress={_handleGenerate}
                isDisable={!canGenerate}
                text={intl.formatMessage({ id: 'ai_image_generator.generate_button' })}
              />
            )}
          </>
        )}

        {generatedUrl && _renderResult()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AiImageGeneratorScreen;
