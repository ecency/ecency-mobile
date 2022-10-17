import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { default as ModalBox } from 'react-native-modal';
import { IconButton } from '../../iconButton';
import styles from './modalStyles';

/*
 *            Props Name        Description                                     Value
 *@props -->  fullModal         For modal size all screen or quick modal        Boolean
 *@props -->  isOpen            For modal is open or not                        Boolean
 *
 */

export default class Modal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _handleOnOpen = () => {
    const { handleOnModalOpen } = this.props;
    if (handleOnModalOpen) {
      handleOnModalOpen();
    }
  };

  _handleOnClose = () => {
    const { handleOnModalClose } = this.props;
    if (handleOnModalClose) {
      handleOnModalClose();
    }
  };

  _handleOnDismiss = () => {
    const { handleOnModalDismiss } = this.props;

    if (handleOnModalDismiss) {
      handleOnModalDismiss();
    }
  };

  render() {
    const {
      isFullScreen,
      isOpen,
      children,
      isRadius,
      isTransparent = false,
      title,
      animationType = 'fade',
      isCloseButton,
      isBottomModal = false,
      hasRightText = false,
      rightText,
      onPressRightText,
    } = this.props;
    return (
      <ModalBox
        style={[
          isRadius && styles.borderTopRadius,
          isFullScreen ? styles.fullModal : isBottomModal ? styles.bottomModal : styles.centerModal,
        ]}
        transparent={isTransparent}
        animationType={animationType}
        visible={isOpen}
        onRequestClose={() => this._handleOnClose(this)}
        onShow={() => this._handleOnOpen(this)}
        onModalHide={() => console.log('hide')}
        onModalDismiss={() => console.log('dismiss')}
        {...this.props}
      >
        {title && (
          <View style={styles.modalHeader}>
            <Text
              style={[styles.headerTitle, (isCloseButton || hasRightText) && { marginLeft: 50 }]}
            >
              {title}
            </Text>
            {isCloseButton && (
              <IconButton
                style={styles.closeButton}
                iconType="FontAwesome"
                iconStyle={styles.closeIcon}
                name="close"
                onPress={() => this._handleOnClose()}
              />
            )}
            {hasRightText && (
              <TouchableOpacity onPress={onPressRightText}>
                <Text style={styles.rightText}>{rightText}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {children}
      </ModalBox>
    );
  }
}
