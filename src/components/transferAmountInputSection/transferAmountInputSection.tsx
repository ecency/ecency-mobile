import React from 'react';
import { useIntl } from 'react-intl';
import { Text, TouchableOpacity, View } from 'react-native';
import TextInput from '../textInput';
import { TransferFormItem } from '../transferFormItem';
import get from 'lodash/get';

// Styles
import styles from './transferAmountInputSectionStyles';
import transferTypes from '../../constants/transferTypes';

export interface TransferAmountInputSectionProps {
  balance: number;
  getAccountsWithUsername: any;
  setIsUsernameValid: (value: boolean) => void;
  destination: string;
  setDestination: (value: string) => void;
  memo: string;
  setMemo: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  hsTransfer: boolean;
  transferType: string;
  selectedAccount: any;
  fundType: any;
  currentAccountName: string;
}

const TransferAmountInputSection = ({
  balance,
  getAccountsWithUsername,
  setIsUsernameValid,
  setDestination,
  destination,
  memo,
  setMemo,
  amount,
  setAmount,
  hsTransfer,
  transferType,
  selectedAccount,
  fundType,
  currentAccountName,
}): JSX.Element => {
  const intl = useIntl();

  const _handleOnChange = (state, val) => {
    let _amount = val.toString();
    if (_amount.includes(',')) {
      _amount = val.replace(',', '.');
    }
    if (state === 'amount') {
      if (parseFloat(Number(_amount)) <= parseFloat(balance)) {
        setAmount(_amount);
      }
    }
    if (state === 'destination') {
      getAccountsWithUsername(val).then((res) => {
        const isValid = res.includes(val);

        setIsUsernameValid(isValid);
      });
      setDestination(_amount);
    }
    if (state === 'memo') {
      setMemo(_amount);
    }
  };

  const _renderInput = (placeholder, state, keyboardType, isTextArea) => (
    <TextInput
      style={[isTextArea ? styles.textarea : styles.input]}
      onChangeText={(amount) => _handleOnChange(state, amount)}
      value={
        state === 'destination'
          ? destination
          : state === 'amount'
          ? amount
          : state === 'memo'
          ? memo
          : ''
      }
      placeholder={placeholder}
      placeholderTextColor="#c1c5c7"
      autoCapitalize="none"
      multiline={isTextArea}
      numberOfLines={isTextArea ? 4 : 1}
      keyboardType={keyboardType}
    />
  );

  const _renderDescription = (text) => <Text style={styles.description}>{text}</Text>;
  let path;
  if (hsTransfer) {
    if (transferType !== transferTypes.CONVERT) {
      const json = JSON.stringify({
        sender: get(selectedAccount, 'name'),
        receiver: destination,
        amount: `${Number(amount).toFixed(3)} ${fundType}`,
        memo,
      });
      path = `sign/custom-json?authority=active&required_auths=%5B%22${get(
        selectedAccount,
        'name',
      )}%22%5D&required_posting_auths=%5B%5D&id=ecency_point_transfer&json=${encodeURIComponent(
        json,
      )}`;
    } else if (transferType === transferTypes.TRANSFER_TO_SAVINGS) {
      path = `sign/transfer_to_savings?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}`;
    } else if (transferType === transferTypes.DELEGATE_VESTING_SHARES) {
      path = `sign/delegate_vesting_shares?delegator=${currentAccountName}&delegatee=${destination}&vesting_shares=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (transferType === transferTypes.TRANSFER_TO_VESTING) {
      path = `sign/transfer_to_vesting?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (
      transferType === transferTypes.WITHDRAW_HIVE ||
      transferType === transferTypes.WITHDRAW_HBD
    ) {
      path = `sign/transfer_from_savings?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&request_id=${new Date().getTime() >>> 0}`;
    } else if (transferType === transferTypes.CONVERT) {
      path = `sign/convert?owner=${currentAccountName}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&requestid=${new Date().getTime() >>> 0}`;
    } else if (transferType === transferTypes.WITHDRAW_VESTING) {
      path = `sign/withdraw_vesting?account=${currentAccountName}&vesting_shares=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else {
      path = `sign/transfer?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}`;
    }
  }

  return (
    <View style={styles.stepTwoContainer}>
      <TransferFormItem
        label={intl.formatMessage({ id: 'transfer.amount' })}
        rightComponent={() =>
          _renderInput(intl.formatMessage({ id: 'transfer.amount' }), 'amount', 'numeric', false)
        }
      />
      <TransferFormItem
        rightComponent={() => (
          <TouchableOpacity onPress={() => _handleOnChange('amount', balance)}>
            {_renderDescription(
              `${intl.formatMessage({
                id: 'transfer.amount_desc',
              })} ${balance} ${fundType === 'ESTM' ? 'Points' : fundType}`,
            )}
          </TouchableOpacity>
        )}
      />
      {(transferType === transferTypes.POINTS ||
        transferType === transferTypes.TRANSFER_TOKEN ||
        transferType === transferTypes.TRANSFER_TO_SAVINGS) && (
        <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.memo' })}
          rightComponent={() =>
            _renderInput(
              intl.formatMessage({ id: 'transfer.memo_placeholder' }),
              'memo',
              'default',
              true,
            )
          }
          containerStyle={{ height: 80 }}
        />
      )}
      {(transferType === transferTypes.POINTS || transferType === transferTypes.TRANSFER_TOKEN) && (
        <TransferFormItem
          containerStyle={{ marginTop: 20 }}
          rightComponent={() =>
            _renderDescription(intl.formatMessage({ id: 'transfer.memo_desc' }))
          }
        />
      )}
      {transferType === transferTypes.CONVERT && (
        <TransferFormItem
          rightComponent={() =>
            _renderDescription(intl.formatMessage({ id: 'transfer.convert_desc' }))
          }
        />
      )}
    </View>
  );
};

export default TransferAmountInputSection;
