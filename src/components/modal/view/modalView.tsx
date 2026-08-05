import React, { PureComponent } from 'react';
import { Modal as ModalBox } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './modalStyles';
import { ModalHeader } from '../../modalHeader';

/*
 *            Props Name        Description                                     Value
 *@props -->  fullModal         For modal size all screen or quick modal        Boolean
 *@props -->  isOpen            For modal is open or not                        Boolean
 *
 */

export default class Modal extends PureComponent<any, any> {
  constructor(props: any) {
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
      animationType = 'slide',
      isBottomModal = false,
    } = this.props;
    return (
      <ModalBox
        transparent={isTransparent}
        animationType={animationType}
        visible={isOpen}
        onRequestClose={() => this._handleOnClose()}
        onShow={() => this._handleOnOpen()}
        {...({ onModalHide: () => console.log('hide') } as any)}
        onModalDismiss={() => console.log('dismiss')}
        presentationStyle="formSheet"
        {...this.props}
      >
        <SafeAreaView
          style={
            this.props.style || [
              isRadius && styles.borderTopRadius,
              isFullScreen
                ? styles.fullModal
                : isBottomModal
                ? styles.bottomModal
                : styles.centerModal,
            ]
          }
        >
          <ModalHeader onClosePress={() => this._handleOnClose()} {...(this.props as any)} />
          {children}
        </SafeAreaView>
      </ModalBox>
    );
  }
}
