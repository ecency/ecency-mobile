import React from 'react';
import { useIntl } from 'react-intl';
import { Text, TouchableOpacity, View } from 'react-native';
import TextInput from '../textInput';
import { TransferFormItem } from '../transferFormItem';

// Styles
import styles from './transferAmountInputSectionStyles';
import TransferTypes from '../../constants/transferTypes';

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
  recurrence: string;
  setRecurrence: (value: string) => void;
  hsTransfer: boolean;
  transferType: string;
  selectedAccount: any;
  fundType: any;
  currentAccountName: string;
  disableMinimum?: boolean;
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
  recurrence,
  setRecurrence,
  transferType,
  fundType,
  disableMinimum,
}) => {
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
    if (state === 'recurrence') {
      setRecurrence(val);
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
          : state === 'recurrence'
          ? recurrence
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
  const _renderCenterDescription = (text) => <Text style={styles.centerDescription}>{text}</Text>;

  const amountLimitText = disableMinimum
    ? ''
    : intl.formatMessage({ id: 'transfer.amount_select_desc_limit' });

  return (
    <View style={styles.stepTwoContainer}>
      <Text style={styles.sectionHeading}>
        {intl.formatMessage({ id: 'transfer.amount_select_title' })}
      </Text>
      <Text style={styles.sectionSubheading}>
        {intl.formatMessage(
          { id: 'transfer.amount_select_description' },
          { suffix: amountLimitText },
        )}
      </Text>
      <TransferFormItem
        label={intl.formatMessage({ id: 'transfer.amount' })}
        rightComponent={() =>
          _renderInput(intl.formatMessage({ id: 'transfer.amount' }), 'amount', 'numeric', false)
        }
      />
      <TransferFormItem
        rightComponentStyle={styles.transferItemRightStyle}
        containerStyle={styles.transferItemContainer}
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
      {transferType === TransferTypes.RECURRENT_TRANSFER && (
        <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.recurrence' })}
          rightComponent={() =>
            _renderInput(
              intl.formatMessage({ id: 'transfer.recurrence_placeholder' }),
              'recurrence',
              'numeric',
              false,
            )
          }
        />
      )}
      {(transferType === TransferTypes.POINTS ||
        transferType === TransferTypes.TRANSFER_TOKEN ||
        transferType === TransferTypes.RECURRENT_TRANSFER ||
        transferType === TransferTypes.TRANSFER_TO_SAVINGS ||
        transferType === TransferTypes.TRANSFER_ENGINE ||
        transferType === TransferTypes.TRANSFER_SPK ||
        transferType === TransferTypes.TRANSFER_LARYNX) && (
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
      {(transferType === TransferTypes.POINTS || transferType === TransferTypes.TRANSFER_TOKEN) && (
        <TransferFormItem
          rightComponentStyle={styles.transferItemRightStyle}
          containerStyle={styles.transferItemContainer}
          rightComponent={() =>
            _renderDescription(intl.formatMessage({ id: 'transfer.memo_desc' }))
          }
        />
      )}
      {transferType === TransferTypes.CONVERT && (
        <TransferFormItem
          rightComponent={() =>
            _renderCenterDescription(intl.formatMessage({ id: 'transfer.convert_desc' }))
          }
        />
      )}
    </View>
  );
};

export default TransferAmountInputSection;
