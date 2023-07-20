import React, { useState } from 'react';
import { View } from 'react-native';
import styles from '../styles/tradeScreen.styles';
import {SwapTokenContent } from '../children';
import { BasicHeader, Modal } from '../../../components';

import TransferTypes from '../../../constants/transferTypes';
import { useIntl } from 'react-intl';
import { hsOptions } from '../../../constants/hsOptions';
import WebView from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { walletQueries } from '../../../providers/queries';
import { delay } from '../../../utils/editor';


const TradeScreen = ({ route, navigation }) => {
  const intl = useIntl();

  const assetsQuery = walletQueries.useAssetsQuery();

  const transferType = route?.params?.transferType;
  const fundType = route?.params?.fundType;

  const [showHsModal, setShowHsModal] = useState(false);
  const [hsSignPath, setHsSignPath] = useState('');


  const _delayedRefreshCoinsData = () => {
    setTimeout(() => {
      assetsQuery.refetch();
    }, 3000);
  };

  const _handleOnModalClose = async () => {
    setShowHsModal(false);
    setHsSignPath('');

    await delay(300)
    navigation.goBack();
  }

  const _onSuccess = () => {
    _delayedRefreshCoinsData()
  }


  const _handleHsTransfer = (_hsSignPath:string) => {
    setHsSignPath(_hsSignPath)
    setShowHsModal(true)
  }

  let _content:any = null;
  switch(transferType){
    case TransferTypes.SWAP_TOKEN:
      _content = <SwapTokenContent initialSymbol={fundType} handleHsTransfer={_handleHsTransfer} onSuccess={_onSuccess} />
      break;

    //NOTE: when we add support for different modes of trade, those section will separatly rendered from here.
  }


  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: `trade.${transferType}` })} />
      {_content}

      {!!hsSignPath && (
        <Modal
          isOpen={showHsModal}
          isFullScreen
          isCloseButton
          handleOnModalClose={_handleOnModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
          <WebView source={{ uri: `${hsOptions.base_url}${hsSignPath}` }} />
        </Modal>
      )}
    </View>
  );
};

export default TradeScreen;