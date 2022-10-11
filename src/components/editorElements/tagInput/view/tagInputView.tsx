import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Platform } from 'react-native';
// Constants

// Components
import { TextInput } from '../../../textInput';

// Styles
import styles from './tagInputStyles';
import globalStyles from '../../../../globalStyles';

import { ScrollView } from 'react-native-gesture-handler';
import { useAppSelector } from '../../../../hooks';
import { Tag } from '../../../basicUIElements';
import { isCommunity } from '../../../../utils/communityValidation';

const TagInput = ({ value, handleTagChanged, intl, isPreviewActive, autoFocus, setCommunity }) => {
  const isDarkTheme = useAppSelector(state => state.application.isDarkTheme);

  const scrollRef = useRef<ScrollView>()

  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [warning, setWarning] = useState(null);


  useEffect(() => {
    //read and add tag items
    if (typeof value === 'string') {
      setTags(value.split(' '))
    } else {
      setTags(value);
    }
  }, [value]);




  // Component Functions
  // const _handleOnChange = (_text) => {

  //   if (cats.length > 0) {
  //     if (isCommunity(cats[0])) {
  //       setCommunity(cats[0]);
  //     }
  //   }
  // };


  const _verifyTagsUpdate = (tags:string[]) => {
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
  }

  const _registerTag = (tag) => {
    if(!tags.includes(tag)){
      tags.push(tag);
    }

    
    setTags([...tags])
    setText('');
    if(handleTagChanged){
      handleTagChanged([...tags]);
    }
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollToEnd()
      }
    }, 100)
  }


  const _handleOnChange = (text: string) => {
    const lstChr = text.length > 1 && text[text.length - 1];
    if (lstChr === ' ' || lstChr === ',') {
      const tag = text.substring(0, text.length - 1);
      _registerTag(tag)
    } else {
      setText(text)
    }
  }



  const _handleOnEnd = () => {
    if (text.length > 1) {
      text.trim();
      _registerTag(text)
    }
  }


  const _renderTag = (tag, index) => {

    const _onPress = () => {
      tags.splice(index, 1);
      setTags([...tags])
      _verifyTagsUpdate(tags)
      if(handleTagChanged){
        handleTagChanged([...tags]);
      }
    }

    return (
      <Tag
        key={tag}
        value={tag}
        style={styles.tagContainer}
        textStyle={styles.tagText}
        removeEnabled={true}
        onPress={_onPress}
      />
    )
  }


  console.log('text : ', text, '\nvalue : ', value);
  return (
    <View style={[globalStyles.containerHorizontal16, styles.container]}>
      <ScrollView ref={scrollRef} style={{ width: "100%" }} contentContainerStyle={{ alignItems: 'center' }} horizontal>
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
