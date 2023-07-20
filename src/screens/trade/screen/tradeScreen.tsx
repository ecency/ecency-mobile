import React from 'react';
import { View } from 'react-native';
import styles from '../styles/tradeScreen.styles';
import {SwapTokenContent } from '../children';
import { BasicHeader } from '../../../components';

import TransferTypes from '../../../constants/transferTypes';
import { useIntl } from 'react-intl';


const TradeScreen = ({ route }) => {
  const intl = useIntl();

  const transferType = route?.params?.transferType;
  const fundType = route?.params?.fundType;

  let _content:any = null;
  switch(transferType){
    case TransferTypes.SWAP_TOKEN:
      _content = <SwapTokenContent initialSymbol={fundType}/>
      break;

    //NOTE: when we add support for different modes of trade, those section will separatly rendered from here.
  }

  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: `trade.${transferType}` })} />
      {_content}

    </View>
  );
};

export default TradeScreen;