import React, { useCallback, useState } from 'react';
import { injectIntl } from 'react-intl';
import { Text, TouchableOpacity, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import styles from './CopyClipboardGroup.style.ts';
import { Icon } from '../icon';

interface ICopyClipboardGroup {
  title?: string;
  text: string;
}

const CopyClipboardGroup = ({ title, text }: ICopyClipboardGroup) => {
  const [isCopied, setIsCopied] = useState(false);

  const onPressToClip = useCallback(() => {
    Clipboard.setString(text);
    setIsCopied(true);
  }, [text]);

  return (
    <View style={styles.wrapper}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.container}>
        <View style={styles.textWrapper}>
          <Text style={styles.text} numberOfLines={1}>
            {text}
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onPressToClip}>
          <Icon
            style={styles.icon}
            name={isCopied ? 'done' : 'content-copy'}
            iconType="MaterialIcons"
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default injectIntl(CopyClipboardGroup);
