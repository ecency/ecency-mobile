import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';
import ActionSheet, { SheetProps, SheetManager } from 'react-native-actions-sheet';
import * as Speech from 'expo-speech';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import Slider from '@esteemapp/react-native-slider';
import { DropdownButton, MainButton, ModalHeader } from '../index';
import { loadTTSSettings, saveTTSSettings, TTSSettings } from '../../utils/ttsSettings';
import { detectTextLanguage } from '../../utils/textToSpeech';

const LANGUAGE_OPTIONS: { label: string; code: string }[] = [
  { label: 'Auto-detect', code: 'auto' },
  { label: 'English', code: 'en-US' },
  { label: 'Chinese (Simplified)', code: 'zh-CN' },
  { label: 'Chinese (Traditional)', code: 'zh-TW' },
  { label: 'Japanese', code: 'ja-JP' },
  { label: 'Korean', code: 'ko-KR' },
  { label: 'Spanish', code: 'es-ES' },
  { label: 'French', code: 'fr-FR' },
  { label: 'German', code: 'de-DE' },
  { label: 'Russian', code: 'ru-RU' },
  { label: 'Portuguese', code: 'pt-BR' },
  { label: 'Hindi', code: 'hi-IN' },
  { label: 'Arabic', code: 'ar-SA' },
];

interface TTSSettingsSheetProps extends SheetProps<'tts_settings'> {}

export const TTSSettingsSheet = ({ sheetId, payload }: TTSSettingsSheetProps) => {
  const intl = useIntl();
  const [settings, setSettings] = useState<TTSSettings>({
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    language: 'auto',
  });
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const settingsRef = useRef<TTSSettings>(settings);

  // Keep ref updated
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load available voices
        const voices = await Speech.getAvailableVoicesAsync();
        setAvailableVoices(voices);

        // Load saved settings
        const savedSettings = await loadTTSSettings();
        setSettings(savedSettings);
      } catch (error) {
        console.error('Failed to load TTS data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Save settings on unmount
    return () => {
      saveTTSSettings(settingsRef.current);
    };
  }, []);

  const handleClose = async () => {
    try {
      await saveTTSSettings(settings);
      if (payload?.onSettingsChanged) {
        payload.onSettingsChanged();
      }
      SheetManager.hide(sheetId);
    } catch (error) {
      console.error('Failed to save TTS settings:', error);
    }
  };

  const handleTestVoice = () => {
    const testText = 'This is how the voice will sound when reading posts.';
    const language =
      settings.language === 'auto' ? detectTextLanguage(testText) : settings.language;
    Speech.speak(testText, {
      language,
      pitch: settings.pitch,
      rate: settings.rate,
      voice: settings.voice || undefined,
    });
  };

  const currentVoiceName = settings.voice
    ? availableVoices.find((v) => v.identifier === settings.voice)?.name || 'System Default'
    : 'System Default';

  const selectedLang = LANGUAGE_OPTIONS.find((l) => l.code === settings.language);
  const selectedLanguageLabel = selectedLang
    ? selectedLang.code === 'auto'
      ? intl.formatMessage({ id: 'tts.language_auto' })
      : selectedLang.label
    : intl.formatMessage({ id: 'tts.language_auto' });

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled={true}
      containerStyle={styles.sheetContainer}
      indicatorStyle={styles.indicator}
    >
      <ModalHeader
        title={intl.formatMessage({ id: 'tts.settings_title' })}
        onClosePress={handleClose}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Voice Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{intl.formatMessage({ id: 'tts.voice' })}</Text>
          <Text style={styles.currentValue}>{currentVoiceName}</Text>
          <Text style={styles.hint}>{intl.formatMessage({ id: 'tts.voice_hint' })}</Text>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{intl.formatMessage({ id: 'tts.language' })}</Text>
          <DropdownButton
            isHasChildIcon
            options={LANGUAGE_OPTIONS.map((lang) =>
              lang.code === 'auto' ? intl.formatMessage({ id: 'tts.language_auto' }) : lang.label,
            )}
            defaultText={selectedLanguageLabel}
            selectedOptionIndex={LANGUAGE_OPTIONS.findIndex(
              (lang) => lang.code === settings.language,
            )}
            onSelect={(index: number) =>
              setSettings({ ...settings, language: LANGUAGE_OPTIONS[index].code })
            }
            dropdownButtonStyle={styles.languageDropdownButton}
            textStyle={styles.languageDropdownText}
            rowTextStyle={styles.languageDropdownRowText}
            dropdownStyle={styles.languageDropdown}
            dropdownRowWrapper={styles.languageDropdownRow}
          />
          <Text style={styles.hint}>{intl.formatMessage({ id: 'tts.language_hint' })}</Text>
        </View>

        {/* Speech Rate */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle}>{intl.formatMessage({ id: 'tts.speed' })}</Text>
            <Text style={styles.valueLabel}>{settings.rate.toFixed(1)}x</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            value={settings.rate}
            onValueChange={(rate) => setSettings({ ...settings, rate })}
            minimumTrackTintColor={EStyleSheet.value('$primaryBlue')}
            maximumTrackTintColor={EStyleSheet.value('$darkGrayBackground')}
            thumbTintColor={EStyleSheet.value('$primaryBlue')}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0.5x</Text>
            <Text style={styles.sliderLabel}>2.0x</Text>
          </View>
        </View>

        {/* Pitch */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle}>{intl.formatMessage({ id: 'tts.pitch' })}</Text>
            <Text style={styles.valueLabel}>{settings.pitch.toFixed(1)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2.0}
            step={0.1}
            value={settings.pitch}
            onValueChange={(pitch) => setSettings({ ...settings, pitch })}
            minimumTrackTintColor={EStyleSheet.value('$primaryBlue')}
            maximumTrackTintColor={EStyleSheet.value('$darkGrayBackground')}
            thumbTintColor={EStyleSheet.value('$primaryBlue')}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>Low</Text>
            <Text style={styles.sliderLabel}>High</Text>
          </View>
        </View>

        {/* Test Voice Button */}
        <MainButton
          style={styles.testButton}
          onPress={handleTestVoice}
          text={intl.formatMessage({ id: 'tts.test_voice' })}
          isDisable={isLoading}
        />

        {/* Info */}
        <Text style={styles.infoText}>{intl.formatMessage({ id: 'tts.settings_info' })}</Text>
      </ScrollView>
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  sheetContainer: {
    backgroundColor: '$modalBackground',
    paddingBottom: 20,
  },
  indicator: {
    backgroundColor: '$iconColor',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '$modalBackground',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryDarkText',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 14,
    color: '$primaryDarkGray',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '$iconColor',
    fontStyle: 'italic',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryBlue',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '$iconColor',
  },
  languageDropdownButton: {
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$darkGrayBackground',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    alignSelf: 'stretch',
  },
  languageDropdownText: {
    fontSize: 14,
    color: '$primaryDarkText',
  },
  languageDropdownRowText: {
    fontSize: 14,
    color: '$primaryDarkText',
  },
  languageDropdown: {
    width: '$deviceWidth - 60',
  },
  languageDropdownRow: {
    marginLeft: 10,
  },
  testButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '$iconColor',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});
