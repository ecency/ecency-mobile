import React, { useMemo, useState, useCallback, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import { useAiAssist } from '@ecency/sdk';
import { Icon } from '../../icon';
import { TTSControls } from '../../textToSpeech/ttsControls';
import {
  extractPlainTextForTTS,
  hasReadableContent,
  countWords,
  estimateReadingMinutes,
} from '../../../utils/textToSpeech';
import { useAuth } from '../../../hooks';
import { SheetNames } from '../../../navigation/sheets';

interface PostReadingMetadataProps {
  post: any;
}

const PostReadingMetadataComponent = ({ post }: PostReadingMetadataProps) => {
  const intl = useIntl();
  const { username, code } = useAuth();
  const assistMutation = useAiAssist(username, code);
  const [summary, setSummary] = useState<string | null>(null);

  // Reset summary when viewing a different post
  useEffect(() => {
    setSummary(null);
  }, [post?.permlink]);

  // Calculate word count and reading time
  const { wordCount, readingTime, plainText } = useMemo(() => {
    if (!post || !post.body) {
      return { wordCount: 0, readingTime: 0, plainText: '' };
    }

    const text = extractPlainTextForTTS(post);

    if (text.trim().length === 0) {
      return { wordCount: 0, readingTime: 0, plainText: '' };
    }

    const words = countWords(text);
    const minutes = estimateReadingMinutes(text);

    return { wordCount: words, readingTime: minutes, plainText: text };
  }, [post?.body]);

  const handleSettingsPress = () => {
    SheetManager.show(SheetNames.TTS_SETTINGS);
  };

  const handleSummarize = useCallback(async () => {
    if (!username || plainText.length < 50) return;

    try {
      const res = await assistMutation.mutateAsync({
        action: 'summarize',
        text: plainText.slice(0, 10000),
      });
      setSummary(res.output);
    } catch (err: any) {
      const status = err?.status;
      const data = err?.data;
      if (status === 402) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage(
            { id: 'ai_assist.error_insufficient_points' },
            { required: data?.required ?? 0, available: data?.available ?? '0' },
          ),
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
  }, [username, plainText, assistMutation, intl]);

  // Don't show if post has no readable content or less than 10 words
  if (!hasReadableContent(post) || wordCount < 10) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.metadataSection}>
        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>{intl.formatMessage({ id: 'post.words' })}</Text>
          <Text style={styles.metadataValue}>{wordCount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metadataItem}>
          <Text style={styles.metadataLabel}>{intl.formatMessage({ id: 'post.reading' })}</Text>
          <Text style={styles.metadataValue}>
            {readingTime} {intl.formatMessage({ id: 'post.min' })}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.listenSection}>
          <Text style={styles.metadataLabel}>{intl.formatMessage({ id: 'post.listen' })}</Text>
          <View style={styles.listenControls}>
            <TTSControls post={post} style={styles.ttsControls} showLabel={true} />
            <TouchableOpacity
              onPress={handleSettingsPress}
              style={styles.settingsButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                iconType="MaterialCommunityIcons"
                name="cog-outline"
                size={20}
                color={EStyleSheet.value('$iconColor')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {!!username && wordCount >= 50 && (
          <>
            <View style={styles.divider} />
            <View style={styles.summarizeSection}>
              <View style={styles.summarizeLabelRow}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              </View>
              {summary ? (
                <TouchableOpacity onPress={() => setSummary(null)}>
                  <Text style={styles.summarizeLink}>
                    {intl.formatMessage({ id: 'ai_assist.try_again' })}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleSummarize} disabled={assistMutation.isPending}>
                  {assistMutation.isPending ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text style={styles.summarizeLink}>
                      {intl.formatMessage({ id: 'ai_assist.action_summarize' })}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {!!summary && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      )}
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '$primaryLightBackground',
    backgroundColor: '$primaryBackgroundColor',
    marginVertical: 8,
  },
  metadataSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metadataItem: {
    flex: 1,
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 12,
    color: '$primaryDarkGray',
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryBlack',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '$primaryLightBackground',
  },
  listenSection: {
    flex: 1,
    alignItems: 'center',
  },
  listenControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ttsControls: {
    marginRight: 4,
  },
  settingsButton: {
    padding: 4,
  },
  summarizeSection: {
    flex: 1,
    alignItems: 'center',
  },
  summarizeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiBadge: {
    backgroundColor: '$primaryBlue',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  aiBadgeText: {
    color: '$white',
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 10,
  },
  summarizeLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlue',
  },
  summaryBox: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '$primaryBlack',
    lineHeight: 20,
  },
});

// Memoize to prevent unnecessary re-renders that could cause infinite loops in FlashList
export const PostReadingMetadata = memo(PostReadingMetadataComponent, (prevProps, nextProps) => {
  // Only re-render if post.body actually changed
  return (
    prevProps.post?.body === nextProps.post?.body &&
    prevProps.post?.permlink === nextProps.post?.permlink
  );
});
