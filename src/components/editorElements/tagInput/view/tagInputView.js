import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
// Constants

// Components
import { TextInput } from '../../../textInput';

// Styles
import styles from './tagInputStyles';
import globalStyles from '../../../../globalStyles';

const TagInput = ({
  value,
  onChange,
  handleIsValid,
  componentID,
  handleTagChanged,
  intl,
  isPreviewActive,
  autoFocus,
}) => {
  const [text, setText] = useState('');
  const [height, setHeight] = useState(0);

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
  };
  const _handleOnBlur = () => {
    if (onChange) {
      let cats = text.trim().split(' ');
      if (handleTagChanged && cats.length > 0) {
        cats.length > 10
          ? Alert.alert(
              intl.formatMessage({ id: 'alert.error' }),
              'Only 10 tags allowed, remove some',
            )
          : cats.find(c => c.length > 24)
          ? Alert.alert(
              intl.formatMessage({ id: 'alert.error' }),
              'Tag maximum length should be 24',
            )
          : cats.find(c => c.split('-').length > 2)
          ? Alert.alert(intl.formatMessage({ id: 'alert.error' }), 'Use one dash in Tags')
          : cats.find(c => c.indexOf(',') >= 0)
          ? Alert.alert(intl.formatMessage({ id: 'alert.error' }), 'Use space to separate Tags')
          : cats.find(c => /[A-Z]/.test(c))
          ? Alert.alert(intl.formatMessage({ id: 'alert.error' }), 'Only use lower letters in Tags')
          : cats.find(c => !/^[a-z0-9-#]+$/.test(c))
          ? Alert.alert(
              intl.formatMessage({ id: 'alert.error' }),
              'Use only allowed characters in Tags',
            )
          : cats.find(c => !/^[a-z-#]/.test(c))
          ? Alert.alert(intl.formatMessage({ id: 'alert.error' }), 'Tag must start with letter')
          : cats.find(c => !/[a-z0-9]$/.test(c))
          ? Alert.alert(
              intl.formatMessage({ id: 'alert.error' }),
              'Tag must end with letter or number',
            )
          : null;
        handleTagChanged([...cats]);
      }
      onChange(text);
    }

    if (handleIsValid) {
      handleIsValid(componentID, !!(text && text.length));
    }
  };
  return (
    <View style={[globalStyles.containerHorizontal16, { height: Math.max(35, height) }]}>
      <TextInput
        style={[styles.textInput, { height: Math.max(35, height) }]}
        placeholderTextColor="#c1c5c7"
        editable={!isPreviewActive}
        maxLength={100}
        placeholder={intl.formatMessage({
          id: 'editor.tags',
        })}
        multiline
        numberOfLines={2}
        onContentSizeChange={event => {
          setHeight(event.nativeEvent.contentSize.height);
        }}
        autoFocus={autoFocus}
        onChangeText={textT => _handleOnChange(textT)}
        onBlur={() => _handleOnBlur()}
        value={text}
      />
    </View>
  );
};

export default TagInput;
