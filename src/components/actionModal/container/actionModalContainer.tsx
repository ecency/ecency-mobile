import React from 'react';
import { AlertButton } from 'react-native';
import { ImageSource } from 'expo-image';
import { SheetManager, SheetProps } from 'react-native-actions-sheet';
import ActionModalView from '../view/actionModalView';
import { SheetNames } from '../../../navigation/sheets';

export enum ButtonTypes {
  CANCEL = 'cancel',
  OK = 'ok',
  SKIP = 'skip',
}
interface ExtendedAlertButton extends AlertButton {
  textId?: string;
  type?: ButtonTypes;
}

export interface ActionModalPayload {
  title: string;
  body?: string;
  para?: string;
  buttons?: ExtendedAlertButton[];
  headerImage?: ImageSource;
  onClosed?: () => void;
  headerContent?: React.ReactNode;
  bodyContent?: React.ReactNode;
}

const ActionModalContainer = ({ payload }: SheetProps<SheetNames.ACTION_MODAL>) => {
  const _onClose = () => {
    if (payload?.onClosed) {
      payload.onClosed();
    }
    SheetManager.hide(SheetNames.ACTION_MODAL);
  };

  if (!payload) {
    return null;
  }

  return <ActionModalView onClose={_onClose} data={payload} />;
};

export default ActionModalContainer;
