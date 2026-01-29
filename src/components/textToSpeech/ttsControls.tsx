import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import EStyleSheet from 'react-native-extended-stylesheet';
import { IconButton } from '../iconButton';
import { extractPlainTextForTTS, hasReadableContent } from '../../utils/textToSpeech';
import { loadTTSSettings, TTSSettings } from '../../utils/ttsSettings';

interface TTSControlsProps {
  post: any;
  style?: any;
}

export const TTSControls = ({ post, style }: TTSControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const settingsRef = useRef<TTSSettings | null>(null);
  const isMountedRef = useRef(true);

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
      // Stop TTS when component unmounts
      Speech.stop();
    };
  }, []);

  // Stop TTS when post changes
  useEffect(() => {
    return () => {
      Speech.stop();
      setIsPlaying(false);
      setIsPaused(false);
    };
  }, [post?.permlink]);

  const handlePlayPause = async () => {
    if (isPlaying && !isPaused) {
      // Pause
      await Speech.pause();
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      await Speech.resume();
      setIsPaused(false);
    } else {
      // Start playing
      setIsLoading(true);

      try {
        const text = extractPlainTextForTTS(post);

        if (!text || text.length < 10) {
          console.warn('No readable text found in post');
          setIsLoading(false);
          return;
        }

        // Reload settings in case they changed
        const settings = await loadTTSSettings();
        settingsRef.current = settings;

        const speechOptions: Speech.SpeechOptions = {
          language: settings.language,
          pitch: settings.pitch,
          rate: settings.rate,
          onStart: () => {
            if (isMountedRef.current) {
              setIsPlaying(true);
              setIsLoading(false);
            }
          },
          onDone: () => {
            if (isMountedRef.current) {
              setIsPlaying(false);
              setIsPaused(false);
            }
          },
          onStopped: () => {
            if (isMountedRef.current) {
              setIsPlaying(false);
              setIsPaused(false);
            }
          },
          onError: (error) => {
            console.error('TTS error:', error);
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
          <IconButton
            iconType="MaterialCommunityIcons"
            name={isPlaying && !isPaused ? 'pause' : 'play'}
            onPress={handlePlayPause}
            size={24}
            color={EStyleSheet.value('$primaryBlack')}
            style={styles.playButton}
          />
          {isPlaying && (
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
});
