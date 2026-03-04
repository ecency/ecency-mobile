import React from 'react';
import { useIntl } from 'react-intl';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BasicHeader } from '../../../components';
import { SwapTokenContent } from '../children';
import styles from '../styles/tradeScreen.styles';

import TransferTypes from '../../../constants/transferTypes';
import { walletQueries } from '../../../providers/queries';
import { MarketAsset } from '../../../providers/hive-trade/hiveTrade.types';

const TradeScreen = ({ route }) => {
  const intl = useIntl();

  const assetsQuery = walletQueries.useAssetsQuery();

  const transferType = route?.params?.transferType;
  const rawFundType = route?.params?.fundType;
  const fundType =
    rawFundType === MarketAsset.HIVE || rawFundType === MarketAsset.HBD
      ? rawFundType
      : MarketAsset.HIVE;

  const _delayedRefreshCoinsData = () => {
    setTimeout(() => {
      assetsQuery.refetch();
    }, 3000);
  };

  const _onSuccess = () => {
    _delayedRefreshCoinsData();
  };

  let _content: any = null;
  switch (transferType) {
    case TransferTypes.SWAP_TOKEN:
      _content = <SwapTokenContent initialSymbol={fundType} onSuccess={_onSuccess} />;
      break;

    // NOTE: when we add support for different modes of trade, those section will separatly rendered from here.
  }

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: `trade.${transferType}` })} />
      {_content}
    </SafeAreaView>
  );
};

export default TradeScreen;
