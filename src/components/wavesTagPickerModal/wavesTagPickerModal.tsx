import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { getWavesTrendingTagsQueryOptions } from '@ecency/sdk';
import { Icon } from '../icon';
import { useAppSelector } from '../../hooks';
import { setWaveContainers, setWaveTags } from '../../redux/actions/customTabsAction';
import { WAVES_SOURCE_OPTIONS } from '../../constants/waves';
import styles from './wavesTagPickerModalStyles';

export interface WavesTagPickerModalRef {
  show: () => void;
}

const MAX_TRENDING = 24;

// Hive tags are lowercase alphanumerics + hyphens; strip a leading '#' and any
// other characters so a typed "#My Tag" becomes the valid tag "my-tag" candidate.
const normalizeTag = (raw: string): string =>
  (raw || '')
    .trim()
    .toLowerCase()
    .replace(/^#+/, '')
    .replace(/[^a-z0-9-]/g, '');

const WavesTagPickerModal = (_props: unknown, ref: Ref<WavesTagPickerModalRef>) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const sheetModalRef = useRef<any>(null);

  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');

  const waveTags = useAppSelector((state) => state.customTabs.waveTags || []);
  const waveContainers = useAppSelector((state) => state.customTabs.waveContainers || []);

  // Waves-specific trending tags, combined across all containers (undefined
  // host omits the container filter). Fetched only once the sheet is opened.
  const { data: trending } = useQuery({
    ...getWavesTrendingTagsQueryOptions(undefined, 24),
    enabled: visible,
  });

  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
      sheetModalRef.current?.show();
    },
  }));

  const _persist = (tags: string[]) => dispatch(setWaveTags(tags));

  const _addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag || waveTags.includes(tag)) {
      return;
    }
    _persist([...waveTags, tag]);
  };

  const _removeTag = (tag: string) => _persist(waveTags.filter((t: any) => t !== tag));

  // Sources are a fixed set, so each chip toggles its own container on/off.
  const _toggleContainer = (host: string) =>
    dispatch(
      setWaveContainers(
        waveContainers.includes(host)
          ? waveContainers.filter((h: any) => h !== host)
          : [...waveContainers, host],
      ),
    );

  const _onSubmitInput = () => {
    _addTag(input);
    setInput('');
  };

  const trendingTags: string[] = (Array.isArray(trending) ? trending : [])
    .map((item: any) => normalizeTag(item?.tag || ''))
    .filter((tag: string) => tag && !waveTags.includes(tag))
    .slice(0, MAX_TRENDING);

  const canAdd = !!normalizeTag(input);

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      {...({ indicatorColor: EStyleSheet.value('$primaryWhiteLightBackground') } as any)}
      onClose={() => setVisible(false)}
    >
      <KeyboardAvoidingView
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>{intl.formatMessage({ id: 'waves.custom_feeds_title' })}</Text>
        <Text style={styles.subtitle}>
          {intl.formatMessage({ id: 'waves.custom_feeds_subtitle' })}
        </Text>

        <View style={styles.inputRow}>
          <Text style={styles.hash}>#</Text>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={_onSubmitInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            placeholder={intl.formatMessage({ id: 'waves.add_tag_placeholder' })}
            placeholderTextColor={EStyleSheet.value('$primaryDarkGray')}
          />
          <TouchableOpacity
            style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
            onPress={_onSubmitInput}
            disabled={!canAdd}
          >
            <Icon iconType="MaterialIcons" name="add" size={22} style={styles.addBtnIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>{intl.formatMessage({ id: 'waves.sources' })}</Text>
          <View style={styles.chipWrap}>
            {WAVES_SOURCE_OPTIONS.map(({ host, label }) => {
              const active = waveContainers.includes(host);
              return (
                <TouchableOpacity
                  key={host}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => _toggleContainer(host)}
                >
                  <Text style={active ? styles.chipActiveText : styles.chipText}>{label}</Text>
                  <Icon
                    iconType="MaterialIcons"
                    name={active ? 'close' : 'add'}
                    size={15}
                    style={active ? styles.chipActiveIcon : styles.chipAddIcon}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {waveTags.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                {intl.formatMessage({ id: 'waves.your_feeds' })}
              </Text>
              <View style={styles.chipWrap}>
                {waveTags.map((tag: any) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.chip, styles.chipActive]}
                    onPress={() => _removeTag(tag)}
                  >
                    <Text style={styles.chipActiveText}>#{tag}</Text>
                    <Icon
                      iconType="MaterialIcons"
                      name="close"
                      size={15}
                      style={styles.chipActiveIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {trendingTags.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                {intl.formatMessage({ id: 'waves.trending_tags' })}
              </Text>
              <View style={styles.chipWrap}>
                {trendingTags.map((tag) => (
                  <TouchableOpacity key={tag} style={styles.chip} onPress={() => _addTag(tag)}>
                    <Text style={styles.chipText}>#{tag}</Text>
                    <Icon
                      iconType="MaterialIcons"
                      name="add"
                      size={15}
                      style={styles.chipAddIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ActionSheet>
  );
};

export default forwardRef(WavesTagPickerModal);
