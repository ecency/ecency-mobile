import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Alert, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';
import { SheetManager } from 'react-native-actions-sheet';
import styles from '../styles/tradeScreen.styles';
import { AssetChangeBtn, ErrorSection, SwapAmountInput, SwapFeeSection } from '.';
import { Icon, MainButton } from '../../../components';
import { fetchHiveMarketRate } from '../../../providers/hive-trade/hiveTrade';
import { useAppSelector } from '../../../hooks';
import {
  MarketAsset,
  OrderIdPrefix,
  SwapOptions,
} from '../../../providers/hive-trade/hiveTrade.types';
import { walletQueries } from '../../../providers/queries';
import { useSwapCalculator } from './useSwapCalculator';
import { delay } from '../../../utils/editor';
import { SheetNames } from '../../../navigation/sheets';
import { convertSwapOptionsToLimitOrder } from '../../../providers/hive-trade/converters';
import { useLimitOrderCreateMutation } from '../../../providers/sdk/mutations';
import { selectCurrency, selectIsDarkTheme } from '../../../redux/selectors';

interface Props {
  initialSymbol: MarketAsset;
  onSuccess: () => void;
}

export const SwapTokenContent = ({ initialSymbol, onSuccess }: Props) => {
  const intl = useIntl();
  const navigation = useNavigation();

  const currency = useAppSelector(selectCurrency);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const limitOrderCreate = useLimitOrderCreateMutation();

  const [fromAssetSymbol, setFromAssetSymbol] = useState(initialSymbol || MarketAsset.HIVE);
  const [marketPrice, setMarketPrice] = useState(0);
  const [isMoreThanBalance, setIsMoreThanBalance] = useState(false);

  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [fromAmount, setFromAmount] = useState('0');

  const toAssetSymbol = useMemo(
    () => (fromAssetSymbol === MarketAsset.HBD ? MarketAsset.HIVE : MarketAsset.HBD),
    [fromAssetSymbol],
  );

  // queres
  const assetsQuery = walletQueries.useAssetsQuery();
  const pendingRequestsQuery = walletQueries.usePendingRequestsQuery(fromAssetSymbol);

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
  const _fromAssetData = useMemo(
    () => assetsQuery.getAssetBySymbol(fromAssetSymbol),
    [assetsQuery.data, fromAssetSymbol],
  );
  const _toAssetData = useMemo(
    () => assetsQuery.getAssetBySymbol(toAssetSymbol),
    [assetsQuery.data, toAssetSymbol],
  );

  const _balance = _fromAssetData?.liquid || 0;
  const _fromFiatRate = _fromAssetData?.fiatRate || 0;
  const _toFiatRate = _toAssetData?.fiatRate || 0;
  const _marketFiatPrice = marketPrice * _toFiatRate;

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
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert(intl.formatMessage({ id: 'alert.market_data_load_failed' }), message);
    } finally {
      setLoading(false);
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

    SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        headerContent,
        title: intl.formatMessage({ id: _titleId }),
        body: _body,
        buttons: [
          { textId: 'trade.new_swap', onPress: _reset },
          { textId: 'alert.done', onPress: () => navigation.goBack() },
        ],
      },
    });
  };

  // initiates swaping action on confirmation
  const _confirmSwap = async () => {
    const _fromAmount = Number(fromAmount);

    const data: SwapOptions = {
      fromAsset: fromAssetSymbol,
      fromAmount: _fromAmount,
      toAmount,
    };

    try {
      setSwapping(true);

      const { amountToSell, minToReceive } = convertSwapOptionsToLimitOrder(data);

      const expirationDate = new Date(Date.now());
      expirationDate.setDate(expirationDate.getDate() + 27);
      const [expiration] = expirationDate.toISOString().split('.');

      const numericOrderId = parseInt(`${OrderIdPrefix.SWAP}${Date.now().toString().slice(2)}`, 10);

      await limitOrderCreate.mutateAsync({
        amountToSell: `${amountToSell.toFixed(3)} ${fromAssetSymbol}`,
        minToReceive: `${minToReceive.toFixed(3)} ${toAssetSymbol}`,
        fillOrKill: false,
        expiration,
        orderId: numericOrderId,
      });

      await delay(1000);
      const _existingPendingCount = pendingRequestsQuery.data?.length || 0;
      const refetchResult = await pendingRequestsQuery.refetch();
      const _latestPendingCount =
        refetchResult.data?.length ?? pendingRequestsQuery.data?.length ?? 0;
      const _hasPending = _latestPendingCount !== _existingPendingCount;

      onSuccess();
      _onSwapSuccess(_hasPending);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert(intl.formatMessage({ id: 'alert.swap_failed' }), message);
    } finally {
      setSwapping(false);
    }
  };

  // prompts user to verify swap action;
  const handleContinue = () => {
    SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: intl.formatMessage({ id: 'trade.confirm_swap' }),
        body: intl.formatMessage(
          { id: 'trade.swap_for' },
          {
            fromAmount: `${fromAmount} ${fromAssetSymbol}`,
            toAmount: `${_toAmountStr} ${toAssetSymbol}`,
          },
        ),
        buttons: [
          {
            textId: 'alert.cancel',
            onPress: () => {
              console.log('cancel pressed');
            },
          },
          { textId: 'alert.confirm', onPress: _confirmSwap },
        ],
      },
    });
  };

  // refreshes wallet data and market rate
  const _refresh = async () => {
    setLoading(true);
    assetsQuery.refetch();
    _fetchMarketRate();
  };

  const handleAssetChange = () => {
    setFromAssetSymbol(toAssetSymbol);
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
        fiatRate={_fromFiatRate}
      />

      <SwapAmountInput
        label={intl.formatMessage({ id: 'transfer.to' })}
        value={_toAmountStr}
        symbol={toAssetSymbol}
        fiatRate={_toFiatRate}
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
        `${toAssetSymbol} (${currency.currencySymbol + _marketFiatPrice.toFixed(3)})`}
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
