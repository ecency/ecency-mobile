import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { injectIntl } from 'react-intl';
import { get, debounce } from 'lodash';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { hsOptions } from '../../../constants/hsOptions';
import AUTH_TYPE from '../../../constants/authType';

import {
  BasicHeader,
  MainButton,
  Modal,
  TransferAccountSelector,
  TransferAmountInputSection,
} from '../../../components';

import styles from './transferStyles';
import TransferTypes from '../../../constants/transferTypes';
import { getEngineActionJSON } from '../../../providers/hive-engine/hiveEngineActions';
import { useAppDispatch } from '../../../hooks';
import { showActionModal } from '../../../redux/actions/uiAction';
import {
  getSpkActionJSON,
  getSpkTransactionId,
  SPK_NODE_ECENCY,
} from '../../../providers/hive-spk/hiveSpk';
import { RECURRENCE_TYPES } from '../../../components/transferAmountInputSection/transferAmountInputSection';
import parseToken from '../../../utils/parseToken';

const TransferView = ({
  currentAccountName,
  transferType,
  getAccountsWithUsername,
  balance,
  transferToAccount,
  accountType,
  accounts,
  intl,
  handleOnModalClose,
  fundType,
  selectedAccount,
  fetchBalance,
  spkMarkets,
  referredUsername,
  initialAmount,
  initialMemo,
  initialRecurrence,
  initialExecutions,
  fetchRecurrentTransfers,
  recurrentTransfers,
}) => {
  const dispatch = useAppDispatch();

  const [from, setFrom] = useState(currentAccountName);
  const [destination, setDestination] = useState(
    transferType === 'transfer_to_vesting' ||
      transferType === 'transfer_to_savings' ||
      transferType === 'withdraw_vesting' ||
      transferType === 'withdraw_hive' ||
      transferType === 'withdraw_hbd' ||
      transferType === 'convert' ||
      transferType === TransferTypes.UNSTAKE_ENGINE ||
      transferType === TransferTypes.STAKE_ENGINE ||
      transferType === TransferTypes.POWER_UP_SPK ||
      transferType === TransferTypes.POWER_DOWN_SPK ||
      transferType === TransferTypes.LOCK_LIQUIDITY_SPK
      ? currentAccountName
      : transferType === 'purchase_estm'
      ? 'esteem.app'
      : transferType === TransferTypes.DELEGATE_SPK
      ? SPK_NODE_ECENCY
      : transferType === TransferTypes.TRANSFER_TOKEN && referredUsername
      ? referredUsername
      : '',
  );

  const [amount, setAmount] = useState(`${initialAmount}`);
  const [memo, setMemo] = useState(
    transferType === 'purchase_estm' ? 'estm-purchase' : initialMemo,
  );
  const [recurrence, setRecurrence] = useState('');
  const [executions, setExecutions] = useState('');

  const [isUsernameValid, setIsUsernameValid] = useState(
    !!(
      transferType === 'purchase_estm' ||
      transferType === 'transfer_to_vesting' ||
      transferType === 'transfer_to_savings' ||
      transferType === 'withdraw_vesting' ||
      transferType === 'withdraw_hive' ||
      transferType === 'withdraw_hbd' ||
      transferType === TransferTypes.UNSTAKE_ENGINE ||
      transferType === TransferTypes.STAKE_ENGINE ||
      transferType === TransferTypes.POWER_UP_SPK ||
      transferType === TransferTypes.POWER_DOWN_SPK ||
      transferType === TransferTypes.LOCK_LIQUIDITY_SPK ||
      transferType === TransferTypes.DELEGATE_SPK ||
      (transferType === 'convert' && currentAccountName) ||
      !!referredUsername
    ),
  );
  const [hsTransfer, setHsTransfer] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);

  const isRecurrentTransfer = transferType === TransferTypes.RECURRENT_TRANSFER;

  const isEngineToken = useMemo(() => transferType.endsWith('_engine'), [transferType]);
  const isSpkToken = useMemo(() => transferType.endsWith('_spk'), [transferType]);

  const _handleTransferAction = debounce(
    () => {
      setIsTransfering(true);
      if (accountType === AUTH_TYPE.STEEM_CONNECT) {
        setHsTransfer(true);
      } else {
        transferToAccount(
          from,
          destination,
          amount,
          memo,
          isRecurrentTransfer ? recurrence : null,
          isRecurrentTransfer ? executions : null,
        );
      }
    },
    300,
    { trailing: true },
  );

  let path;

  if (hsTransfer) {
    // NOTE: Keepping point purchase url here for referemnce in case we have to put it back again,
    // the path formatting seems quite complex so perhaps it's better to just let it live here
    // as comment
    // if (transferType === transferTypes.PURCHASE_ESTM) {
    //   const json = JSON.stringify({
    //     sender: get(selectedAccount, 'name'),
    //     receiver: destination,
    //     amount: `${Number(amount).toFixed(3)} ${fundType}`,
    //     memo,
    //   });
    //   path = `sign/custom-json?authority=active&required_auths=%5B%22${get(
    //     selectedAccount,
    //     'name',
    //   )}%22%5D&required_posting_auths=%5B%5D&id=ecency_point_transfer&json=${encodeURIComponent(
    //     json,
    //   )}`;
    // } else

    if (transferType === TransferTypes.RECURRENT_TRANSFER) {
      path = `sign/recurrent_transfer?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}&recurrence=${recurrence}&executions=${executions}`;
    } else if (transferType === TransferTypes.TRANSFER_TO_SAVINGS) {
      path = `sign/transfer_to_savings?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}`;
    } else if (transferType === TransferTypes.DELEGATE_VESTING_SHARES) {
      path = `sign/delegate_vesting_shares?delegator=${currentAccountName}&delegatee=${destination}&vesting_shares=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (transferType === TransferTypes.TRANSFER_TO_VESTING) {
      path = `sign/transfer_to_vesting?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (
      transferType === TransferTypes.WITHDRAW_HIVE ||
      transferType === TransferTypes.WITHDRAW_HBD
    ) {
      path = `sign/transfer_from_savings?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&request_id=${new Date().getTime() >>> 0}`;
    } else if (transferType === TransferTypes.CONVERT) {
      path = `sign/convert?owner=${currentAccountName}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&requestid=${new Date().getTime() >>> 0}`;
    } else if (transferType === TransferTypes.WITHDRAW_VESTING) {
      path = `sign/withdraw_vesting?account=${currentAccountName}&vesting_shares=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (transferType === TransferTypes.POINTS) {
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
    } else if (isEngineToken) {
      const json = getEngineActionJSON(
        transferType.split('_')[0],
        destination,
        `${amount} ${fundType}`,
        fundType,
        memo,
      );
      path = `sign/custom-json?authority=active&required_auths=%5B%22${get(
        selectedAccount,
        'name',
      )}%22%5D&required_posting_auths=%5B%5D&id=ssc-mainnet-hive&json=${encodeURIComponent(
        JSON.stringify(json),
      )}`;
    } else if (isSpkToken) {
      // compose spk json
      const json = getSpkActionJSON(Number(amount), destination, memo);
      path = `sign/custom-json?authority=active&required_auths=%5B%22${
        selectedAccount.name
      }%22%5D&required_posting_auths=%5B%5D&id=${getSpkTransactionId(
        transferType,
      )}&json=${encodeURIComponent(JSON.stringify(json))}`;
    } else {
      path = `sign/transfer?from=${currentAccountName}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}`;
    }
    console.log('path is: ', path);
  }

  const _onNextPress = () => {
    if (balance < amount) {
      Alert.alert(intl.formatMessage({ id: 'wallet.low_liquidity' }));

      return false;
    } else {
      dispatch(
        showActionModal({
          title: intl.formatMessage({ id: 'transfer.information' }),
          buttons: [
            {
              text: intl.formatMessage({ id: 'alert.cancel' }),
              onPress: () => {},
            },
            {
              text: intl.formatMessage({ id: 'alert.confirm' }),
              onPress: _handleTransferAction,
            },
          ],
        }),
      );
    }
  };

  const nextBtnDisabled = !((isEngineToken ? amount > 0 : amount >= 0.001) && isUsernameValid);

  useEffect(() => {
    if (isRecurrentTransfer) {
      fetchRecurrentTransfers(currentAccountName);
    }
  }, [isRecurrentTransfer]);

  const _findRecurrentTransferOfUser = useCallback(
    (userToFind) => {
      if (!isRecurrentTransfer) {
        return false;
      }

      const existingRecurrentTransfer = recurrentTransfers.find((rt) => rt.to === userToFind);

      let newMemo,
        newAmount,
        newRecurrence,
        newExecutions = '';

      if (existingRecurrentTransfer) {
        newMemo = existingRecurrentTransfer.memo;
        newAmount = parseToken(existingRecurrentTransfer.amount).toString();
        newRecurrence = existingRecurrentTransfer.recurrence.toString();
        newExecutions = `${existingRecurrentTransfer.remaining_executions}`;

        setMemo(newMemo);
        setAmount(newAmount);
        setRecurrence(newRecurrence);
        setExecutions(newExecutions);

        return existingRecurrentTransfer;
      }
      return null;
    },
    [recurrentTransfers],
  );

  return (
    <View style={styles.container}>
      <BasicHeader
        title={intl.formatMessage({ id: `transfer.${transferType}` })}
        backIconName="close"
      />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={[styles.grow, styles.keyboardAwareScrollContainer]}
      >
        <View style={styles.container}>
          <TransferAccountSelector
            accounts={accounts}
            currentAccountName={currentAccountName}
            transferType={transferType}
            balance={balance}
            fetchBalance={fetchBalance}
            getAccountsWithUsername={getAccountsWithUsername}
            from={from}
            setFrom={setFrom}
            destination={destination}
            setDestination={setDestination}
            amount={amount}
            setAmount={setAmount}
            setIsUsernameValid={setIsUsernameValid}
            memo={memo}
            setMemo={setMemo}
            spkMarkets={spkMarkets}
            getRecurrentTransferOfUser={_findRecurrentTransferOfUser}
          />
          <TransferAmountInputSection
            balance={balance}
            getAccountsWithUsername={getAccountsWithUsername}
            setIsUsernameValid={setIsUsernameValid}
            setDestination={setDestination}
            destination={destination}
            memo={memo}
            setMemo={setMemo}
            amount={amount}
            setAmount={setAmount}
            hsTransfer={hsTransfer}
            transferType={transferType}
            selectedAccount={selectedAccount}
            fundType={fundType}
            currentAccountName={currentAccountName}
            disableMinimum={isEngineToken}
            recurrence={recurrence}
            setRecurrence={setRecurrence}
            executions={executions}
            setExecutions={setExecutions}
          />
          <View style={styles.bottomContent}>
            <MainButton
              style={styles.button}
              isDisable={nextBtnDisabled}
              onPress={_onNextPress}
              isLoading={isTransfering}
            >
              <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
            </MainButton>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {!!path && (
        <Modal
          isOpen={hsTransfer}
          isFullScreen
          isCloseButton
          handleOnModalClose={handleOnModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
          <WebView source={{ uri: `${hsOptions.base_url}${path}` }} />
        </Modal>
      )}
    </View>
  );
};

export default injectIntl(TransferView);
