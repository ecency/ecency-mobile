import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hideWebViewModal } from '../../redux/actions/uiAction';
import WebView from 'react-native-webview';
import { hsOptions } from '../../constants/hsOptions';
import { Modal } from '..';
import styles from './webViewModalStyles';

interface QRModalProps {}
interface WebViewModalData {
  uri: string;
}

export const WebViewModal = ({}: QRModalProps) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const isVisibleWebViewModal = useAppSelector((state) => state.ui.isVisibleWebViewModal);
  const webViewModalData: WebViewModalData = useAppSelector((state) => state.ui.webViewModalData);

  const [hiveSignerModal, setHiveSignerModal] = useState(false);

  useEffect(() => {
    if (isVisibleWebViewModal) {
      setHiveSignerModal(true);
    } else {
      setHiveSignerModal(false);
    }
  }, [isVisibleWebViewModal]);

  const _onClose = () => {
    dispatch(hideWebViewModal());
  };

  return (
    <Modal
      isOpen={hiveSignerModal}
      isFullScreen
      isCloseButton
      handleOnModalClose={_onClose}
      title={intl.formatMessage({ id: 'qr.confirmTransaction' })}
    >
      {webViewModalData && (
        <WebView source={{ uri: `${hsOptions.base_url}${webViewModalData?.uri?.substring(7)}` }} />
      )}
    </Modal>
  );
};

export default WebViewModal;
