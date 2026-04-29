import React, { useState, forwardRef, useImperativeHandle, useMemo, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useIntl } from 'react-intl';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../hooks';
import { TextInput, MainButton } from '../../index';
import { tipsQueries, walletQueries } from '../../../providers/queries';
import { getCurrencyPrecision } from '../../../services/tippingService';
import { selectIsLoggedIn } from '../../../redux/selectors';

interface TippingDialogContentProps {
  post: any;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

interface CurrencyOption {
  symbol: string;
  label: string;
  balance: number;
  precision?: number;
}

const TippingDialogContent = forwardRef<any, TippingDialogContentProps>(
  ({ post, onClose, onSuccess }, ref) => {
    const intl = useIntl();
    const insets = useSafeAreaInsets();
    const isLoggedIn = useAppSelector(selectIsLoggedIn);

    const [currency, setCurrency] = useState('HIVE');
    const [amount, setAmount] = useState('');

    const sendTipMutation = tipsQueries.useSendTipMutation();
    // Fetch all assets including non-enabled engine tokens for tipping
    const assetsQuery = walletQueries.useAssetsQuery({ onlyEnabled: false });
    const existingTipsQuery = tipsQueries.usePostTipsQuery({
      author: post?.author,
      permlink: post?.permlink,
      enabled: !!post?.author && !!post?.permlink,
    });

    // Build currency options from portfolio
    const currencyOptions: CurrencyOption[] = useMemo(() => {
      const options: CurrencyOption[] = [
        { symbol: 'HIVE', label: 'HIVE', balance: 0, precision: 3 },
        { symbol: 'HBD', label: 'HBD', balance: 0, precision: 3 },
        { symbol: 'POINTS', label: 'POINTS', balance: 0, precision: 3 },
      ];

      if (assetsQuery.data) {
        // Update balances for base currencies
        assetsQuery.data.forEach((asset) => {
          const option = options.find((opt) => opt.symbol === asset.symbol);
          if (option) {
            option.balance = asset.balance || 0;
          }
        });

        // Add Engine tokens with positive balance
        const engineTokens = assetsQuery.data
          .filter((asset) => asset.layer === 'engine' && asset.balance > 0)
          .map((asset) => ({
            symbol: asset.symbol,
            label: asset.symbol,
            balance: asset.balance || 0,
            precision: asset.precision, // Guaranteed by SDK
          }))
          .sort((a, b) => a.symbol.localeCompare(b.symbol));

        options.push(...engineTokens);
      }

      return options;
    }, [assetsQuery.data]);

    useImperativeHandle(ref, () => ({
      handleSheetClose: () => {
        setAmount('');
        setCurrency('HIVE');
      },
    }));

    // Reset state when post changes
    useEffect(() => {
      setAmount('');
      setCurrency('HIVE');
    }, [post?.author, post?.permlink]);

    // Get precision for current currency
    const currentPrecision = useMemo(() => {
      const option = currencyOptions.find((opt) => opt.symbol === currency);
      return option?.precision || getCurrencyPrecision(currency);
    }, [currency, currencyOptions]);

    const _isValidAmount = () => {
      const num = parseFloat(amount);
      if (Number.isNaN(num) || num <= 0) {
        return false;
      }

      // Check decimal places don't exceed currency precision
      const decimalParts = amount.split('.');
      if (decimalParts.length > 1 && decimalParts[1].length > currentPrecision) {
        return false;
      }

      return true;
    };

    const _handleAmountChange = (text: string) => {
      // Allow empty string
      if (text === '') {
        setAmount('');
        return;
      }

      // Convert comma to period for iOS locale keyboards
      let normalizedText = text;
      if (normalizedText.includes(',')) {
        normalizedText = normalizedText.replace(',', '.');
      }

      // Allow only numbers and single decimal point
      if (!/^\d*\.?\d*$/.test(normalizedText)) {
        return;
      }

      // Check decimal places don't exceed currency precision
      const decimalParts = normalizedText.split('.');
      if (decimalParts.length > 1 && decimalParts[1].length > currentPrecision) {
        return; // Don't update if exceeds precision
      }

      setAmount(normalizedText);
    };

    const _handleSendTip = () => {
      if (!isLoggedIn) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.warning' }),
          intl.formatMessage({ id: 'alert.login_required' }),
        );
        return;
      }

      if (!post?.author || !post?.permlink) {
        Alert.alert(intl.formatMessage({ id: 'alert.warning' }), 'Invalid post data');
        return;
      }

      if (!_isValidAmount()) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.warning' }),
          intl.formatMessage({ id: 'tipping.invalid_amount' }),
        );
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        intl.formatMessage({ id: 'tipping.confirm_title' }),
        intl.formatMessage(
          { id: 'tipping.confirm_message' },
          { amount, currency, author: post?.author || '' },
        ),
        [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            style: 'cancel',
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            onPress: _executeTip,
          },
        ],
      );
    };

    const _executeTip = async () => {
      if (!post?.author || !post?.permlink) {
        return;
      }

      try {
        await sendTipMutation.mutateAsync({
          currency,
          amount,
          recipient: post.author,
          author: post.author,
          permlink: post.permlink,
          precision: currentPrecision,
        });

        onSuccess?.({ amount, currency });
      } catch (error) {
        console.error('Tip execution error:', error);
        // Error toast is shown by mutation's onError callback
      } finally {
        onClose();
      }
    };

    if (!post) {
      return null;
    }

    return (
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
        enableOnAndroid
      >
        <Text style={styles.title}>{intl.formatMessage({ id: 'tipping.send_tip' })}</Text>
        <Text style={styles.subtitle}>
          {intl.formatMessage({ id: 'tipping.send_tip_to' }, { author: post?.author || '' })}
        </Text>

        {/* Currency Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.label}>{intl.formatMessage({ id: 'tipping.currency' })}</Text>
          {assetsQuery.isLoading ? (
            <View style={styles.currencyLoadingContainer}>
              <ActivityIndicator />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.currencyScrollContainer}
            >
              {currencyOptions.map((curr) => (
                <TouchableOpacity
                  key={curr.symbol}
                  style={[
                    styles.currencyButton,
                    currency === curr.symbol && styles.currencyButtonSelected,
                  ]}
                  onPress={() => setCurrency(curr.symbol)}
                >
                  <Text
                    style={[
                      styles.currencyButtonText,
                      currency === curr.symbol && styles.currencyButtonTextSelected,
                    ]}
                  >
                    {curr.label}
                  </Text>
                  <Text
                    style={[
                      styles.currencyBalance,
                      currency === curr.symbol && styles.currencyBalanceSelected,
                    ]}
                  >
                    {curr.balance.toFixed(curr.precision || 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Amount Input */}
        <View style={styles.sectionContainer}>
          <Text style={styles.label}>{intl.formatMessage({ id: 'tipping.amount' })}</Text>
          <TextInput
            style={styles.input}
            placeholder={intl.formatMessage({ id: 'tipping.amount' })}
            value={amount}
            onChangeText={_handleAmountChange}
            keyboardType="decimal-pad"
            editable={!sendTipMutation.isPending}
          />
          <Text style={styles.hint}>Maximum {currentPrecision} decimal places</Text>
        </View>

        {/* Submit Button */}
        <MainButton
          onPress={_handleSendTip}
          isLoading={sendTipMutation.isPending}
          isDisable={!isLoggedIn || !_isValidAmount() || sendTipMutation.isPending}
          text={intl.formatMessage({ id: 'tipping.send' })}
          style={styles.button}
        />

        {/* Existing Tips Info */}
        {existingTipsQuery.isLoading ? (
          <View style={styles.tipsInfoContainer}>
            <ActivityIndicator />
          </View>
        ) : existingTipsQuery.data?.meta?.count > 0 && existingTipsQuery.data?.meta?.totals ? (
          <View style={styles.tipsInfoContainer}>
            <Text style={styles.tipsInfoTitle}>
              {intl.formatMessage({ id: 'tipping.existing_tips' })} (
              {existingTipsQuery.data.meta.count})
            </Text>
            <View style={styles.tipsTotalsContainer}>
              {Object.entries(existingTipsQuery.data.meta.totals || {}).map(([curr, total]) => (
                <Text key={curr} style={styles.tipsTotalItem}>
                  {total} {curr}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    );
  },
);

TippingDialogContent.displayName = 'TippingDialogContent';

export default TippingDialogContent;

const styles = EStyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '$primaryBlack',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '$primaryDarkGray',
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlack',
    marginBottom: 10,
  },
  currencyScrollContainer: {
    paddingRight: 10,
  },
  currencyLoadingContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '$primaryLightBackground',
    borderWidth: 1,
    borderColor: '$primaryLightGray',
    alignItems: 'center',
    marginRight: 10,
    minWidth: 80,
  },
  currencyButtonSelected: {
    backgroundColor: '$primaryBlue',
    borderColor: '$primaryBlue',
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryDarkGray',
    marginBottom: 4,
  },
  currencyButtonTextSelected: {
    color: '$white',
  },
  currencyBalance: {
    fontSize: 11,
    color: '$primaryDarkGray',
    opacity: 0.7,
  },
  currencyBalanceSelected: {
    color: '$white',
    opacity: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '$primaryLightGray',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '$primaryBlack',
    backgroundColor: '$primaryLightBackground',
  },
  hint: {
    fontSize: 12,
    color: '$primaryDarkGray',
    marginTop: 6,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 10,
  },
  tipsInfoContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '$primaryLightGray',
  },
  tipsInfoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '$primaryDarkGray',
    marginBottom: 8,
  },
  tipsTotalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipsTotalItem: {
    fontSize: 12,
    color: '$primaryBlack',
    backgroundColor: '$primaryLightBackground',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});
