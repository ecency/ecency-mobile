import React from 'react';
import { FlatList, TouchableOpacity, Text, View } from 'react-native';

import Formats from './formats/formats';

import styles from './editorBarStyles';

const FOREGROUND_COLOR = '#788187';
const defaultStyles = { padding: 8, color: FOREGROUND_COLOR, fontSize: 16 };

const defaultMarkdownButton = ({ item, getState, setState }) => (
  <TouchableOpacity onPress={() => item.onPress({ getState, setState, item })}>
    <Text style={[defaultStyles, item.style]}>{item.title}</Text>
  </TouchableOpacity>
);

export const renderEditorButtons = ({ getState, setState }, formats, markdownButton) => (
  <View style={styles.container}>
    <FlatList
      data={formats || Formats}
      keyboardShouldPersistTaps="always"
      renderItem={({ item, index }) =>
        markdownButton
          ? markdownButton({ item, getState, setState })
          : defaultMarkdownButton({ item, getState, setState })
      }
      horizontal
    />
  </View>
);
