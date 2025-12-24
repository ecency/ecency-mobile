import React from 'react';
import { View } from 'react-native';
import Placeholder from 'rn-placeholder';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './linkPreviewPlaceHolderStyles';

interface LinkPreviewPlaceHolderProps {
  width?: number;
}

const LinkPreviewPlaceHolder = ({ width }: LinkPreviewPlaceHolderProps) => {
  const color = EStyleSheet.value('$darkIconColor');

  const containerStyle = width ? { ...styles.container, width } : styles.container;

  return (
    <View style={containerStyle}>
      <Placeholder.Box
        animate="fade"
        width={56}
        height={56}
        radius={12}
        color={color}
        style={styles.thumbnailPlaceholder}
      />
      <View style={styles.textContainer}>
        <Placeholder.Line
          animate="fade"
          width="60%"
          height={10}
          color={color}
          style={styles.firstLine}
        />
        <Placeholder.Line
          animate="fade"
          width="100%"
          height={10}
          color={color}
          style={styles.linePlaceholder}
        />
        <Placeholder.Line
          animate="fade"
          width="80%"
          height={10}
          color={color}
          style={styles.linePlaceholder}
        />
      </View>
    </View>
  );
};

export default LinkPreviewPlaceHolder;
