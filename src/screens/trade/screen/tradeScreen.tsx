import React, { useEffect, useMemo, useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import styles from '../styles/tradeScreen.styles';
import { SwapAmountInput } from '../children';
import { BasicHeader } from '../../../components';
import { useIntl } from 'react-intl';
import { fetchHiveMarketRate, swapToken } from '../../../providers/hive-trade/hiveTrade';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { MarketAsset, SwapOptions } from '../../../providers/hive-trade/hiveTrade.types';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { showActionModal, toastNotification } from '../../../redux/actions/uiAction';
import { walletQueries } from '../../../providers/queries';


const TradeScreen = () => {

  const intl = useIntl();
  const dispatch = useAppDispatch();

  //queres
  const assetsQuery = walletQueries.useAssetsQuery();

  const currentAccount = useAppSelector(state => state.account.currentAccount)
  const assetsData = useAppSelector(state => state.wallet.coinsData);
  const pinHash = useAppSelector(state => state.application.pin);

  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE); //TODO: initialise using route params
  const [marketPrice, setMarketPrice] = useState(0);
  const [isInvalidAmount, setIsInvalidAmount] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toAmount, setToAmount] = useState('0');
  const [fromAmount, setFromAmount] = useState('0');

  const _toAsset = useMemo(() => fromAsset === MarketAsset.HBD ? MarketAsset.HIVE : MarketAsset.HBD, [fromAsset])
  const _balance = useMemo(
    () => assetsData[fromAsset === MarketAsset.HBD ? ASSET_IDS.HBD : ASSET_IDS.HIVE].balance,
    [assetsData, fromAsset]);


  useEffect(() => {
    _fetchMarketRate();
  }, [fromAsset])


 //post process updated amount value
  useEffect(() => {
    const _value = Number(fromAmount);

    //check for amount validity
    setIsInvalidAmount(_value > _balance)

    //update toAmount based on market price
    if (!!_value) {
      setToAmount((_value * marketPrice).toFixed(3))
    }
  }, [fromAmount])


  //fetches and sets market rate based on selected assetew
  const _fetchMarketRate = async () => {
    try {
      setLoading(true)

      //TODO: update marketPrice
      const _marketPrice = await fetchHiveMarketRate(fromAsset)
      setMarketPrice(_marketPrice);

      setLoading(false)
    } catch (err) {
      Alert.alert("fail", err.message)
    }

  }

  //refreshes wallet data and market rate
  const _refresh = async () => {
    setLoading(true);
    await assetsQuery.refetch();
    _fetchMarketRate();
  }


  //initiates swaping action on confirmation
  const _confirmSwap = async () => {
    try {

      setLoading(true)
      const _fromAmount = Number(fromAmount)
      const _toAmount = Number(toAmount);

      const data: SwapOptions = {
        fromAsset: fromAsset,
        fromAmount: _fromAmount,
        toAmount: _toAmount
      }

      await swapToken(
        currentAccount,
        pinHash,
        data
      )

      await assetsQuery.refetch();

      dispatch(toastNotification("successful swap"));
      setLoading(false)

    } catch (err) {
      Alert.alert('fail', err.message)
      setLoading(false)
    }

  }


  //prompts user to verify swap action;
  const handleContinue = () => {

    dispatch(showActionModal({
      title: "confirm swap",
      body: `swaping ${fromAmount} ${fromAsset} for ${_toAsset} ${toAmount}`,
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {
            console.log('Swap transaction canceled');
          }
        },
        {
          text: 'Confirm',
          onPress: () => {
            _confirmSwap()
          }
        }
      ]
    }))
  };



  const handleAmountChange = (value: string) => {
    setFromAmount(value);
  };


  const handleAssetChange = () => {
    setFromAsset(_toAsset)
    setFromAmount(toAmount);
  }


  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'transfer.trade_token' })} />
      <SwapAmountInput
        label={intl.formatMessage({ id: 'transfer.from' })}
        onChangeText={handleAmountChange}
        value={fromAmount}
        symbol={fromAsset}
      />
      {isInvalidAmount && <Text style={{ color: 'red' }} >Please enter valid amount</Text>}
      <Text>{`Balance: ${_balance} ${fromAsset}`}</Text>
      <SwapAmountInput
        label={intl.formatMessage({ id: 'transfer.to' })}
        value={toAmount}
        symbol={_toAsset}
      />

      <Text>{`1 ${fromAsset} = ${marketPrice.toFixed(3)} ${_toAsset}`}</Text>

      <Button title="Continue" onPress={handleContinue} disabled={loading || isInvalidAmount || !Number(fromAmount)} />
      <Button title="Change Asset" onPress={handleAssetChange} disabled={loading} />


      <Button title="refresh" onPress={_refresh} disabled={loading} />
    </View>
  );
};

export default TradeScreen;