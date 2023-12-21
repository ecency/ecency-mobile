import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet, { useScrollHandlers } from 'react-native-actions-sheet';
import { postBodySummary } from '@ecency/render-helper';
import SelectDropdown from 'react-native-select-dropdown';
import { getTranslation, fetchSupportedLangs } from '../../providers/translation/translation';
import styles from './postTranslationModalStyle';

const srcLang = { name: 'Auto', code: 'auto' };
const targetLang = { name: 'English', code: 'en' };

const PostTranslationModal = (props, ref) => {
  const intl = useIntl();
  const bottomSheetModalRef = useRef<ActionSheet | null>(null);
  const scrollHandlers = useScrollHandlers<FlatList>('scrollview-1', bottomSheetModalRef);
  const [content, setContent] = useState<any>(null);
  const [translatedPost, setTranslatedPost] = useState('');
  // const [supportedLangs, setSupportedLangs] = useState([]);
  const [supportedLangsList, setSupportedLangsList] = useState([]);
  const [selectedSourceLang, setSelectedSourceLang] = useState(srcLang);
  const [selectedTargetLang, setSelectedTargetLang] = useState(targetLang);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [isLoadingLangsList, setisLoadingLangsList] = useState(false);

  useImperativeHandle(ref, () => ({
    show: (_content) => {
      if (!_content) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.something_wrong' }),
          'Post content not passed for viewing post options',
        );
        return;
      }

      if (bottomSheetModalRef.current) {
        setContent(_content);
        bottomSheetModalRef.current.show();
        getSupportedLanguages();
      }
    },
  }));

  useEffect(() => {
    if (content && content.body) {
      const body = postBodySummary(content.body, null, Platform.OS);
      translateText(body);
    }
  }, [content, selectedSourceLang, selectedTargetLang]);

  const translateText = async (text: string) => {
    try {
      setIsLoadingTranslation(true);
      const res = await getTranslation(
        text,
        selectedSourceLang.code || srcLang.code,
        selectedTargetLang.code || targetLang.code,
      );
      if (res && res.translatedText) {
        setTranslatedPost(res.translatedText);
      }

      setIsLoadingTranslation(false);
    } catch (error) {
      setIsLoadingTranslation(false);
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
        setSupportedLangsList([srcLang, ...langs] as any);
      }
      setisLoadingLangsList(false);
    } catch (error) {
      setisLoadingLangsList(false);
      console.log('error : ', error);
    }
  };

  const _handleOnSheetClose = () => {
    setContent('');
    setTranslatedPost('');
    setSelectedSourceLang(srcLang);
    setSelectedTargetLang(targetLang);
  };

  const _renderLanguageSelector = () => (
    <View style={styles.languageSelectorRow}>
      <View style={styles.row}>
        <Text style={styles.labelText}>From</Text>
        <SelectDropdown
          data={supportedLangsList}
          onSelect={(selectedItem) => {
            setSelectedSourceLang(selectedItem);
          }}
          buttonTextAfterSelection={(selectedItem) => {
            return selectedItem?.name || '';
          }}
          rowTextForSelection={(item) => {
            return item.name || '';
          }}
          dropdownStyle={styles.languageDropdownStyle}
          defaultValue={srcLang}
          buttonStyle={styles.dropdownBtnStyle}
          buttonTextStyle={styles.dropdownBtnTextStyle}
          rowTextStyle={styles.dropdownRowTextStyle}
          selectedRowStyle={styles.dropdownSelectedRowStyle}
          selectedRowTextStyle={styles.dropdownSelectedRowTextStyle}
          dropdownFlatlistProps={scrollHandlers}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.labelText, styles.toText]}>To</Text>
        <SelectDropdown
          data={supportedLangsList.filter(
            (item) => item.code !== srcLang.code || item.code !== selectedSourceLang.code,
          )}
          onSelect={(selectedItem) => {
            setSelectedTargetLang(selectedItem);
          }}
          buttonTextAfterSelection={(selectedItem) => {
            return selectedItem?.name || '';
          }}
          rowTextForSelection={(item) => {
            return item.name || '';
          }}
          dropdownStyle={styles.languageDropdownStyle}
          defaultValue={targetLang}
          buttonStyle={styles.dropdownBtnStyle}
          buttonTextStyle={styles.dropdownBtnTextStyle}
          rowTextStyle={styles.dropdownRowTextStyle}
          selectedRowStyle={styles.dropdownSelectedRowStyle}
          selectedRowTextStyle={styles.dropdownSelectedRowTextStyle}
          dropdownFlatlistProps={scrollHandlers}
        />
      </View>
    </View>
  );

  return (
    <ActionSheet
      ref={bottomSheetModalRef}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
      onClose={_handleOnSheetClose}
    >
      <View style={styles.listContainer}>
        {!isLoadingLangsList && supportedLangsList && supportedLangsList.length
          ? _renderLanguageSelector()
          : null}
        <View style={styles.translatedTextContainer}>
          {isLoadingTranslation ? (
            <ActivityIndicator
              style={{ paddingHorizontal: 24, paddingBottom: 8 }}
              size="small"
              color={EStyleSheet.value('$iconColor')}
            />
          ) : (
            <Text style={styles.translatedText}>{translatedPost}</Text>
          )}
        </View>
      </View>
    </ActionSheet>
  );
};

export default forwardRef(PostTranslationModal);
