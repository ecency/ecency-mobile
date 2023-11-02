import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Alert, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/tradeScreen.styles';
import { AssetChangeBtn, ErrorSection, SwapAmountInput, SwapFeeSection } from '.';
import { Icon, MainButton } from '../../../components';
import {
  fetchHiveMarketRate,
  generateHsSwapTokenPath,
  swapToken,
} from '../../../providers/hive-trade/hiveTrade';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { MarketAsset, SwapOptions } from '../../../providers/hive-trade/hiveTrade.types';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { showActionModal } from '../../../redux/actions/uiAction';
import { walletQueries } from '../../../providers/queries';
import { useSwapCalculator } from './useSwapCalculator';
import AUTH_TYPE from '../../../constants/authType';
import { delay } from '../../../utils/editor';

interface Props {
  initialSymbol: MarketAsset;
  handleHsTransfer: (hsSignPath: string) => void;
  onSuccess: () => void;
}

export const SwapTokenContent = ({ initialSymbol, handleHsTransfer, onSuccess }: Props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const currency = useAppSelector((state) => state.application.currency);

  const assetsData = useAppSelector((state) => state.wallet.coinsData);
  const pinHash = useAppSelector((state) => state.application.pin);
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

  const [fromAssetSymbol, setFromAssetSymbol] = useState(initialSymbol || MarketAsset.HIVE);
  const [marketPrice, setMarketPrice] = useState(0);
  const [isMoreThanBalance, setIsMoreThanBalance] = useState(false);

  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [fromAmount, setFromAmount] = useState('0');

  const _toAssetSymbol = useMemo(
    () => (fromAssetSymbol === MarketAsset.HBD ? MarketAsset.HIVE : MarketAsset.HBD),
    [fromAssetSymbol],
  );

  const _fromAssetId = fromAssetSymbol === MarketAsset.HBD ? ASSET_IDS.HBD : ASSET_IDS.HIVE;
  const _toAssetId = _toAssetSymbol === MarketAsset.HBD ? ASSET_IDS.HBD : ASSET_IDS.HIVE;

  // queres
  const assetsQuery = walletQueries.useAssetsQuery();
  const pendingRequestsQuery = walletQueries.usePendingRequestsQuery(_fromAssetId);

  // this method makes sure amount is only updated when new order book is fetched after asset change
  // this avoid wrong from and to swap value on changing source asset
  const _onAssetChangeComplete = () => {
    setFromAmount(_toAmountStr);
  };

  const {
    toAmount,
    offerUnavailable,
    tooMuchSlippage,
    isLoading: _isFetchingOrders,
  } = useSwapCalculator(fromAssetSymbol, Number(fromAmount) || 0, _onAssetChangeComplete);

  const _errorMessage = useMemo(() => {
    let msg = '';
    if (isMoreThanBalance) {
      msg += `${intl.formatMessage({ id: 'trade.more-than-balance' })}\n`;
    }
    if (offerUnavailable) {
      msg += `${intl.formatMessage({ id: 'trade.offer-unavailable' })}\n`;
    }
    if (tooMuchSlippage) {
      msg += `${intl.formatMessage({ id: 'trade.too-much-slippage' })}\n`;
    }
    return msg.trim();
  }, [tooMuchSlippage, offerUnavailable, isMoreThanBalance]);

  // accumulate asset data properties
  const _fromAssetData = assetsData[_fromAssetId];
  const _balance = _fromAssetData.balance;
  const _fromFiatPrice = _fromAssetData.currentPrice;
  const _toFiatPrice = assetsData[_toAssetId].currentPrice;
  const _marketFiatPrice = marketPrice * _toFiatPrice;

  const _toAmountStr = toAmount.toFixed(3);

  // initialize market data
  useEffect(() => {
    _fetchMarketRate();
  }, [fromAssetSymbol]);

  // post process updated amount value
  useEffect(() => {
    const _value = Number(fromAmount);
    // check for amount validity
    setIsMoreThanBalance(_value > _balance);
  }, [fromAmount]);

  // fetches and sets market rate based on selected assetew
  const _fetchMarketRate = async () => {
    try {
      setLoading(true);

      // TODO: update marketPrice
      const _marketPrice = await fetchHiveMarketRate(fromAssetSymbol);
      setMarketPrice(_marketPrice);

      setLoading(false);
    } catch (err) {
      Alert.alert('fail', err.message);
    }
  };

  const _reset = () => {
    setFromAmount('0');
  };

  const _onSwapSuccess = async (hasPending: boolean) => {
    const _badgeColor = hasPending
      ? EStyleSheet.value('$primaryBlue')
      : EStyleSheet.value('$primaryGreen');
    const _badgeIcon = hasPending ? 'error-outline' : 'check';
    const _titleId = hasPending ? 'trade.swap_pending' : 'trade.swap_successful';
    const _body = hasPending ? intl.formatMessage({ id: 'trade.swap_pending_body' }) : undefined;

    const headerContent = (
      <View
        style={{
          backgroundColor: _badgeColor,
          borderRadius: 56,
          padding: 8,
        }}
      >
        <Icon
          style={{ borderWidth: 0 }}
          size={64}
          color={EStyleSheet.value('$pureWhite')}
          name={_badgeIcon}
          iconType="MaterialIcons"
        />
      </View>
    );
    dispatch(
      showActionModal({
        headerContent,
        title: intl.formatMessage({ id: _titleId }),
        body: _body,
        buttons: [
          { textId: 'trade.new_swap', onPress: _reset },
          { textId: 'alert.done', onPress: () => navigation.goBack() },
        ],
      }),
    );
  };

  // initiates swaping action on confirmation
  const _confirmSwap = async () => {
    const _fromAmount = Number(fromAmount);

    const data: SwapOptions = {
      fromAsset: fromAssetSymbol,
      fromAmount: _fromAmount,
      toAmount,
    };

    if (currentAccount.local.authType === AUTH_TYPE.STEEM_CONNECT) {
      await delay(500); // NOTE: it's required to avoid modal mis fire
      handleHsTransfer(generateHsSwapTokenPath(currentAccount, data));
    } else {
      try {
        setSwapping(true);

        await swapToken(currentAccount, pinHash, data);

        await delay(1000);
        const _existingPedingCount = pendingRequestsQuery.data?.length || 0;
        const pendingRequests = await pendingRequestsQuery.refetch();
        const _hasPending = pendingRequests.data?.length !== _existingPedingCount;

        onSuccess();
        setSwapping(false);
        _onSwapSuccess(_hasPending);
      } catch (err) {
        Alert.alert('fail', err.message);
        setSwapping(false);
      }
    }
  };

  // prompts user to verify swap action;
  const handleContinue = () => {
    dispatch(
      showActionModal({
        title: intl.formatMessage({ id: 'trade.confirm_swap' }),
        body: intl.formatMessage(
          { id: 'trade.swap_for' },
          {
            fromAmount: `${fromAmount} ${fromAssetSymbol}`,
            toAmount: `${_toAmountStr} ${_toAssetSymbol}`,
          },
        ),
        buttons: [
          { textId: 'alert.cancel', onPress: () => {console.log("cancel pressed")} },
          { textId: 'alert.confirm', onPress: _confirmSwap },
        ],
      }),
    );
  };

  // refreshes wallet data and market rate
  const _refresh = async () => {
    setLoading(true);
    assetsQuery.refetch();
    _fetchMarketRate();
  };

  const handleAssetChange = () => {
    setFromAssetSymbol(_toAssetSymbol);
  };

  const _disabledContinue =
    _isFetchingOrders ||
    loading ||
    isMoreThanBalance ||
    offerUnavailable ||
    !Number(fromAmount) ||
    !Number(toAmount);

  const _renderBalance = () => (
    <Text style={styles.balance}>
      {'Balance: '}
      <Text
        style={{ color: EStyleSheet.value('$primaryBlue') }}
        onPress={() => {
          setFromAmount(`${_balance}`);
        }}
      >
        {`${_balance} ${fromAssetSymbol}`}
      </Text>
    </Text>
  );

  const _renderInputs = () => (
    <View style={{ flex: 1 }}>
      <SwapAmountInput
        label={intl.formatMessage({ id: 'transfer.from' })}
        onChangeText={setFromAmount}
        value={fromAmount}
        symbol={fromAssetSymbol}
        fiatPrice={_fromFiatPrice}
      />

      <SwapAmountInput
        label={intl.formatMessage({ id: 'transfer.to' })}
        value={_toAmountStr}
        symbol={_toAssetSymbol}
        fiatPrice={_toFiatPrice}
      />
      <AssetChangeBtn onPress={handleAssetChange} />
    </View>
  );

  const _renderMainBtn = () => (
    <View style={styles.mainBtnContainer}>
      <MainButton
        style={styles.mainBtn}
        isDisable={_disabledContinue}
        onPress={handleContinue}
        isLoading={swapping}
      >
        <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
      </MainButton>
    </View>
  );

  const _renderMarketPrice = () => (
    <Text style={styles.marketRate}>
      {`1 ${fromAssetSymbol} = ${marketPrice.toFixed(3)} ` +
        `${_toAssetSymbol} (${currency.currencySymbol + _marketFiatPrice.toFixed(3)})`}
    </Text>
  );

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={_refresh}
          progressBackgroundColor="#357CE6"
          tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
          titleColor="#fff"
          colors={['#fff']}
        />
      }
    >
      {_renderBalance()}
      {_renderInputs()}
      {_renderMarketPrice()}

      <SwapFeeSection />
      <ErrorSection message={_errorMessage} />

      {_renderMainBtn()}
    </KeyboardAwareScrollView>
  );
};
