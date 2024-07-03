import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet, { useScrollHandlers } from 'react-native-actions-sheet';
import { postBodySummary } from '@ecency/render-helper';
import SelectDropdown from 'react-native-select-dropdown';
import { useDispatch } from 'react-redux';
import { getTranslation, fetchSupportedLangs } from '../../providers/translation/translation';
import styles from './postTranslationModalStyle';
import { useAppSelector } from '../../hooks';
import { hideTranslationModal } from '../../redux/actions/uiAction';

const srcLang = { name: 'Auto', code: 'auto' };
const targetLang = { name: 'English', code: 'en' };

const PostTranslationModal = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const bottomSheetModalRef = useRef<ActionSheet | null>(null);
  const scrollHandlers = useScrollHandlers<FlatList>('scrollview-1', bottomSheetModalRef);
  const appLang = useAppSelector((state) => state.application.language);
  const translationModalVisible = useAppSelector((state) => state.ui.translationModalVisible);
  const translationModalData = useAppSelector((state) => state.ui.translationModalData);

  const [content, setContent] = useState<any>(null);
  const [translatedPost, setTranslatedPost] = useState('');
  // const [supportedLangs, setSupportedLangs] = useState([]);
  const [supportedLangsList, setSupportedLangsList] = useState([]);
  const [selectedSourceLang, setSelectedSourceLang] = useState(srcLang);
  const [selectedTargetLang, setSelectedTargetLang] = useState(null);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [isLoadingLangsList, setisLoadingLangsList] = useState(false);
  const [translationError, setTranslationError] = useState('');

  useEffect(() => {
    if (translationModalVisible) {
      if (bottomSheetModalRef.current) {
        if (!translationModalData) {
          Alert.alert(
            intl.formatMessage({ id: 'alert.something_wrong' }),
            'Post content not passed for viewing post options',
          );
          return;
        }
        setContent(translationModalData);
        bottomSheetModalRef.current.show();
        getSupportedLanguages();
      }
    } else {
      _handleOnSheetClose();
    }
  }, [translationModalVisible]);

  useEffect(() => {
    if (content && content.body) {
      const body = postBodySummary(content.body, null, Platform.OS);
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
    setContent('');
    setTranslatedPost('');
    setTranslationError('');
    setSelectedSourceLang(srcLang);
    setSelectedTargetLang(targetLang);
    dispatch(hideTranslationModal());
    bottomSheetModalRef.current.hide();
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
        <Text style={styles.labelText}>{intl.formatMessage({ id: 'wallet.from' })}</Text>
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
        <Text style={[styles.labelText, styles.toText]}>
          {intl.formatMessage({ id: 'wallet.to' })}
        </Text>
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
          defaultValue={selectedTargetLang}
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
            <Text style={styles.translatedText}>{translationError || translatedPost}</Text>
          )}
        </View>
      </View>
    </ActionSheet>
  );
};

export default PostTranslationModal;
