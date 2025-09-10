import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import { postBodySummary } from '@ecency/render-helper';
import { getTranslation, fetchSupportedLangs } from '../../providers/translation/translation';
import styles from './postTranslationModalStyle';
import { useAppSelector } from '../../hooks';
import { DropdownButton, Icon, ModalHeader } from '../../components';

interface Language {
  name: string,
  code: string,
}

const srcLang = { name: 'Auto', code: 'auto' };
const targetLang = { name: 'English', code: 'en' };

const PostTranslationModal = ({ payload }: SheetProps<'post_translation'>) => {
  const intl = useIntl();
  const content = payload?.content;

  const appLang = useAppSelector((state) => state.application.language);

  const [translatedPost, setTranslatedPost] = useState('');
  const [originalText, setOriginalText] = useState('')
  const [supportedLangsList, setSupportedLangsList] = useState<Language[]>([]);
  const [selectedSourceLang, setSelectedSourceLang] = useState<Language>(srcLang);
  const [selectedTargetLang, setSelectedTargetLang] = useState<Language | null>(null);

  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [isLoadingLangsList, setisLoadingLangsList] = useState(false);
  const [translationError, setTranslationError] = useState('');

  const _dropdownOptions = useMemo(() => supportedLangsList.map(lang => lang.name), [supportedLangsList]);


  useEffect(() => {
    getSupportedLanguages();
  }, []);

  useEffect(() => {
    if (content && content.body) {
      const body = postBodySummary(content.body, null, Platform.OS);
      setOriginalText(body)
      translateText(body);
    }
  }, [content, selectedSourceLang, selectedTargetLang]);


  const translateText = async (text: string) => {
    try {
      if (selectedTargetLang) {
        setIsLoadingTranslation(true);
        setTranslationError('');
        const res = await getTranslation(
          text,
          selectedSourceLang.code || srcLang.code,
          selectedTargetLang.code || targetLang.code,
        );
        if (res && res.translatedText) {
          setTranslatedPost(res.translatedText);
        }

        setIsLoadingTranslation(false);
      }
    } catch (error) {
      setIsLoadingTranslation(false);
      setTranslationError(
        error?.message ||
        intl.formatMessage({
          id: 'alert.error',
        }),
      );
      console.log('error : ', error);
    }
  };

  const getSupportedLanguages = async () => {
    try {
      setisLoadingLangsList(true);
      const res = await fetchSupportedLangs();
      if (res && res.length) {
        // setSupportedLangs(res);
        const langs = res.map((item) => {
          return {
            code: item.code,
            name: item.name,
          };
        });
        _checkApplang([srcLang, ...langs]); // check app lang from list of available langs and update target lang according to app lang
        setSupportedLangsList([srcLang, ...langs] as any);
      }
      setisLoadingLangsList(false);
    } catch (error) {
      setisLoadingLangsList(false);
      console.log('error : ', error);
    }
  };

  const _handleOnSheetClose = () => {
    setTranslatedPost('');
    setTranslationError('');
    setSelectedSourceLang(srcLang);
    setSelectedTargetLang(targetLang);
  };

  const _checkApplang = (langsList: any[]) => {
    const appLangCode = appLang.split('-');
    if (appLangCode.length && langsList.length && appLangCode[0]) {
      const selectedAppLang = langsList.find((item) => item?.code === appLangCode[0]);
      if (selectedAppLang) {
        setSelectedTargetLang(selectedAppLang);
      } else {
        setSelectedTargetLang(targetLang);
      }
    }
  };

  const _renderLanguageSelector = () => (
    <View style={styles.languageSelectorRow}>
      <View style={styles.row}>
        <DropdownButton
          style={styles.dropdownStyle}
          defaultText={selectedSourceLang.name}
          iconStyle={styles.dropdownIconStyle}
          isHasChildIcon
          noHighlight
          onSelect={(index) => setSelectedSourceLang(supportedLangsList[index])}
          options={_dropdownOptions}
          textStyle={styles.dropdownRowTextStyle}
          disableFrameAdjustment={true}
        />
      </View>

      <Icon iconType="MaterialIcons" name="translate" style={styles.convertIcon} size={24} />
      <Icon iconType="MaterialIcons" name="arrow-forward" style={styles.convertIcon} size={16} />

      <View style={styles.row}>
        {
          isLoadingLangsList ? <ActivityIndicator /> : (
            <DropdownButton
              style={styles.dropdownStyle}
              defaultText={selectedTargetLang?.name}
              iconStyle={styles.dropdownIconStyle}
              isHasChildIcon
              noHighlight
              onSelect={(index) => setSelectedTargetLang(supportedLangsList[index])}
              options={_dropdownOptions}
              textStyle={styles.dropdownRowTextStyle}
              disableFrameAdjustment={true}
            />
          )
        }

      </View>
    </View>
  );

  return (
    <ActionSheet
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
      onClose={_handleOnSheetClose}
    >
      <ModalHeader title={intl.formatMessage({ id: 'post_dropdown.translate' })} />

      <View style={styles.listContainer}>
        {_renderLanguageSelector()}

        <View style={styles.textContainer}>
          <Text style={styles.translatedText}>{originalText}</Text>
        </View>

        <View style={styles.textContainer}>
          {isLoadingTranslation ? (
            <ActivityIndicator
              style={{ paddingHorizontal: 24, paddingBottom: 8 }}
              size="small"
              color={EStyleSheet.value('$iconColor')}
            />
          ) : (
            <Text style={styles.translatedText}>{translationError || translatedPost}</Text>
          )}
        </View>
      </View>
    </ActionSheet>
  );
};

export default PostTranslationModal;
