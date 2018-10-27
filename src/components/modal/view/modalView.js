import React, { Component } from 'react';
import ModalBox from 'react-native-modalbox';

import styles from './modalStyles';

/*
*            Props Name        Description                                     Value
*@props -->  fullModal         For modal size all screen or quick modal        Boolean
*@props -->  isOpen            For modal is open or not                        Boolean
*
*/

export default class Modal extends Component {
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
      isFullScreen, isOpen, swipeToClose, children, isRadius,
    } = this.props;
    return (
      <ModalBox
        style={[
          isRadius && styles.borderTopRadius,
          isFullScreen ? styles.fullModal : styles.centerModal,
        ]}
        position="center"
        isOpen={isOpen}
        swipeToClose={swipeToClose}
        onClosed={() => this._handleOnClose(this)}
        onOpened={() => this._handleOnOpen(this)}
        {...this.props}
      >
        {children}
      </ModalBox>
    );
  }
}
