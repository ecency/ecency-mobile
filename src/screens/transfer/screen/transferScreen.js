import React, { Fragment, useState, useRef } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

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
import { OptionsModal } from '../../../components/atoms';
import transferTypes from '../../../constants/transferTypes';

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
}) => {
  const [from, setFrom] = useState(currentAccountName);
  const [destination, setDestination] = useState(
    transferType === 'transfer_to_vesting' ||
      transferType === 'transfer_to_savings' ||
      transferType === 'withdraw_vesting' ||
      transferType === 'withdraw_hive' ||
      transferType === 'withdraw_hbd' ||
      transferType === 'convert'
      ? currentAccountName
      : transferType === 'purchase_estm'
      ? 'esteem.app'
      : '',
  );
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState(transferType === 'purchase_estm' ? 'estm-purchase' : '');
  const [isUsernameValid, setIsUsernameValid] = useState(
    !!(
      transferType === 'purchase_estm' ||
      transferType === 'transfer_to_vesting' ||
      transferType === 'transfer_to_savings' ||
      transferType === 'withdraw_vesting' ||
      transferType === 'withdraw_hive' ||
      transferType === 'withdraw_hbd' ||
      (transferType === 'convert' && currentAccountName)
    ),
  );
  const [hsTransfer, setHsTransfer] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);
  const confirm = useRef(null);

  const _handleTransferAction = () => {
    setIsTransfering(true);
    if (accountType === AUTH_TYPE.STEEM_CONNECT) {
      setHsTransfer(true);
    } else {
      transferToAccount(from, destination, amount, memo);
    }
  };

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

    if (transferType === transferTypes.TRANSFER_TO_SAVINGS) {
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
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({ id: `transfer.${transferType}` })}
        backIconName="close"
      />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps
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
          />
          <View style={styles.bottomContent}>
            <MainButton
              style={styles.button}
              isDisable={!(amount >= 0.001 && isUsernameValid)}
              onPress={() => confirm.current.show()}
              isLoading={isTransfering}
            >
              <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
            </MainButton>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <OptionsModal
        ref={confirm}
        options={[
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'transfer.information' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          index === 0 ? _handleTransferAction() : null;
        }}
      />
      {path && (
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
    </Fragment>
  );
};

export default injectIntl(TransferView);
