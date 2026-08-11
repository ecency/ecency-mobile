import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { postBodySummary } from '@ecency/render-helper';
import { CheckBox, DropdownButton, Icon, ModalHeader } from '..';
import { translateMarkdown } from '../../providers/translation/translateMarkdown';
import { useAppSelector } from '../../hooks';
import { selectLanguage } from '../../redux/selectors';
import {
  francToIso1,
  isRtlLang,
  languageDisplayName,
  LIBRETRANSLATE_CODES,
  LIBRETRANSLATE_SOURCES,
  LIBRETRANSLATE_TARGETS,
  normLang,
} from '../../utils/iso639';
import { SheetNames } from '../../navigation/sheets';
import styles from './composeTranslateModal.styles';

// Same sampling bounds as the reader-side language gate: a few hundred clean
// chars are plenty for franc, and rendering a whole long draft would be waste.
const SAMPLE_CHARS = 600;
const RAW_SAMPLE_CHARS = 2000;
// Below this much plain text detection is unreliable and translating is moot.
const MIN_TRANSLATE_CHARS = 30;
const TITLE_MAX_CHARS = 255;

/**
 * Compose-side translate sheet: detects the language of the author's own draft,
 * lets them pick a target, machine-translates the markdown structure-aware and
 * previews the result. Apply hands the caller an appendix (`---` + heading +
 * translation) and an optional title marker; nothing is published here.
 */
export const ComposeTranslateModal = ({ payload }: SheetProps<SheetNames.COMPOSE_TRANSLATE>) => {
  const intl = useIntl();
  const appLang = useAppSelector(selectLanguage);

  const body = payload?.body ?? '';
  const title = payload?.title ?? '';

  const [source, setSource] = useState('en');
  const [target, setTarget] = useState('es');
  const [detected, setDetected] = useState('');
  const [addTitleMarker, setAddTitleMarker] = useState(true);
  const [translated, setTranslated] = useState('');
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [failed, setFailed] = useState(false);

  // Cancels the in-flight translation chain once the sheet is gone, so it stops paging the
  // translation service in the background. The chain outlives the component either way, so this
  // is set from both onClose and unmount rather than trusting onClose to be the only exit.
  const closedRef = useRef(false);

  const sample = useMemo(
    () =>
      body
        ? postBodySummary(body.slice(0, RAW_SAMPLE_CHARS), 0, Platform.OS as any).slice(
            0,
            SAMPLE_CHARS,
          )
        : '',
    [body],
  );
  const tooShort = sample.trim().length < MIN_TRANSLATE_CHARS;

  // Sheets unmount on hide, so the chain has to be cancelled here as well: onClose is not
  // guaranteed to be the route the sheet leaves by, and a chain left running keeps paging the
  // translation service for a screen the user has already dismissed.
  useEffect(
    () => () => {
      closedRef.current = true;
    },
    [],
  );

  // Sheets mount on show, so this resets state and re-detects the source language on every open.
  useEffect(() => {
    closedRef.current = false;
    setTranslated('');
    setFailed(false);
    setTranslating(false);
    setProgress([0, 0]);
    setAddTitleMarker(true);
    setDetected('');
    let lang = 'en';
    if (sample.trim().length >= MIN_TRANSLATE_CHARS) {
      try {
        // franc-min@5 is CommonJS; its default export is the detector function.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const franc = require('franc-min');
        const guess = francToIso1(franc(sample));
        if (guess && LIBRETRANSLATE_SOURCES.has(guess)) {
          lang = guess;
          setDetected(guess);
        }
      } catch {
        // Detector unavailable — keep the default, the user can pick manually.
      }
    }
    setSource(lang);
  }, [payload, sample]);

  // Non-English drafts almost always want English; English drafts target the
  // app language when supported, otherwise Spanish.
  useEffect(() => {
    if (source !== 'en') {
      setTarget('en');
      return;
    }
    const reader = normLang(appLang);
    setTarget(reader && reader !== 'en' && LIBRETRANSLATE_TARGETS.has(reader) ? reader : 'es');
  }, [source, appLang]);

  // A result translated into a previous language pair must never be applied.
  useEffect(() => {
    setTranslated('');
    setFailed(false);
  }, [source, target]);

  const sourceOptions = useMemo(
    () => LIBRETRANSLATE_CODES.map((code) => languageDisplayName(code)),
    [],
  );
  const targetCodes = useMemo(
    () => LIBRETRANSLATE_CODES.filter((code) => code !== source),
    [source],
  );
  const targetOptions = useMemo(
    () => targetCodes.map((code) => languageDisplayName(code)),
    [targetCodes],
  );

  const _translate = async () => {
    setTranslating(true);
    setFailed(false);
    setTranslated('');
    setProgress([0, 0]);
    try {
      const result = await translateMarkdown(
        body,
        source,
        target,
        (done, total) => setProgress([done, total]),
        () => closedRef.current,
      );
      setTranslated(result);
    } catch (error) {
      console.log('translate error : ', error);
      if (!closedRef.current) {
        setFailed(true);
      }
    } finally {
      if (!closedRef.current) {
        setTranslating(false);
      }
    }
  };

  const _apply = () => {
    if (!translated) {
      return;
    }
    const appendix = `\n\n---\n\n## ${languageDisplayName(target, target)}\n\n${translated}`;
    let titleMarker: string | undefined;
    if (addTitleMarker && title.trim()) {
      const marker = ` [${source.toUpperCase()} | ${target.toUpperCase()}]`;
      if (title.length + marker.length <= TITLE_MAX_CHARS) {
        titleMarker = marker;
      }
    }
    SheetManager.hide(SheetNames.COMPOSE_TRANSLATE);
    payload?.onApply(appendix, titleMarker);
  };

  const _handleOnSheetClose = () => {
    closedRef.current = true;
    setTranslating(false);
  };

  const _renderLanguageSelector = () => (
    <>
      <View style={styles.labelsRow}>
        <Text style={styles.dropdownLabel}>
          {intl.formatMessage({ id: 'compose_translate.source' })}
        </Text>
        <Text style={styles.dropdownLabel}>
          {intl.formatMessage({ id: 'compose_translate.target' })}
        </Text>
      </View>
      <View style={styles.languageSelectorRow}>
        <View style={styles.row}>
          <DropdownButton
            defaultText={languageDisplayName(source)}
            isHasChildIcon
            noHighlight
            onSelect={(index: any) => setSource(LIBRETRANSLATE_CODES[index])}
            options={sourceOptions}
            textStyle={styles.dropdownRowTextStyle}
            disableFrameAdjustment={true}
          />
        </View>

        <Icon iconType="MaterialIcons" name="translate" style={styles.convertIcon} size={24} />
        <Icon iconType="MaterialIcons" name="arrow-forward" style={styles.convertIcon} size={16} />

        <View style={styles.row}>
          <DropdownButton
            defaultText={languageDisplayName(target)}
            isHasChildIcon
            noHighlight
            onSelect={(index: any) => setTarget(targetCodes[index])}
            options={targetOptions}
            textStyle={styles.dropdownRowTextStyle}
            disableFrameAdjustment={true}
          />
        </View>
      </View>
    </>
  );

  const _renderForm = () => (
    <>
      <Text style={styles.hintText}>
        {intl.formatMessage({ id: 'compose_translate.review_note' })}
      </Text>

      {_renderLanguageSelector()}

      {!!detected && (
        <Text style={styles.detectedText}>
          {intl.formatMessage(
            { id: 'compose_translate.detected' },
            { lang: languageDisplayName(detected) },
          )}
        </Text>
      )}

      {!!title.trim() && (
        <View style={styles.checkboxRow}>
          <CheckBox
            isChecked={addTitleMarker}
            clicked={(_val, checked) => setAddTitleMarker(checked)}
            value="title_marker"
          />
          <Text style={styles.checkboxLabel} onPress={() => setAddTitleMarker(!addTitleMarker)}>
            {intl.formatMessage({ id: 'compose_translate.add_title_marker' })}
          </Text>
        </View>
      )}

      {translating && (
        <View style={styles.progressRow}>
          <ActivityIndicator />
          {progress[1] > 0 && (
            <Text style={styles.progressText}>
              {intl.formatMessage(
                { id: 'compose_translate.progress' },
                { done: progress[0], total: progress[1] },
              )}
            </Text>
          )}
        </View>
      )}

      {failed && (
        <Text style={styles.errorText}>
          {intl.formatMessage({ id: 'compose_translate.error' })}
        </Text>
      )}

      {!!translated && !translating && (
        <ScrollView style={styles.previewBox} nestedScrollEnabled>
          <Text style={[styles.previewText, isRtlLang(target) && styles.previewTextRtl]}>
            {translated}
          </Text>
        </ScrollView>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.actionButton, translating && styles.actionButtonDisabled]}
          onPress={_translate}
          disabled={translating}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            {intl.formatMessage({ id: 'compose_translate.translate' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, (!translated || translating) && styles.actionButtonDisabled]}
          onPress={_apply}
          disabled={!translated || translating}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>
            {intl.formatMessage({ id: 'compose_translate.apply' })}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <ActionSheet
      id={SheetNames.COMPOSE_TRANSLATE}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
      onClose={_handleOnSheetClose}
    >
      <ModalHeader title={intl.formatMessage({ id: 'compose_translate.title' })} />
      <View style={styles.contentContainer}>
        {tooShort ? (
          <Text style={styles.hintText}>
            {intl.formatMessage({ id: 'compose_translate.too_short' })}
          </Text>
        ) : (
          _renderForm()
        )}
      </View>
    </ActionSheet>
  );
};
