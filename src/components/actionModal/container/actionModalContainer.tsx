import React, { useEffect, useRef, useState } from 'react';
import { AlertButton } from 'react-native';
import { ImageSource } from 'expo-image';
import { useSelector, useDispatch } from 'react-redux';
import { hideActionModal } from '../../../redux/actions/uiAction';
import ActionModalView, { ActionModalRef } from '../view/actionModalView';

interface ExtendedAlertButton extends AlertButton {
  textId: string;
}

export interface ActionModalData {
  title: string;
  body: string;
  para?: string;
  buttons: ExtendedAlertButton[];
  headerImage?: ImageSource;
  onClosed: () => void;
  headerContent?: React.ReactNode;
  bodyContent?: React.ReactNode;
}

const ActionModalContainer = () => {
  const dispatch = useDispatch();
  const actionModalRef = useRef<ActionModalRef>();

  const actionModalVisible = useSelector((state) => state.ui.actionModalVisible);
  const actionModalData: ActionModalData = useSelector((state) => state.ui.actionModalData);

  const [modalToken, setModalToken] = useState(0);

  useEffect(() => {
    if (actionModalVisible && actionModalVisible !== modalToken) {
      actionModalRef.current?.showModal();
      setModalToken(actionModalVisible);
    }
  }, [actionModalVisible]);

  const _onClose = () => {
    if (actionModalData.onClosed) {
      actionModalData.onClosed();
    }
    dispatch(hideActionModal());
  };

  return <ActionModalView ref={actionModalRef} onClose={_onClose} data={actionModalData} />;
};

export default ActionModalContainer;
