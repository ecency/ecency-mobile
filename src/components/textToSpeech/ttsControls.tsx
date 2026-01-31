import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { Icon } from '../icon';
import { IconButton } from '../iconButton';
import { extractPlainTextForTTS, hasReadableContent } from '../../utils/textToSpeech';
import { loadTTSSettings, TTSSettings } from '../../utils/ttsSettings';

interface TTSControlsProps {
  post: any;
  style?: any;
  showLabel?: boolean;
}

export const TTSControls = ({ post, style, showLabel = false }: TTSControlsProps) => {
  const intl = useIntl();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const settingsRef = useRef<TTSSettings | null>(null);
  const isMountedRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    // Load settings on mount
    loadTTSSettings().then((settings) => {
      if (isMountedRef.current) {
        settingsRef.current = settings;
      }
    });

    return () => {
      isMountedRef.current = false;
      // Clear loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      // Stop TTS when component unmounts
      Speech.stop();
    };
  }, []);

  // Stop TTS when post changes
  useEffect(() => {
    return () => {
      // Clear loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      Speech.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoading(false);
    };
  }, [post?.permlink]);

  const handlePlayPause = async () => {
    if (isPlaying && !isPaused) {
      // Pause
      try {
        await Speech.pause();
        setIsPaused(true);
      } catch (error) {
        console.error('TTS pause failed:', error);
        Speech.stop();
        if (isMountedRef.current) {
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoading(false);
        }
      }
    } else if (isPaused) {
      // Resume
      try {
        await Speech.resume();
        setIsPaused(false);
      } catch (error) {
        console.error('TTS resume failed:', error);
        Speech.stop();
        if (isMountedRef.current) {
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoading(false);
        }
      }
    } else {
      // Start playing
      setIsLoading(true);

      // Set timeout to handle cases where onStart never fires (e.g., TTS not available on device)
      // This prevents infinite loading state on some Android devices
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          console.warn('TTS onStart timeout - stopping loading state');
          setIsLoading(false);
          // If onStart didn't fire, likely TTS failed silently
          setIsPlaying(false);
          setIsPaused(false);
        }
      }, 5000); // 5 second timeout

      try {
        const text = extractPlainTextForTTS(post);

        if (!text || text.length < 10) {
          console.warn('No readable text found in post');
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          setIsLoading(false);
          return;
        }

        // Check if TTS is available on the device
        const isAvailable = await Speech.isSpeakingAsync().catch(() => false);
        console.log('TTS availability check:', isAvailable);

        // Reload settings in case they changed
        const settings = await loadTTSSettings();
        settingsRef.current = settings;

        const speechOptions: Speech.SpeechOptions = {
          language: settings.language,
          pitch: settings.pitch,
          rate: settings.rate,
          onStart: () => {
            // Clear timeout since onStart fired successfully
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            if (isMountedRef.current) {
              setIsPlaying(true);
              setIsLoading(false);
            }
          },
          onDone: () => {
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            if (isMountedRef.current) {
              setIsPlaying(false);
              setIsPaused(false);
            }
          },
          onStopped: () => {
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            if (isMountedRef.current) {
              setIsPlaying(false);
              setIsPaused(false);
            }
          },
          onError: (error) => {
            console.error('TTS error:', error);
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            if (isMountedRef.current) {
              setIsPlaying(false);
              setIsPaused(false);
              setIsLoading(false);
            }
          },
        };

        // Add voice if specified
        if (settings.voice) {
          speechOptions.voice = settings.voice;
        }

        Speech.speak(text, speechOptions);
      } catch (error) {
        console.error('Failed to start TTS:', error);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        setIsLoading(false);
      }
    }
  };

  const handleStop = () => {
    Speech.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Don't show TTS controls if post has no readable content
  if (!hasReadableContent(post)) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <ActivityIndicator size="small" color={EStyleSheet.value('$primaryBlue')} />
      ) : (
        <>
          {showLabel ? (
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.playButtonWithLabel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                iconType="MaterialCommunityIcons"
                name={isPlaying && !isPaused ? 'pause' : 'play'}
                size={20}
                color={EStyleSheet.value('$primaryBlue')}
              />
              <Text style={styles.playLabel}>
                {isPlaying && !isPaused
                  ? intl.formatMessage({ id: 'tts.pause' })
                  : intl.formatMessage({ id: 'tts.play' })}
              </Text>
            </TouchableOpacity>
          ) : (
            <IconButton
              iconType="MaterialCommunityIcons"
              name={isPlaying && !isPaused ? 'pause' : 'play'}
              onPress={handlePlayPause}
              size={24}
              color={EStyleSheet.value('$primaryBlack')}
              style={styles.playButton}
            />
          )}
          {isPlaying && !showLabel && (
            <IconButton
              iconType="MaterialCommunityIcons"
              name="stop"
              onPress={handleStop}
              size={24}
              color={EStyleSheet.value('$primaryBlack')}
              style={styles.stopButton}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    marginRight: 0,
  },
  stopButton: {
    marginRight: 0,
  },
  playButtonWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '$primaryBlue',
  },
});
