import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { IconButton } from '../../iconButton';
import styles from '../styles/modalHeader.styles';

interface ModalHeaderProps {
  title: string;
  isCloseButton?: boolean;
  hasRightText?: boolean;
  rightText?: string;
  modalHeaderContainerStyle?: ViewStyle;
  modalHeaderTitleStyle?: TextStyle;
  modalCloseBtnStyle?: ViewStyle;
  onPressRightText?: () => void;
  onClosePress?: () => void;
}

export const ModalHeader = ({
  title,
  hasRightText,
  rightText,
  onPressRightText,
  onClosePress,
  modalHeaderContainerStyle,
  isCloseButton,
  modalHeaderTitleStyle,
  modalCloseBtnStyle,
}: ModalHeaderProps) => {
  if (!title) {
    return null;
  }

  return (
    <View style={[styles.modalHeader, modalHeaderContainerStyle]}>
      <Text
        style={[
          styles.headerTitle,
          (isCloseButton || hasRightText) && { marginLeft: 50 },
          modalHeaderTitleStyle,
        ]}
      >
        {title}
      </Text>
      {isCloseButton && (
        <IconButton
          style={[styles.closeButton, modalCloseBtnStyle]}
          iconType="FontAwesome"
          iconStyle={styles.closeIcon}
          name="close"
          onPress={onClosePress}
        />
      )}
      {hasRightText && (
        <TouchableOpacity onPress={onPressRightText}>
          <Text style={styles.rightText}>{rightText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
