import React, { PureComponent } from 'react';
import { Modal as ModalBox, View, Text, SafeAreaView } from 'react-native';
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

  render() {
    const {
      isFullScreen,
      isOpen,
      children,
      isRadius,
      isTransparent,
      title,
      animationType,
      isCloseButton,
    } = this.props;
    return (
      <ModalBox
        style={[
          isRadius && styles.borderTopRadius,
          isFullScreen ? styles.fullModal : styles.centerModal,
        ]}
        transparent={isTransparent}
        animationType={animationType || 'fade'}
        visible={isOpen}
        onRequestClose={() => this._handleOnClose(this)}
        onShow={() => this._handleOnOpen(this)}
        {...this.props}
      >
        {title && (
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.headerTitle}>{title}</Text>
              {isCloseButton && (
                <IconButton
                  style={styles.closeButton}
                  iconType="FontAwesome"
                  iconStyle={styles.closeIcon}
                  name="close"
                  onPress={() => this._handleOnClose()}
                />
              )}
            </View>
          </SafeAreaView>
        )}
        {children}
      </ModalBox>
    );
  }
}
