import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import styles from '../styles/tradeScreen.styles';
import {  SwapAmountInput } from '../children';
import { BasicHeader } from '../../../components';
import { useIntl } from 'react-intl';
import { swapToken } from '../../../providers/hive-trade/hiveTrade';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { MarketAsset, SwapOptions } from '../../../providers/hive-trade/hiveTrade.types';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { showActionModal, toastNotification } from '../../../redux/actions/uiAction';


const TradeScreen = () => {

  const intl = useIntl();
  const dispatch = useAppDispatch();

  const currentAccount = useAppSelector(state=>state.account.currentAccount)
  const assetsData = useAppSelector(state=>state.wallet.coinsData);
  const pinHash = useAppSelector(state=>state.application.pin);

  const [fromAsset, setFromAsset] = useState(MarketAsset.HIVE); //TODO: initialise using route params
  const [balance, setBalance] = useState(0);
  const [marketPrice, setMarketPrice] = useState(0);
  const [isInvalidAmount, setIsInvalidAmount] = useState(false);

  const [toAmount, setToAmount] = useState('0');
  const [fromAmount, setFromAmount] = useState('0');

  const _toAsset = fromAsset === MarketAsset.HBD ? MarketAsset.HIVE : MarketAsset.HBD;

  useEffect(() => {

    //update balance,
    const _assetId = fromAsset === MarketAsset.HBD ? ASSET_IDS.HBD : ASSET_IDS.HIVE
    const _balance = assetsData[_assetId].balance
    setBalance(_balance)

    //TODO: update marketPrice

  }, [fromAsset])



  const handleAmountChange = (value:string) => {
    setFromAmount(value);

    //check for amount validity
    setIsInvalidAmount(Number(value) > balance)

    //TODO: update toAmount based on market price
  };


  const handleAssetChange = () => {
    setFromAsset(_toAsset)
  }


  const _confirmSwap = async () => {
    try{
      const data:SwapOptions = {
        fromAsset:MarketAsset.HBD,
        fromAmount:0.01,
        toAmount:0.028
      }
  
      await swapToken(
        currentAccount,
        pinHash,
        data
      )

      dispatch(toastNotification("successful swap"));

    } catch(err){
      Alert.alert('fail', err.message)
    }
    
  }


  const handleContinue = () => {
    // Handle the continue button press
    console.log('Continue button pressed');



    dispatch(showActionModal({
      title:"confirm swap",
      body:`swaping ${fromAmount} ${fromAsset} for ${_toAsset} ${toAmount}`,
      buttons:[
        {
          text:'Cancel',
          onPress:()=>{
            console.log('Swap transaction canceled');
          }
        },
        {
          text:'Confirm',
          onPress:()=>{
            _confirmSwap
          }
        }
      ]
    }))
  };

  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'transfer.trade_token' })} />
      <SwapAmountInput
        label={intl.formatMessage({ id: 'transfer.from' })}
        onChangeText={handleAmountChange}
        value={fromAmount}
        symbol={fromAsset}
      />
      {isInvalidAmount && <Text style={{color:'red'}} >Please enter valid amount</Text>}
      <Text>{`Balance: ${balance} ${fromAsset}`}</Text>
      <SwapAmountInput
        label={intl.formatMessage({ id: 'transfer.to' })}
        value={toAmount}
        symbol={_toAsset}
      />
      
      <Text>{`1 ${fromAsset} = ${marketPrice} ${_toAsset}`}</Text>
      
      <Button title="Continue" onPress={handleContinue} disabled={isInvalidAmount || !Number(fromAmount)} />
      <Button title="Change Asset" onPress={handleAssetChange} />
    </View>
  );
};

export default TradeScreen;