import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useIntl } from 'react-intl';
import { get, debounce } from 'lodash';
import { useDispatch } from 'react-redux';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as hiveuri from 'hive-uri';
import { SheetManager } from 'react-native-actions-sheet';
import { hsOptions } from '../../../constants/hsOptions';
import AUTH_TYPE from '../../../constants/authType';

import { BasicHeader, MainButton, Modal, TextInput, UserAvatar, Icon } from '../../../components';
import DropdownButton from '../../../components/dropdownButton';
import { RECURRENCE_TYPES } from '../../../components/transferAmountInputSection/transferAmountInputSection';

import styles from './transferStyles';
import TransferTypes from '../../../constants/transferTypes';
import { getEngineActionJSON } from '../../../providers/hive-engine/hiveEngineActions';
import { getSpkActionJSON, SPK_NODE_ECENCY } from '../../../providers/hive-spk/hiveSpk';
import parseToken from '../../../utils/parseToken';
import { buildTransferOpsArray } from '../../../utils/transactionOpsBuilder';
import { SheetNames } from '../../../navigation/sheets';
import TokenLayers from '../../../constants/tokenLayers';
import { EngineActions } from '../../../providers/hive-engine/hiveEngine.types';
import { toastNotification } from '../../../redux/actions/uiAction';
import { dateToFormatted } from '../../../utils/time';

interface TransferViewProps {
  currentAccountName: string;
  transferType: string;
  getAccountsWithUsername: (username: string) => any;
  balance: number | string;
  transferToAccount: (params: any) => void;
  accountType: string;
  accounts: any[];
  handleOnModalClose: () => void;
  fundType: string;
  selectedAccount: any;
  fetchBalance: (username: string) => void;
  spkMarkets: any;
  referredUsername?: string;
  initialAmount?: string | number;
  initialMemo?: string;
  fetchRecurrentTransfers?: () => void;
  recurrentTransfers?: any;
  tokenLayer?: string;
  badActors?: Set<string>;
}

const TransferView = ({
  currentAccountName,
  transferType,
  getAccountsWithUsername,
  balance,
  transferToAccount,
  accountType,
  accounts: _accounts,
  handleOnModalClose,
  fundType,
  selectedAccount,
  fetchBalance: _fetchBalance,
  spkMarkets,
  referredUsername,
  initialAmount,
  initialMemo,
  fetchRecurrentTransfers,
  recurrentTransfers,
  tokenLayer,
  badActors,
}: TransferViewProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [from] = useState(currentAccountName);
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

  const [amount, setAmount] = useState(initialAmount != null ? `${initialAmount}` : '');
  const [memo, setMemo] = useState(
    transferType === 'purchase_estm' ? 'estm-purchase' : initialMemo,
  );
  const [recurrence, setRecurrence] = useState('');
  const [executions, setExecutions] = useState('');
  const [startDate, setStartDate] = useState('');

  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [usersResult, setUsersResult] = useState<string[]>([]);
  const [hsTransfer, setHsTransfer] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);

  const destinationRef = useRef<string[]>([]);
  const hasInitializedRef = useRef(false);
  const dpRef = useRef();

  const isRecurrentTransfer = transferType === TransferTypes.RECURRENT_TRANSFER;
  const isEngineToken = tokenLayer === TokenLayers.ENGINE;
  const isSpkToken = tokenLayer === TokenLayers.SPK;

  const destinationLocked = useMemo(() => {
    switch (transferType) {
      case TransferTypes.CONVERT:
      case TransferTypes.UNSTAKE:
      case TransferTypes.POWER_UP_SPK:
      case TransferTypes.POWER_DOWN_SPK:
        return true;
      default:
        return false;
    }
  }, [transferType]);

  const allowMultipleDest =
    (tokenLayer === TokenLayers.HIVE && transferType === TransferTypes.TRANSFER) ||
    (tokenLayer === TokenLayers.POINTS && transferType === TransferTypes.ECENCY_POINT_TRANSFER);

  const showMemo =
    transferType === TransferTypes.ECENCY_POINT_TRANSFER ||
    transferType === TransferTypes.TRANSFER ||
    transferType === TransferTypes.RECURRENT_TRANSFER ||
    transferType === TransferTypes.TRANSFER_TO_SAVINGS ||
    transferType === TransferTypes.TRANSFER_SPK ||
    transferType === TransferTypes.TRANSFER_LARYNX;

  const displayFundType = fundType === 'POINT' ? 'Points' : fundType;

  // --- Validation ---
  const _debouncedValidateUsername = useCallback(
    debounce(async (usernames: string[]) => {
      if (usernames.length === 0) {
        setIsUsernameValid(false);
        setUsersResult([]);
        return;
      }
      if (usernames.length > 5) {
        dispatch(toastNotification(intl.formatMessage({ id: 'transfer.too_many_usernames' })));
        setIsUsernameValid(false);
        setUsersResult([]);
        return;
      }

      // For single username, fetch suggestions for dropdown
      if (usernames.length === 1) {
        try {
          const users = await getAccountsWithUsername(usernames[0].trim());
          setUsersResult([...users]);
          const _isValid = users.includes(usernames[0]);
          if (_isValid) {
            _findRecurrentTransferOfUser(usernames[0]);
          }
          if (usernames.toString() !== destinationRef.current.toString()) {
            return;
          }
          setIsUsernameValid(_isValid);
        } catch {
          setUsersResult([]);
          setIsUsernameValid(false);
        }
        return;
      }

      // Multiple usernames — validate each
      const validationResults = await Promise.all(
        usernames.map(async (username) => {
          try {
            const users = await getAccountsWithUsername(username.trim());
            const _isValid = users.includes(username);
            if (_isValid) {
              _findRecurrentTransferOfUser(username);
            }
            return _isValid;
          } catch (error) {
            return false;
          }
        }),
      );

      setUsersResult([]);

      if (usernames.toString() !== destinationRef.current.toString()) {
        return;
      }

      setIsUsernameValid(validationResults.every((result) => result));
    }, 300),
    [recurrentTransfers],
  );

  // --- Validate prefilled destination on mount ---
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    if (destination) {
      const usernames = destination
        .trim()
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(Boolean);
      destinationRef.current = allowMultipleDest ? usernames : [usernames[0]].filter(Boolean);
      _debouncedValidateUsername(destinationRef.current);
    }
  }, [destination, allowMultipleDest, _debouncedValidateUsername]);

  // --- Handlers ---
  const _handleDestinationChange = (val: string) => {
    const trimmedLowercase = val.trim().toLowerCase();
    const usernames = trimmedLowercase ? trimmedLowercase.split(/[\s,]+/).filter(Boolean) : [];
    setIsUsernameValid(false);
    _debouncedValidateUsername(
      allowMultipleDest ? usernames : trimmedLowercase ? [trimmedLowercase] : [],
    );
    destinationRef.current = allowMultipleDest
      ? usernames
      : trimmedLowercase
      ? [trimmedLowercase]
      : [];
    setDestination(trimmedLowercase);
  };

  const _handleUserSelect = useCallback(
    (username: string) => {
      if (username === from) {
        Alert.alert(
          intl.formatMessage({ id: 'transfer.username_alert' }),
          intl.formatMessage({ id: 'transfer.username_alert_detail' }),
        );
        return;
      }
      setDestination(username);
      destinationRef.current = [username];
      setUsersResult([]);
      setIsUsernameValid(true);
    },
    [from, intl],
  );

  const _renderSuggestionItem = useCallback(
    ({ item: username }) => (
      <TouchableOpacity onPress={() => _handleUserSelect(username)} style={styles.usersDropItemRow}>
        <UserAvatar username={username} noAction />
        <Text style={styles.usersDropItemRowText}>{username}</Text>
      </TouchableOpacity>
    ),
    [_handleUserSelect],
  );

  const _handleAmountChange = (val: string | number) => {
    let newValue = String(val);
    if (newValue.includes(',')) {
      newValue = newValue.replace(',', '.');
    }
    const parsed = parseFloat(newValue);
    if (newValue === '' || newValue === '.' || Number.isNaN(parsed)) {
      setAmount(newValue);
    } else if (parsed <= parseFloat(String(balance))) {
      setAmount(newValue);
    }
  };

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
  }, [recurrence]);

  // --- Transfer Actions ---
  const _handleTransferAction = debounce(
    () => {
      if (isTransfering) return;
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
        SheetManager.show(SheetNames.HIVE_AUTH_BROADCAST, {
          payload: { operations: opArray },
        })
          .then((response) => {
            if (response?.success) {
              handleOnModalClose();
            } else {
              if (response?.error) {
                console.error('[Transfer] HiveAuth broadcast failed:', response.error);
              }
              setIsTransfering(false);
            }
          })
          .catch((error) => {
            console.error('[Transfer] HiveAuth broadcast failed:', error);
            setIsTransfering(false);
          });
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
      if (accountType === AUTH_TYPE.STEEM_CONNECT) {
        setHsTransfer(true);
      } else {
        transferToAccount(from, destination, '0', memo, 24, 2);
      }
    },
    300,
    { trailing: true },
  );

  // --- HiveSigner Path ---
  let path;
  if (hsTransfer) {
    const destinations = destination.trim().split(/[\s,]+/);

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
    } else if (isSpkToken) {
      const json = getSpkActionJSON(Number(amount), destination, memo);
      path = `sign/custom-json?authority=active&required_auths=%5B%22${
        selectedAccount.name
      }%22%5D&required_posting_auths=%5B%5D&id=${transferType}&json=${encodeURIComponent(
        JSON.stringify(json),
      )}`;
    } else if (transferType === TransferTypes.RECURRENT_TRANSFER) {
      path = `sign/recurrent_transfer?from=${from}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}&recurrence=${recurrence}&executions=${executions}`;
    } else if (transferType === TransferTypes.TRANSFER_TO_SAVINGS) {
      path = `sign/transfer_to_savings?from=${from}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}`;
    } else if (transferType === TransferTypes.DELEGATE_VESTING_SHARES) {
      path = `sign/delegate_vesting_shares?delegator=${from}&delegatee=${destination}&vesting_shares=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (transferType === TransferTypes.TRANSFER_TO_VESTING) {
      path = `sign/transfer_to_vesting?from=${from}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}`;
    } else if (transferType === TransferTypes.TRANSFER_FROM_SAVINGS) {
      path = `sign/transfer_from_savings?from=${from}&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&request_id=${new Date().getTime() >>> 0}`;
    } else if (transferType === TransferTypes.CONVERT) {
      path = `sign/convert?owner=${from}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&requestid=${new Date().getTime() >>> 0}`;
    } else if (transferType === TransferTypes.WITHDRAW_VESTING) {
      path = `sign/withdraw_vesting?account=${from}&vesting_shares=${encodeURIComponent(
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
      path += '?authority=active';
    } else {
      path = hiveuri
        .encodeOps(
          destinations.map((receiver) => [
            'transfer',
            { from, to: receiver, amount: `${amount} ${fundType}`, memo },
          ]),
        )
        .replace('hive://', '');
    }
  }

  // --- Confirmation ---
  const _showConfirmSheet = async () => {
    const action = await SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: intl.formatMessage({ id: 'transfer.information' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            returnValue: 'cancel',
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            returnValue: 'confirm',
          },
        ],
      },
    });
    return action === 'confirm';
  };

  const _onNextPress = async () => {
    const parsedDestinations = destination
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);
    const recipientCount = allowMultipleDest ? parsedDestinations.length : 1;
    if (allowMultipleDest && parsedDestinations.length === 0) {
      return false;
    }
    if (balance < amount * recipientCount) {
      Alert.alert(intl.formatMessage({ id: 'wallet.low_liquidity' }));
      return false;
    }
    if (await _showConfirmSheet()) {
      _handleTransferAction();
    }
  };

  const _onDeletePress = async () => {
    if (await _showConfirmSheet()) {
      _handleDeleteRecurrentTransfer();
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

  const badActorUsername = useMemo(() => {
    if (!destination || !badActors) return null;
    const usernames = destination
      .trim()
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean);
    return usernames.find((u) => badActors.has(u)) || null;
  }, [destination, badActors]);

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader
        title={intl.formatMessage({ id: `wallet.${transferType}` })}
        backIconName="close"
      />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        enableOnAndroid={true}
        extraScrollHeight={80}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Recipient Section --- */}
        {!destinationLocked && (
          <View style={styles.recipientSection}>
            <View style={styles.recipientInputRow}>
              <UserAvatar username={from} size="large" noAction />
              <Icon style={styles.arrowIcon} name="arrow-forward" iconType="MaterialIcons" />
              {destinationRef.current.length > 0 && (
                <View style={styles.recipientAvatars}>
                  {destinationRef.current.map((username, index) => (
                    <UserAvatar
                      key={username}
                      username={username}
                      size="large"
                      style={index > 0 ? { marginLeft: -12 } : undefined}
                      noAction
                    />
                  ))}
                </View>
              )}
              <View style={styles.recipientInputWrapper}>
                {transferType === TransferTypes.DELEGATE_SPK ? (
                  <DropdownButton
                    dropdownButtonStyle={styles.inputField}
                    rowTextStyle={styles.dropdownRowText}
                    style={styles.dropdownWrapper}
                    dropdownStyle={styles.dropdownMenu}
                    textStyle={styles.inputText}
                    options={spkMarkets.map((market) => market.name)}
                    defaultText={SPK_NODE_ECENCY}
                    selectedOptionIndex={0}
                    onSelect={(_index, value) => _handleDestinationChange(value)}
                  />
                ) : (
                  <TextInput
                    style={styles.inputField}
                    onChangeText={_handleDestinationChange}
                    value={destination}
                    placeholder={intl.formatMessage({ id: 'transfer.to_placeholder' })}
                    placeholderTextColor="#c1c5c7"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

                {destination !== '' && usersResult.length > 0 && !isUsernameValid && (
                  <View style={styles.suggestionsContainer}>
                    <FlatList
                      data={usersResult}
                      keyboardShouldPersistTaps="always"
                      renderItem={_renderSuggestionItem}
                      keyExtractor={(item) => `suggest-${item}`}
                      style={styles.suggestionsList}
                    />
                  </View>
                )}
              </View>
            </View>

            {badActorUsername && (
              <Text style={styles.badActorWarning}>
                {intl.formatMessage({ id: 'transfer.to_bad_actor' })}
              </Text>
            )}
          </View>
        )}

        {/* --- Amount Section --- */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{intl.formatMessage({ id: 'transfer.amount' })}</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.inputField, styles.amountInputLarge]}
              onChangeText={_handleAmountChange}
              value={amount}
              placeholder="0.000"
              placeholderTextColor="#c1c5c7"
              keyboardType="decimal-pad"
              autoCapitalize="none"
            />
            <View style={styles.fundBadge}>
              <Text style={styles.fundBadgeText}>{displayFundType}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.balanceRow} onPress={() => _handleAmountChange(balance)}>
            <Text style={styles.balanceText}>
              {intl.formatMessage({ id: 'transfer.amount_desc' })} {balance} {displayFundType}
            </Text>
            <Text style={styles.maxButton}>MAX</Text>
          </TouchableOpacity>
        </View>

        {/* --- Recurrent Transfer Fields --- */}
        {isRecurrentTransfer && (
          <View style={styles.fieldGroup}>
            {startDate && startDate !== '' && (
              <TouchableOpacity onPress={_onDeletePress}>
                <Text style={styles.deleteRecurrentText}>
                  {intl.formatMessage({ id: 'transfer.delete_recurrent_transfer' }) +
                    dateToFormatted(startDate, 'LL')}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.fieldLabel}>
              {intl.formatMessage({ id: 'transfer.recurrence' })}
            </Text>
            <DropdownButton
              dropdownButtonStyle={styles.inputField}
              rowTextStyle={styles.dropdownRowText}
              style={styles.dropdownWrapper}
              dropdownStyle={styles.dropdownMenu}
              textStyle={styles.inputText}
              options={RECURRENCE_TYPES.map((k) => intl.formatMessage({ id: k.intlId }))}
              defaultText={intl.formatMessage({ id: 'transfer.recurrence_placeholder' })}
              selectedOptionIndex={recurrenceIndex}
              onSelect={(index) => {
                setRecurrenceIndex(index);
                setRecurrence(RECURRENCE_TYPES[index].hours);
              }}
              dropdownRef={dpRef}
            />
            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
              {intl.formatMessage({ id: 'transfer.executions' })}
            </Text>
            <TextInput
              style={styles.inputField}
              onChangeText={setExecutions}
              value={executions}
              placeholder={intl.formatMessage({ id: 'transfer.executions_placeholder' })}
              placeholderTextColor="#c1c5c7"
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* --- Memo Section --- */}
        {showMemo && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{intl.formatMessage({ id: 'transfer.memo' })}</Text>
            <TextInput
              style={[styles.inputField, styles.memoInput]}
              onChangeText={setMemo}
              value={memo}
              placeholder={intl.formatMessage({ id: 'transfer.memo_placeholder' })}
              placeholderTextColor="#c1c5c7"
              autoCapitalize="none"
              multiline
              numberOfLines={3}
            />
            <Text style={styles.memoHint}>{intl.formatMessage({ id: 'transfer.memo_desc' })}</Text>
          </View>
        )}

        {/* --- Convert Description --- */}
        {transferType === TransferTypes.CONVERT && (
          <View style={styles.fieldGroup}>
            <Text style={styles.convertDesc}>
              {intl.formatMessage({ id: 'transfer.convert_desc' })}
            </Text>
          </View>
        )}

        {/* --- Submit Button --- */}
        <View style={styles.submitContainer}>
          <MainButton
            style={styles.submitButton}
            isDisable={nextBtnDisabled}
            onPress={_onNextPress}
            isLoading={isTransfering}
          >
            <Text style={styles.submitButtonText}>
              {intl.formatMessage({ id: 'transfer.next' })}
            </Text>
          </MainButton>
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
    </SafeAreaView>
  );
};

export default TransferView;
