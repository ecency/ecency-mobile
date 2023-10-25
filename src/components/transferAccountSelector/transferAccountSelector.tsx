import React, { useCallback, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Text, View } from 'react-native';
import { debounce } from 'lodash';
import TransferTypes from '../../constants/transferTypes';
import DropdownButton from '../dropdownButton';
import Icon from '../icon';
import TextInput from '../textInput';
import { TransferFormItem } from '../transferFormItem';
import UserAvatar from '../userAvatar';

// Styles
import styles from './transferAccountSelectorStyles';
import { Market } from '../../providers/hive-spk/hiveSpk.types';
import { SPK_NODE_ECENCY } from '../../providers/hive-spk/hiveSpk';

export interface TransferAccountSelectorProps {
  accounts: any;
  currentAccountName: string;
  transferType: string;
  balance: any;
  fetchBalance: any;
  from: string;
  setFrom: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  getAccountsWithUsername: any;
  setIsUsernameValid: (value: boolean) => void;
  memo: string;
  setMemo: (value: string) => void;
  spkMarkets: Market[];
  getRecurrentTransferOfUser: (username: string) => string;
}

const TransferAccountSelector = ({
  accounts,
  currentAccountName,
  transferType,
  balance,
  fetchBalance,
  from,
  setFrom,
  destination,
  setDestination,
  amount,
  setAmount,
  getAccountsWithUsername,
  setIsUsernameValid,
  memo,
  setMemo,
  spkMarkets,
  getRecurrentTransferOfUser,
}: TransferAccountSelectorProps) => {
  const intl = useIntl();
  const destinationRef = useRef('');

  const destinationLocked = useMemo(() => {
    switch (transferType) {
      case TransferTypes.CONVERT:
      case TransferTypes.PURCHASE_ESTM:
      case TransferTypes.UNSTAKE_ENGINE:
      case TransferTypes.POWER_UP_SPK:
      case TransferTypes.POWER_DOWN_SPK:
      case TransferTypes.LOCK_LIQUIDITY_SPK:
        return true;
      default:
        return false;
    }
  }, [transferType]);

  const _handleOnFromUserChange = (username) => {
    fetchBalance(username);
    setFrom(username);

    if (destinationLocked) {
      _handleOnDestinationChange(username);
    }
  };

  const _handleOnDestinationChange = (username) => {
    destinationRef.current = username;
    setDestination(username);
  };

  //todo: fetch existing recurrent transfer
  const _debouncedValidateUsername = useCallback(
    debounce((username: string) => {
      getAccountsWithUsername(username).then((res) => {
        // often times response for check with no matching user is returned later
        // compoared to updated input values, this makes sure only matching value/response is processed
        if (username !== destinationRef.current) {
          return;
        }
        const isValid = res.includes(username);

        
        if (isValid) {
          console.log('====================================');
          console.log('debounce getRecurrentTransferOfUser');
          console.log('====================================');

          const recurrentTransferOfUser = getRecurrentTransferOfUser(username);

          console.log('====================================');
          console.log('recurrentTransferOfUser', recurrentTransferOfUser);
          console.log('====================================');
        }

        setIsUsernameValid(isValid);
      });
    }, 300),
    [],
  );

  const _handleOnChange = (state: string, val: string) => {
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
      _debouncedValidateUsername(val);
      destinationRef.current = _amount;
      setDestination(_amount);
    }
    if (state === 'memo') {
      setMemo(_amount);
    }
  };

  const _renderDropdown = (usernames, defaultSelection, onSelectionChange) => (
    <DropdownButton
      dropdownButtonStyle={styles.dropdownButtonStyle}
      rowTextStyle={styles.rowTextStyle}
      style={styles.dropdown}
      dropdownStyle={styles.dropdownStyle}
      textStyle={styles.dropdownText}
      options={usernames}
      defaultText={defaultSelection}
      selectedOptionIndex={usernames.indexOf(defaultSelection)}
      onSelect={(index, value) => onSelectionChange(value)}
    />
  );

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

  const _destinationInput = !destinationLocked ? (
    transferType === TransferTypes.DELEGATE_SPK ? (
      <TransferFormItem
        label={intl.formatMessage({ id: 'transfer.to' })}
        rightComponent={() =>
          _renderDropdown(
            spkMarkets.map((market) => market.name),
            SPK_NODE_ECENCY,
            _handleOnDestinationChange,
          )
        }
      />
    ) : (
      <TransferFormItem
        label={intl.formatMessage({ id: 'transfer.to' })}
        rightComponent={() =>
          _renderInput(
            intl.formatMessage({ id: 'transfer.to_placeholder' }),
            'destination',
            'default',
            false,
          )
        }
        containerStyle={styles.elevate}
      />
    )
  ) : null;

  return (
    <View style={styles.stepOneContainer}>
      <Text style={styles.sectionHeading}>
        {intl.formatMessage({ id: 'transfer.account_select_title' })}
      </Text>
      <Text style={styles.sectionSubheading}>
        {intl.formatMessage({ id: 'transfer.account_select_description' })}
      </Text>
      <TransferFormItem
        containerStyle={{ marginTop: 32 }}
        label={intl.formatMessage({ id: 'transfer.from' })}
        rightComponent={() =>
          _renderDropdown(
            accounts.map((account) => account.username),
            currentAccountName,
            _handleOnFromUserChange,
          )
        }
      />

      {_destinationInput}

      <View style={styles.toFromAvatarsContainer}>
        <UserAvatar username={from} size="xl" style={styles.userAvatar} noAction />
        <Icon style={styles.icon} name="arrow-forward" iconType="MaterialIcons" />
        <UserAvatar username={destination} size="xl" style={styles.userAvatar} noAction />
      </View>
    </View>
  );
};

export default TransferAccountSelector;
