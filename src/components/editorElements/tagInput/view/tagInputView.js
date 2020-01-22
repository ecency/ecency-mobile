import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
// Constants

// Components
import { TextInput } from '../../../textInput';

// Styles
import styles from './tagInputStyles';
import globalStyles from '../../../../globalStyles';
import { ThemeContainer } from '../../../../containers';

const TagInput = ({
  value,
  onChange,
  componentID,
  handleTagChanged,
  intl,
  isPreviewActive,
  autoFocus,
}) => {
  const [text, setText] = useState('');
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    if (typeof value === 'string') {
      setText(value);
    } else {
      setText(value.join(' '));
    }
  }, [value]);

  // Component Functions
  const _handleOnChange = _text => {
    setText(_text.replace(/,/g, ' ').replace(/#/g, ''));

    let cats = _text.split(' ');
    if (handleTagChanged && cats.length > 0) {
      cats.length > 10
        ? setWarning(intl.formatMessage({ id: 'editor.limited_tags' }))
        : cats.find(c => c.length > 24)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_length' }))
        : cats.find(c => c.split('-').length > 2)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_dash' }))
        : cats.find(c => c.indexOf(',') >= 0)
        ? setWarning(intl.formatMessage({ id: 'editor.limited_space' }))
        : cats.find(c => /[A-Z]/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_lowercase' }))
        : cats.find(c => !/^[a-z0-9-#]+$/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_characters' }))
        : cats.find(c => !/^[a-z-#]/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_firstchar' }))
        : cats.find(c => !/[a-z0-9]$/.test(c))
        ? setWarning(intl.formatMessage({ id: 'editor.limited_lastchar' }))
        : setWarning(null);

      handleTagChanged([...cats]);
    }
  };
  const _handleOnBlur = () => {
    let cats = [];
    if (onChange) {
      cats = text.trim().split(' ');
      if (handleTagChanged && cats.length > 0) {
        cats.length > 10
          ? setWarning(intl.formatMessage({ id: 'editor.limited_tags' }))
          : cats.find(c => c.length > 24)
          ? setWarning(intl.formatMessage({ id: 'editor.limited_length' }))
          : cats.find(c => c.split('-').length > 2)
          ? setWarning(intl.formatMessage({ id: 'editor.limited_dash' }))
          : cats.find(c => c.indexOf(',') >= 0)
          ? setWarning(intl.formatMessage({ id: 'editor.limited_space' }))
          : cats.find(c => /[A-Z]/.test(c))
          ? setWarning(intl.formatMessage({ id: 'editor.limited_lowercase' }))
          : cats.find(c => !/^[a-z0-9-#]+$/.test(c))
          ? setWarning(intl.formatMessage({ id: 'editor.limited_characters' }))
          : cats.find(c => !/^[a-z-#]/.test(c))
          ? setWarning(intl.formatMessage({ id: 'editor.limited_firstchar' }))
          : cats.find(c => !/[a-z0-9]$/.test(c))
          ? setWarning(intl.formatMessage({ id: 'editor.limited_lastchar' }))
          : setWarning(null);
        handleTagChanged([...cats]);
      }
      onChange(text);
    }
  };
  return (
    <View style={[globalStyles.containerHorizontal16, styles.container]}>
      <ThemeContainer>
        {({ isDarkTheme }) => (
          <TextInput
            style={styles.textInput}
            placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
            editable={!isPreviewActive}
            maxLength={100}
            placeholder={intl.formatMessage({
              id: 'editor.tags',
            })}
            multiline
            autoFocus={autoFocus}
            onChangeText={textT => _handleOnChange(textT)}
            onBlur={() => _handleOnBlur()}
            value={text}
          />
        )}
      </ThemeContainer>
      {warning && <Text style={styles.warning}>{warning}</Text>}
    </View>
  );
};

export default TagInput;
