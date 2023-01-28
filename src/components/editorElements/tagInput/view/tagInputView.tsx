import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import { debounce } from 'lodash';
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

const SEPARATOR_REGEX = /[,\s]/;

const TagInput = ({ value, handleTagChanged, intl, isPreviewActive, autoFocus, setCommunity }) => {
  const dispatch = useAppDispatch();
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

  const scrollRef = useRef<ScrollView>();

  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    // read and add tag items
    const _tags = typeof value === 'string' ? value.split(' ') : value;
    setTags(_tags.filter((t) => !!t));
  }, [value]);

  const _verifyTagsUpdate = (tags: string[]) => {
    if (tags.length > 0) {
      tags.length > 10
        ? setWarning(intl.formatMessage({ id: 'editor.limited_tags' }))
        : tags.find((c) => c.length > 24)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_length' }))
        : tags.find((c) => c.split('-').length > 2)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_dash' }))
        : tags.find((c) => c.indexOf(',') >= 0)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_space' }))
        : tags.find((c) => /[A-Z]/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_lowercase' }))
        : tags.find((c) => !/^[a-z0-9-#]+$/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_characters' }))
        : tags.find((c) => !/[a-z0-9]$/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_lastchar' }))
        : setWarning(null);
    }
  };

  const _registerNewTags = useCallback(
    debounce((newTags: string[], skipLast = true) => {
      const inputVal = newTags.length > 0 && skipLast && newTags.pop();

      newTags.forEach((tag) => {
        if (tag.startsWith('#')) {
          tag = tag.substring(1);
        }

        if (!tag.length) {
          return;
        }

        if (!tags.includes(tag)) {
          // check if tag is community and post communtiy is not already selected
          if (isCommunity(tag) && !isCommunity(tags[0])) {
            // add community tag
            tags.splice(0, 0, tag);
            setCommunity(tag);
            dispatch(toastNotification(intl.formatMessage({ id: 'editor.community_selected' })));
          } else {
            // add simple tag
            tags.push(tag);
          }
        } else {
          dispatch(toastNotification(intl.formatMessage({ id: 'editor.tag_duplicate' })));
        }
      });

      setTags([...tags]);
      setText(inputVal || '');
      _verifyTagsUpdate(tags);
      if (handleTagChanged) {
        handleTagChanged([...tags]);
      }
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollToEnd();
        }
      }, 100);
    }, 500),
    [tags],
  );

  const _handleOnChange = (val: string) => {
    setText(val);
    _registerNewTags(val.split(SEPARATOR_REGEX));
  };

  const _handleOnEnd = () => {
    if (text.length > 1) {
      _registerNewTags(text.split(SEPARATOR_REGEX), false);
    }
  };

  const _renderTag = (tag, index) => {
    const _onPress = () => {
      tags.splice(index, 1);
      setTags([...tags]);
      _verifyTagsUpdate(tags);
      if (handleTagChanged) {
        handleTagChanged([...tags]);
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

  console.log('text : ', text, '\nvalue : ', value);
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
          style={styles.textInput}
          placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
          editable={!isPreviewActive}
          maxLength={100}
          placeholder={intl.formatMessage({
            id: 'editor.tags',
          })}
          autoCompleteType="off"
          autoCorrect={false}
          autoFocus={autoFocus}
          autoCapitalize="none"
          keyboardType={Platform.select({
            ios: 'ascii-capable',
            android: 'visible-password',
          })}
          onChangeText={(val) => _handleOnChange(val.toLowerCase())}
          onEndEditing={_handleOnEnd}
          value={text}
        />
      </ScrollView>

      {warning && <Text style={styles.warning}>{warning}</Text>}
    </View>
  );
};

export default TagInput;
