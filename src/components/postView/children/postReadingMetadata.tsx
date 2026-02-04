import React, { useMemo, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import { Icon } from '../../icon';
import { TTSControls } from '../../textToSpeech/ttsControls';
import { extractPlainTextForTTS, hasReadableContent } from '../../../utils/textToSpeech';
import { SheetNames } from '../../../navigation/sheets';

interface PostReadingMetadataProps {
  post: any;
}

const PostReadingMetadataComponent = ({ post }: PostReadingMetadataProps) => {
  const intl = useIntl();

  // Calculate word count and reading time
  const { wordCount, readingTime } = useMemo(() => {
    if (!post || !post.body) {
      return { wordCount: 0, readingTime: 0 };
    }

    const text = extractPlainTextForTTS(post);
    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      return { wordCount: 0, readingTime: 0 };
    }

    const words = trimmedText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(words / 150); // 150 WPM average reading speed

    return { wordCount: words, readingTime: minutes };
  }, [post?.body]);

  const handleSettingsPress = () => {
    SheetManager.show(SheetNames.TTS_SETTINGS);
  };

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
      </View>
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
});

// Memoize to prevent unnecessary re-renders that could cause infinite loops in FlashList
export const PostReadingMetadata = memo(PostReadingMetadataComponent, (prevProps, nextProps) => {
  // Only re-render if post.body actually changed
  return (
    prevProps.post?.body === nextProps.post?.body &&
    prevProps.post?.permlink === nextProps.post?.permlink
  );
});
