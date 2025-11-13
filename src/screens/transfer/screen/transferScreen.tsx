import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { injectIntl } from 'react-intl';
import { get, debounce } from 'lodash';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as hiveuri from 'hive-uri';
import { SheetManager } from 'react-native-actions-sheet';
import { hsOptions } from '../../../constants/hsOptions';
import AUTH_TYPE from '../../../constants/authType';

import {
  BasicHeader,
  HiveAuthModal,
  MainButton,
  Modal,
  TransferAccountSelector,
  TransferAmountInputSection,
} from '../../../components';

import styles from './transferStyles';
import TransferTypes from '../../../constants/transferTypes';
import { getEngineActionJSON } from '../../../providers/hive-engine/hiveEngineActions';
import { getSpkActionJSON, SPK_NODE_ECENCY } from '../../../providers/hive-spk/hiveSpk';
import parseToken from '../../../utils/parseToken';
import { buildTransferOpsArray } from '../../../utils/transactionOpsBuilder';
import { SheetNames } from '../../../navigation/sheets';
import TokenLayers from '../../../constants/tokenLayers';
import { EngineActions } from '../../../providers/hive-engine/hiveEngine.types';

interface TransferViewProps {
  currentAccountName: string;
  transferType: string;
  getAccountsWithUsername: (username: string) => any;
  balance: number | string;
  transferToAccount: (params: any) => void;
  accountType: string;
  accounts: any[];
  intl: any;
  handleOnModalClose: () => void;
  fundType: string;
  selectedAccount: any;
  fetchBalance: () => void;
  spkMarkets: any;
  referredUsername?: string;
  initialAmount?: string | number;
  initialMemo?: string;
  fetchRecurrentTransfers?: () => void;
  recurrentTransfers?: any;
  tokenLayer?: string;
}

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
  fetchRecurrentTransfers,
  recurrentTransfers,
  tokenLayer,
}: TransferViewProps) => {
  const hiveAuthModalRef = useRef();

  const [from, setFrom] = useState(currentAccountName);
  const [destination, setDestination] = useState(
    transferType === TransferTypes.TRANSFER_TO_SAVINGS ||
      transferType === TransferTypes.TRANSFER_TO_VESTING ||
      transferType === TransferTypes.TRANSFER_FROM_SAVINGS ||
      transferType === TransferTypes.WITHDRAW_VESTING ||
      transferType === TransferTypes.CONVERT ||
      transferType === TransferTypes.UNSTAKE ||
      transferType === TransferTypes.STAKE ||
      transferType === TransferTypes.POWER_UP_SPK ||
      transferType === TransferTypes.POWER_DOWN_SPK
      ? currentAccountName
      : transferType === TransferTypes.POWER_GRANT_SPK
      ? SPK_NODE_ECENCY
      : referredUsername || '',
  );

  const [amount, setAmount] = useState(`${initialAmount}`);
  const [memo, setMemo] = useState(
    transferType === 'purchase_estm' ? 'estm-purchase' : initialMemo,
  );
  const [recurrence, setRecurrence] = useState('');
  const [executions, setExecutions] = useState('');
  const [startDate, setStartDate] = useState('');

  const [isUsernameValid, setIsUsernameValid] = useState(!!destination); // if destination is preset, set username to valid;

  const [hsTransfer, setHsTransfer] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);

  const isRecurrentTransfer = transferType === TransferTypes.RECURRENT_TRANSFER;

  const isEngineToken = tokenLayer === TokenLayers.ENGINE;
  const isSpkToken = tokenLayer === TokenLayers.SPK;

  const _handleTransferAction = debounce(
    () => {
      setIsTransfering(true);

      if (accountType === AUTH_TYPE.STEEM_CONNECT) {
        setHsTransfer(true);
      } else if (accountType === AUTH_TYPE.HIVE_AUTH) {
        const opArray = buildTransferOpsArray(transferType, {
          from,
          to: destination,
          amount,
          fundType,
          memo,
          tokenLayer,
          recurrence: isRecurrentTransfer ? +recurrence : null,
          executions: isRecurrentTransfer ? +executions : null,
        });
        hiveAuthModalRef.current.broadcastActiveOps(opArray);
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

  const _handleDeleteRecurrentTransfer = debounce(
    () => {
      setIsTransfering(true);
      // TODO: check if this need to accomodate HIVE_AUTH;
      if (accountType === AUTH_TYPE.STEEM_CONNECT) {
        setHsTransfer(true);
      } else {
        transferToAccount(from, destination, '0', memo, 24, 2);
      }
    },
    300,
    { trailing: true },
  );

  let path;

  if (hsTransfer) {
    // split to multiple destinations
    const destinations = destination.trim().split(/[\s,]+/); // Split by spaces or commas

    // handle engine transactions
    if (isEngineToken) {
      const json = getEngineActionJSON(
        transferType as EngineActions,
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
    }

    // handle spk transactions
    else if (isSpkToken) {
      // TODO: update this section as required
      // compose spk json
      const json = getSpkActionJSON(Number(amount), destination, memo);
      path = `sign/custom-json?authority=active&required_auths=%5B%22${
        selectedAccount.name
      }%22%5D&required_posting_auths=%5B%5D&id=${transferType}&json=${encodeURIComponent(
        JSON.stringify(json),
      )}`;
    } else if (transferType === TransferTypes.RECURRENT_TRANSFER) {
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
    } else if (transferType === TransferTypes.TRANSFER_FROM_SAVINGS) {
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
    } else if (transferType === TransferTypes.ECENCY_POINT_TRANSFER) {
      path = hiveuri
        .encodeOps(
          destinations.map((receiver) => [
            'custom_json',
            {
              required_auths: [selectedAccount.name],
              required_posting_auths: [],
              id: 'ecency_point_transfer',
              json: JSON.stringify({
                sender: selectedAccount.name,
                receiver,
                amount: `${Number(amount).toFixed(3)} ${fundType}`,
                memo,
              }),
            },
          ]),
        )
        .replace('hive://', '');

      path += '?authority=active'; // IMPORTANT: sets appropriate key to use with transaction signing
    } else {
      path = hiveuri
        .encodeOps(
          destinations.map((receiver) => [
            'transfer',
            { from: currentAccountName, to: receiver, amount: `${amount} ${fundType}`, memo },
          ]),
        )
        .replace('hive://', '');
    }

    console.log('path is: ', path);
  }

  const _onNextPress = (deleteTransfer = false) => {
    if (balance < amount) {
      Alert.alert(intl.formatMessage({ id: 'wallet.low_liquidity' }));

      return false;
    } else {
      SheetManager.show(SheetNames.ACTION_MODAL, {
        payload: {
          title: intl.formatMessage({ id: 'transfer.information' }),
          buttons: [
            {
              text: intl.formatMessage({ id: 'alert.cancel' }),
              onPress: () => {
                console.log('cancel pressed');
              },
            },
            {
              text: intl.formatMessage({ id: 'alert.confirm' }),
              onPress: deleteTransfer ? _handleDeleteRecurrentTransfer : _handleTransferAction,
            },
          ],
        },
      });
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
        newStartDate,
        newExecutions = '';

      if (existingRecurrentTransfer) {
        newMemo = existingRecurrentTransfer.memo;
        newAmount = parseToken(existingRecurrentTransfer.amount).toString();
        newRecurrence = existingRecurrentTransfer.recurrence.toString();
        newExecutions = `${existingRecurrentTransfer.remaining_executions}`;
        newStartDate = existingRecurrentTransfer.trigger_date;

        console.log('====================================');
        console.log('existingRecurrentTransfer');
        console.log('====================================');
        console.log(existingRecurrentTransfer);
      }
      setMemo(newMemo);
      setAmount(newAmount);
      setRecurrence(newRecurrence);
      setExecutions(newExecutions);
      setStartDate(newStartDate);

      return existingRecurrentTransfer;
    },
    [recurrentTransfers],
  );

  const allowMultipleDest =
    (tokenLayer === TokenLayers.HIVE && transferType === TransferTypes.TRANSFER) ||
    (tokenLayer === TokenLayers.POINTS && transferType === TransferTypes.ECENCY_POINT_TRANSFER);

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader
        title={intl.formatMessage({ id: `wallet.${transferType}` })}
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
            allowMultipleDest={allowMultipleDest}
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
            startDate={startDate}
            onNext={_onNextPress}
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

      <HiveAuthModal ref={hiveAuthModalRef} onClose={handleOnModalClose} />
    </SafeAreaView>
  );
};

export default injectIntl(TransferView);
