/**
 * Text-to-Speech settings persistence utilities
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const TTS_SETTINGS_KEY = 'tts_settings';

export interface TTSSettings {
  voice: string | null;
  rate: number;
  pitch: number;
  language: string;
}

/**
 * Default TTS settings
 */
const getDefaultSettings = (): TTSSettings => ({
  voice: null, // Use system default
  rate: 1.0,
  pitch: 1.0,
  language: 'auto',
});

/**
 * Load TTS settings from AsyncStorage
 */
export const loadTTSSettings = async (): Promise<TTSSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(TTS_SETTINGS_KEY);
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      // Validate settings
      return {
        voice: settings.voice || null,
        rate: typeof settings.rate === 'number' ? settings.rate : 1.0,
        pitch: typeof settings.pitch === 'number' ? settings.pitch : 1.0,
        language: settings.language || 'auto',
      };
    }
    return getDefaultSettings();
  } catch (error) {
    console.warn('Failed to load TTS settings:', error);
    return getDefaultSettings();
  }
};

/**
 * Save TTS settings to AsyncStorage
 */
export const saveTTSSettings = async (settings: TTSSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save TTS settings:', error);
  }
};

/**
 * Reset TTS settings to defaults
 */
export const resetTTSSettings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TTS_SETTINGS_KEY);
  } catch (error) {
    console.error('Failed to reset TTS settings:', error);
  }
};
