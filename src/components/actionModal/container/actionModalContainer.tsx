import React, { useEffect, useRef } from 'react';
import { Alert, AlertButton, ButtonProps } from 'react-native';
import { Source } from 'react-native-fast-image';
import { useSelector, useDispatch } from 'react-redux';
import { ActionModalView } from '..';
import { hideActionModal } from '../../../redux/actions/uiAction';
import { ActionModalRef } from '../view/actionModalView';

export interface ActionModalData {
  title:string, 
  body:string, 
  buttons:AlertButton[], 
  headerImage?:Source,
  onClosed:()=>void,
}


const ActionModalContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const actionModalRef = useRef<ActionModalRef>();

  const actionModalVisible = useSelector(
    (state) => state.ui.actionModalVisible,
  );

    const actionModalData:ActionModalData = useSelector(state => state.ui.actionModalData)


  useEffect(() => {
    if (actionModalVisible) {
        actionModalRef.current?.showModal();
    }
  }, [actionModalVisible]);


  const _onClose = () => {
    actionModalData.onClosed();
    dispatch(hideActionModal());
  };


  return (
    <ActionModalView
      ref={actionModalRef}
      onClose={_onClose}
      data={actionModalData}
    />
  );
};

export default ActionModalContainer;