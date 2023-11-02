import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Text, TouchableOpacity, View } from 'react-native';
import TextInput from '../textInput';
import { TransferFormItem } from '../transferFormItem';

// Styles
import styles from './transferAmountInputSectionStyles';
import TransferTypes from '../../constants/transferTypes';
import DropdownButton from '../dropdownButton';
import { dateToFormatted } from '../../utils/time';

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
  executions: string;
  setExecutions: (value: string) => void;
  hsTransfer: boolean;
  transferType: string;
  selectedAccount: any;
  fundType: any;
  currentAccountName: string;
  disableMinimum?: boolean;
}

export const RECURRENCE_TYPES = [
  {
    key: 'daily',
    hours: 24,
    intlId: 'leaderboard.daily',
  },
  {
    key: 'weekly',
    hours: 168,
    intlId: 'leaderboard.weekly',
  },
  {
    key: 'monthly',
    hours: 731,
    intlId: 'leaderboard.monthly',
  },
];

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
  fundType,
  disableMinimum,
  transferType,
  recurrence,
  setRecurrence,
  executions,
  setExecutions,
  startDate,
  onNext,
}) => {
  const intl = useIntl();

  const dpRef = useRef();

  const _handleOnChange = (state, val) => {
    let newValue = val.toString();

    if (newValue.includes(',')) {
      newValue = val.replace(',', '.');
    }
    if (state === 'amount') {
      if (parseFloat(Number(newValue)) <= parseFloat(balance)) {
        setAmount(newValue);
      }
    } else if (state === 'destination') {
      getAccountsWithUsername(val).then((res) => {
        console.log(res);

        const isValid = res.includes(val);

        setIsUsernameValid(isValid);
      });
      setDestination(newValue);
    } else if (state === 'memo') {
      setMemo(newValue);
    } else if (state === 'executions') {
      setExecutions(val);
    }
  };

  const _renderInput = (placeholder, state, keyboardType, isTextArea) => (
    <TextInput
      style={[isTextArea ? styles.textarea : styles.input]}
      onChangeText={(newVal) => _handleOnChange(state, newVal)}
      value={
        state === 'destination'
          ? destination
          : state === 'amount'
          ? amount
          : state === 'memo'
          ? memo
          : state === 'executions'
          ? executions
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

  const [recurrenceIndex, setRecurrenceIndex] = useState(
    RECURRENCE_TYPES.findIndex((r) => r.hours === recurrence),
  );

  useEffect(() => {
    const newSelectedIndex = RECURRENCE_TYPES.findIndex((r) => r.hours === +recurrence);

    setRecurrenceIndex(newSelectedIndex);

    if (newSelectedIndex > -1) {
      setRecurrence(RECURRENCE_TYPES[newSelectedIndex].hours);
    }

    if (dpRef?.current) {
      dpRef.current.select(newSelectedIndex);
    }
  }, [recurrence, dpRef]);

  const _handleRecurrenceChange = useCallback((index: number) => {
    setRecurrenceIndex(index);

    setRecurrence(RECURRENCE_TYPES[index].hours);
  }, []);

  const _onDelete = () => {
    onNext(true);
  };

  const _renderDescription = (text) => <Text style={styles.description}>{text}</Text>;
  const _renderCenterDescription = (text, extraStyles = {}) => (
    <Text style={[styles.centerDescription, extraStyles]}>{text}</Text>
  );

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

      {startDate && startDate !== '' && (
        <TouchableOpacity onPress={_onDelete}>
          <Text style={[styles.sectionSubheading, styles.dangerDescription]}>
            {intl.formatMessage({ id: 'transfer.delete_recurrent_transfer' }) +
              dateToFormatted(startDate, 'LL')}
          </Text>
        </TouchableOpacity>
      )}

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
        <>
          <TransferFormItem
            label={intl.formatMessage({ id: 'transfer.recurrence' })}
            rightComponent={() => (
              <DropdownButton
                dropdownButtonStyle={styles.dropdownButtonStyle}
                rowTextStyle={styles.rowTextStyle}
                style={styles.dropdown}
                dropdownStyle={styles.dropdownStyle}
                textStyle={styles.dropdownText}
                options={RECURRENCE_TYPES.map((k) => intl.formatMessage({ id: k.intlId }))}
                defaultText={intl.formatMessage({ id: 'transfer.recurrence_placeholder' })}
                selectedOptionIndex={recurrenceIndex}
                onSelect={(index) => _handleRecurrenceChange(index)}
                dropdownRef={dpRef}
              />
            )}
          />
          <TransferFormItem
            label={intl.formatMessage({ id: 'transfer.executions' })}
            rightComponent={() =>
              _renderInput(
                intl.formatMessage({ id: 'transfer.executions_placeholder' }),
                'executions',
                'numeric',
                false,
              )
            }
          />
        </>
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
