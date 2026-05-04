import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Platform, TextInput as RNTextInput } from 'react-native';
// Constants

// Components
import { ScrollView } from 'react-native-gesture-handler';
import { TextInput } from '../../../textInput';

// Styles
import styles from './tagInputStyles';
import globalStyles from '../../../../globalStyles';

import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { Tag } from '../../../basicUIElements';
import { isCommunity } from '../../../../utils/communityValidation';
import { toastNotification } from '../../../../redux/actions/uiAction';
import { selectIsDarkTheme } from '../../../../redux/selectors';

const SEPARATOR_REGEX = /[,\s]/;

const TagInput = ({ value, handleTagChanged, intl, isPreviewActive, autoFocus, setCommunity }) => {
  const dispatch = useAppDispatch();
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const scrollRef = useRef<ScrollView>();
  const inputRef = useRef<RNTextInput>(null);
  const textRef = useRef('');
  const tagsRef = useRef<string[]>([]);

  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [warning, setWarning] = useState(null);

  // Keep tagsRef in sync with tags state
  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  useEffect(() => {
    // read and add tag items
    const _tags = (typeof value === 'string' ? value.split(' ') : value).filter((t) => !!t);
    tagsRef.current = _tags;
    setTags(_tags);
    _verifyTagsUpdate(_tags);
  }, [value]);

  const _verifyTagsUpdate = (nextTags: string[]) => {
    if (nextTags.length > 0) {
      nextTags.length > 10
        ? setWarning(intl.formatMessage({ id: 'editor.limited_tags' }))
        : nextTags.find((c) => c.length > 24)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_length' }))
        : nextTags.find((c) => c.split('-').length > 2)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_dash' }))
        : nextTags.find((c) => c.indexOf(',') >= 0)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_space' }))
        : nextTags.find((c) => /[A-Z]/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_lowercase' }))
        : nextTags.find((c) => !/^[a-z0-9-#]+$/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_characters' }))
        : nextTags.find((c) => !/[a-z0-9]$/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_lastchar' }))
        : setWarning(null);
    }
  };

  const _setInputText = useCallback((nextText: string) => {
    textRef.current = nextText;
    setText(nextText);
  }, []);

  const _registerNewTags = useCallback(
    (newTags: string[], skipLast = true) => {
      const inputVal = newTags.length > 0 && skipLast ? newTags[newTags.length - 1] : '';
      const tagsToProcess = skipLast ? newTags.slice(0, -1) : newTags;
      const updatedTags = [...tagsRef.current];

      tagsToProcess.forEach((rawTag) => {
        const tag = rawTag.startsWith('#') ? rawTag.substring(1) : rawTag;

        if (!tag.length) {
          return;
        }

        if (!updatedTags.includes(tag)) {
          // check if tag is community and post communtiy is not already selected
          if (isCommunity(tag) && !isCommunity(updatedTags[0])) {
            // add community tag
            updatedTags.splice(0, 0, tag);
            setCommunity(tag);
            dispatch(toastNotification(intl.formatMessage({ id: 'editor.community_selected' })));
          } else {
            // add simple tag
            updatedTags.push(tag);
          }
        } else {
          dispatch(toastNotification(intl.formatMessage({ id: 'editor.tag_duplicate' })));
        }
      });

      tagsRef.current = updatedTags;
      setTags(updatedTags);
      const newText = inputVal || '';
      // Replace the field with the remaining unfinished tag fragment. Always write it:
      // on Android/iOS a stale native event can otherwise leave the tokenized tag visible.
      _setInputText(newText);
      _verifyTagsUpdate(updatedTags);
      if (handleTagChanged) {
        handleTagChanged(updatedTags);
      }
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollToEnd();
        }
      }, 100);
    },
    [dispatch, intl, setCommunity, handleTagChanged, _setInputText],
  );

  const _handleOnChange = (val: string) => {
    // val is already lowercased by the caller wrapper at the TextInput callsite.
    if (SEPARATOR_REGEX.test(val)) {
      _registerNewTags(val.split(SEPARATOR_REGEX));
      return;
    }
    textRef.current = val;
    setText(val);
  };

  const _handleOnChangeRaw = (raw: string) => {
    const lower = raw.toLowerCase();
    if (lower !== raw) {
      // Filter to lowercase by re-feeding sanitized text to the field.
      _setInputText(lower);
    }
    _handleOnChange(lower);
  };

  const _handleOnEnd = () => {
    if (textRef.current.length > 1) {
      _registerNewTags(textRef.current.split(SEPARATOR_REGEX), false);
    }
  };

  const _renderTag = (tag, index) => {
    const _onPress = () => {
      const updatedTags = [...tags];
      updatedTags.splice(index, 1);
      tagsRef.current = updatedTags;
      setTags(updatedTags);
      _verifyTagsUpdate(updatedTags);
      if (handleTagChanged) {
        handleTagChanged(updatedTags);
      }
    };

    return (
      <Tag
        key={tag}
        value={tag}
        style={styles.tagContainer}
        textStyle={styles.tagText}
        removeEnabled={true}
        isFilter={true}
        onPress={_onPress}
      />
    );
  };

  return (
    <View style={[globalStyles.containerHorizontal16, styles.container]}>
      <ScrollView
        ref={scrollRef}
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center' }}
        horizontal
      >
        {tags.map(_renderTag)}
        <TextInput
          key="tag-input"
          innerRef={inputRef}
          style={styles.textInput}
          placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
          editable={!isPreviewActive}
          maxLength={100}
          placeholder={intl.formatMessage({
            id: 'editor.tags',
          })}
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          autoCapitalize="none"
          keyboardType={Platform.select({
            ios: 'ascii-capable',
            android: 'visible-password',
          })}
          onChangeText={_handleOnChangeRaw}
          onEndEditing={_handleOnEnd}
          value={text}
        />
      </ScrollView>

      {warning && <Text style={styles.warning}>{warning}</Text>}
    </View>
  );
};

export default TagInput;
