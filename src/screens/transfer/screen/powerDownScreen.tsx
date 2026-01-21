import React, { Fragment, useState, useEffect, useRef, useCallback } from 'react';
import { Text, View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useIntl } from 'react-intl';
import Slider from '@esteemapp/react-native-slider';
import get from 'lodash/get';
import Animated, { BounceInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWithdrawRoutesQueryOptions } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import AUTH_TYPE from '../../../constants/authType';

import {
  BasicHeader,
  TransferFormItem,
  MainButton,
  Modal,
  BeneficiarySelectionContent,
  TextInput,
  HiveAuthModal,
} from '../../../components';
import WithdrawAccountModal from './withdrawAccountModal';

import parseToken from '../../../utils/parseToken';
import parseDate from '../../../utils/parseDate';
import { hpToVests, vestsToHp } from '../../../utils/conversions';
import { isEmptyDate, daysTillDate } from '../../../utils/time';

import styles from './transferStyles';
import { OptionsModal } from '../../../components/atoms';
import TransferTypes from '../../../constants/transferTypes';
import { buildTransferOpsArray } from '../../../utils/transactionOpsBuilder';

const PowerDownScreen = ({
  currentAccountName,
  selectedAccount,
  getAccountsWithUsername,
  transferType,
  hivePerMVests,
  handleOnModalClose,
  transferToAccount,
  accountType,
  setWithdrawVestingRoute,
}) => {
  const intl = useIntl();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState(0);
  const [hp, setHp] = useState(0.0);
  const [isTransfering, setIsTransfering] = useState(false);
  const [isOpenWithdrawAccount, setIsOpenWithdrawAccount] = useState(false);
  const [destinationAccounts, setDestinationAccounts] = useState([]);
  const [_disableDone, setDisableDone] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(false);

  const hiveAuthModalRef = useRef(null);
  const startActionSheet = useRef(null);
  const stopActionSheet = useRef(null);
  const amountTextInput = useRef(null);

  const fetchRoutes = useCallback(
    async (username) => {
      try {
        const res = await queryClient.fetchQuery(getWithdrawRoutesQueryOptions(username));
        const accounts = res.map((item) => ({
          username: item.to_account,
          percent: item.percent,
          autoPowerUp: item.auto_vest,
        }));
        setDestinationAccounts(accounts);
        return res;
      } catch (e) {
        Alert.alert(intl.formatMessage({ id: 'alert.error' }), e.message || e.toString());
      }
    },
    [queryClient, intl],
  );

  const handleHiveAuthModalClose = useCallback(() => {
    setIsTransfering(false);
    if (handleOnModalClose) {
      handleOnModalClose();
    }
  }, [handleOnModalClose]);

  const handleTransferAction = useCallback(() => {
    setIsTransfering(true);

    if (accountType === AUTH_TYPE.STEEM_CONNECT) {
      Alert.alert(
        intl.formatMessage({ id: 'alert.warning' }),
        intl.formatMessage({ id: 'transfer.sc_power_down_error' }),
      );
      setIsTransfering(false);
    } else if (accountType === AUTH_TYPE.HIVE_AUTH) {
      const opArray = buildTransferOpsArray(TransferTypes.WITHDRAW_VESTING, {
        from: currentAccountName,
        to: destinationAccounts,
        amount: amount.toFixed(6),
        fundType: 'VESTS',
      });
      hiveAuthModalRef.current?.broadcastActiveOps(opArray);
      // Loading state will be cleared by handleHiveAuthModalClose
    } else {
      transferToAccount(currentAccountName, destinationAccounts, amount, '')
        .then(() => {
          setIsTransfering(false);
        })
        .catch((error) => {
          setIsTransfering(false);
          Alert.alert(intl.formatMessage({ id: 'alert.error' }), error.message || error.toString());
        });
    }
  }, [accountType, intl, currentAccountName, destinationAccounts, amount, transferToAccount]);

  const validateHP = useCallback(
    ({ value, availableVestingShares }) => {
      const totalHP = vestsToHp(availableVestingShares, hivePerMVests).toFixed(3);
      const parsedHpValue = parseFloat(value.toString().replace(',', '.'));
      const amountValid = !(
        Number.isNaN(parsedHpValue) ||
        parsedHpValue < 0.0 ||
        parsedHpValue > totalHP
      );
      return amountValid;
    },
    [hivePerMVests],
  );

  const handleAmountChange = useCallback(
    ({ hpValue, availableVestingShares }) => {
      const parsedValue = parseFloat(hpValue.toString().replace(',', '.'));
      const vestsForHp = hpToVests(parsedValue, hivePerMVests);
      const totalHP = vestsToHp(availableVestingShares, hivePerMVests).toFixed(3);

      if (Number.isNaN(parsedValue)) {
        setAmount(0);
        setHp(0.0);
        setIsAmountValid(false);
      } else if (parsedValue > totalHP) {
        setAmount(availableVestingShares);
        setHp(totalHP);
        setIsAmountValid(false);
      } else {
        setAmount(vestsForHp);
        setHp(parsedValue);
        setIsAmountValid(true);
      }
    },
    [hivePerMVests],
  );

  const handleSliderAmountChange = useCallback(
    ({ value, availableVestingShares }) => {
      const hpValue = vestsToHp(value, hivePerMVests).toFixed(3);
      const isValid = value !== 0 && value <= availableVestingShares;
      setAmount(value);
      setHp(hpValue);
      setIsAmountValid(isValid);
    },
    [hivePerMVests],
  );

  const removeDestinationAccount = useCallback(
    (account) => {
      setDestinationAccounts((prev) => prev.filter((item) => item.username !== account.username));
      setWithdrawVestingRoute(currentAccountName, account.username, 0, false);
    },
    [setWithdrawVestingRoute, currentAccountName],
  );

  const handleOnSubmit = useCallback(
    (username, percent, autoPowerUp) => {
      // Check if account already exists before updating state
      if (destinationAccounts.some((item) => item.username === username)) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage({ id: 'alert.same_user' }),
        );
        return;
      }

      // Update state first
      const newAccounts = [...destinationAccounts, { username, percent, autoPowerUp }];
      setDestinationAccounts(newAccounts);

      // Then perform side effects
      setWithdrawVestingRoute(currentAccountName, username, percent, autoPowerUp);
      setIsOpenWithdrawAccount(false);
    },
    [destinationAccounts, setWithdrawVestingRoute, currentAccountName, intl],
  );

  useEffect(() => {
    if (!currentAccountName) return;
    fetchRoutes(currentAccountName);
  }, [currentAccountName, fetchRoutes]);

  let poweringDownVests = 0;
  let availableVestingShares = 0;
  let poweringDownFund = 0;

  const poweringDown = !isEmptyDate(get(selectedAccount, 'next_vesting_withdrawal'));
  const nextPowerDown = parseDate(get(selectedAccount, 'next_vesting_withdrawal'));

  if (poweringDown) {
    poweringDownVests = parseToken(get(selectedAccount, 'vesting_withdraw_rate'));
    poweringDownFund = vestsToHp(poweringDownVests, hivePerMVests).toFixed(3);
  } else {
    availableVestingShares =
      parseToken(get(selectedAccount, 'vesting_shares')) -
      (Number(get(selectedAccount, 'to_withdraw')) - Number(get(selectedAccount, 'withdrawn'))) /
        1e6 -
      parseToken(get(selectedAccount, 'delegated_vesting_shares'));
  }

  const spCalculated = vestsToHp(amount, hivePerMVests);
  const fundPerWeek = Math.round((spCalculated / 13) * 1000) / 1000;
  const totalHP = vestsToHp(availableVestingShares, hivePerMVests);

  const renderBeneficiarySelectionContent = () => {
    const powerDownBeneficiaries = destinationAccounts?.map((item) => ({
      account: item.username,
      weight: item.percent * 100,
      autoPowerUp: item.autoPowerUp,
    }));

    const handleSaveBeneficiary = (beneficiaries) => {
      const accounts = beneficiaries.map((item) => ({
        username: item.account,
        percent: item.weight / 100,
        autoPowerUp: item.autoPowerUp,
      }));
      const latestDestinationAccount = accounts[accounts.length - 1];
      if (latestDestinationAccount.username && latestDestinationAccount.percent) {
        handleOnSubmit(
          latestDestinationAccount.username,
          latestDestinationAccount.percent,
          latestDestinationAccount.autoPowerUp,
        );
      }
    };

    const handleRemoveBeneficiary = (beneficiary) => {
      if (beneficiary) {
        const beneficiaryAccount = {
          username: beneficiary.account,
          percent: beneficiary.weight / 100,
          autoPowerUp: beneficiary.autoPowerUp,
        };
        removeDestinationAccount(beneficiaryAccount);
      }
    };

    return (
      <View style={styles.beneficiaryContainer}>
        <BeneficiarySelectionContent
          label={intl.formatMessage({ id: 'transfer.withdraw_accounts' })}
          labelStyle={{ ...styles.sectionHeading, paddingLeft: 0 }}
          setDisableDone={setDisableDone}
          powerDown={true}
          powerDownBeneficiaries={powerDownBeneficiaries}
          handleSaveBeneficiary={handleSaveBeneficiary}
          handleRemoveBeneficiary={handleRemoveBeneficiary}
        />
      </View>
    );
  };

  const renderAmountInput = (placeholder, maxVests) => (
    <TextInput
      style={[styles.amountInput, !isAmountValid && styles.error]}
      onChangeText={(value) => {
        setHp(value.replace(',', '.'));
        setIsAmountValid(validateHP({ value, availableVestingShares: maxVests }));
      }}
      value={hp.toString()}
      placeholder={placeholder}
      placeholderTextColor="#c1c5c7"
      autoCapitalize="none"
      multiline={false}
      keyboardType="decimal-pad"
      innerRef={amountTextInput}
      blurOnSubmit={true}
      returnKeyType="done"
      onEndEditing={(e) =>
        handleAmountChange({ hpValue: e.nativeEvent.text, availableVestingShares: maxVests })
      }
    />
  );

  const renderSlider = () => (
    <View style={styles.sliderBox}>
      <View style={styles.emptyBox} />
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          trackStyle={styles.track}
          thumbStyle={styles.thumb}
          minimumTrackTintColor="#357ce6"
          thumbTintColor="#007ee5"
          maximumValue={availableVestingShares}
          value={amount}
          onValueChange={(value) => handleSliderAmountChange({ value, availableVestingShares })}
        />
        <View style={styles.sliderAmountContainer}>
          <Text style={styles.amountText}>{`MAX  ${totalHP.toFixed(3)} HP`}</Text>
        </View>
      </View>
    </View>
  );

  const renderMiddleContent = () => (
    <Animated.View entering={BounceInRight.duration(500).delay(300)}>
      <View style={styles.stepTwoContainer}>
        <Text style={styles.sectionHeading}>
          {intl.formatMessage({ id: 'transfer.power_down_amount_head' })}
        </Text>
        <View style={styles.alreadyDelegateRow}>
          <Text style={styles.sectionSubheading}>
            {intl.formatMessage({ id: 'transfer.power_down_amount_subhead' })}
          </Text>
        </View>

        <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.amount_hp' })}
          rightComponent={() =>
            renderAmountInput(intl.formatMessage({ id: 'transfer.amount' }), availableVestingShares)
          }
          containerStyle={styles.paddBottom}
        />
        {renderSlider()}
        <View style={styles.estimatedContainer}>
          <Text style={styles.leftEstimated} />
          <Text style={styles.rightEstimated}>
            {intl.formatMessage({ id: 'transfer.estimated_weekly' })} :
            {`+ ${fundPerWeek.toFixed(3)} HIVE`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderPowerDownInfo = () => {
    const days = daysTillDate(nextPowerDown);
    return (
      <View style={styles.powerDownInfoContainer}>
        <Text style={styles.sectionHeading}>
          {intl.formatMessage({ id: 'transfer.powering_down' })}
        </Text>
        <Text style={styles.sectionSubheading}>
          {`${intl.formatMessage({
            id: 'transfer.powering_down_subheading',
          })}\n${intl.formatMessage(
            { id: 'transfer.powering_down_info' },
            { days, hp: poweringDownFund },
          )}`}
        </Text>
      </View>
    );
  };

  const handleMainBtn = () => {
    if (validateHP({ value: hp, availableVestingShares })) {
      handleAmountChange({ hpValue: hp, availableVestingShares });
      startActionSheet.current.show();
    }
  };

  const renderBottomContent = () => (
    <View style={styles.bottomContent}>
      {!poweringDown && (
        <Fragment>
          <MainButton
            style={styles.button}
            isDisable={hp <= 0 || !isAmountValid}
            onPress={handleMainBtn}
            isLoading={isTransfering}
          >
            <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
          </MainButton>
        </Fragment>
      )}
      {poweringDown && (
        <MainButton
          style={styles.stopButton}
          onPress={() => stopActionSheet.current.show()}
          isLoading={isTransfering}
        >
          <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.stop' })}</Text>
        </MainButton>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader
        title={intl.formatMessage({ id: `wallet.${transferType}` })}
        backIconName="close"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.powerDownKeyboadrAvoidingContainer}
      >
        <ScrollView
          keyboardShouldPersistTaps="always"
          style={styles.scroll}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {!poweringDown && renderBeneficiarySelectionContent()}
          {!poweringDown && renderMiddleContent()}
          {poweringDown && renderPowerDownInfo()}
          {renderBottomContent()}
        </ScrollView>
      </KeyboardAvoidingView>
      <OptionsModal
        ref={startActionSheet}
        options={[
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'transfer.information' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => (index === 0 ? handleTransferAction() : null)}
      />
      <OptionsModal
        ref={stopActionSheet}
        options={[
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'transfer.stop_information' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            setAmount(0);
            handleTransferAction();
          }
        }}
      />
      <Modal
        isOpen={isOpenWithdrawAccount}
        isCloseButton
        isFullScreen
        title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        handleOnModalClose={() => setIsOpenWithdrawAccount(false)}
      >
        <WithdrawAccountModal
          getAccountsWithUsername={getAccountsWithUsername}
          handleOnSubmit={handleOnSubmit}
        />
      </Modal>
      <HiveAuthModal ref={hiveAuthModalRef} onClose={handleHiveAuthModalClose} />
    </SafeAreaView>
  );
};

export default PowerDownScreen;
