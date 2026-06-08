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
import { getAssetPrecision, toFixedNoExp, formatTokenQuantity } from '../../../utils/number';
import { SheetNames } from '../../../navigation/sheets';
import TokenLayers from '../../../constants/tokenLayers';
import { EngineActions } from '../../../providers/hive-engine/hiveEngine.types';
import { toastNotification } from '../../../redux/actions/uiAction';
import { dateToFormatted } from '../../../utils/time';

const normalizeScannedUsername = (value?: string) =>
  (value || '').trim().replace(/^@/, '').toLowerCase();

const extractUsernameFromScannedValue = (value: string) => {
  const scannedValue = value.trim();

  try {
    const decoded = hiveuri.decode(scannedValue);
    const operation = get(decoded, 'tx.operations[0]', []);
    const operationPayload = Array.isArray(operation) ? operation[1] : null;
    const username =
      get(operationPayload, 'to') ||
      get(operationPayload, 'receiver') ||
      get(operationPayload, 'username') ||
      get(operationPayload, 'account');
    if (username) {
      return normalizeScannedUsername(username);
    }
  } catch {
    // Non hive-uri QR values are handled below.
  }

  const queryMatch = scannedValue.match(/[?&](?:to|username|account)=([^&#]+)/i);
  if (queryMatch?.[1]) {
    try {
      return normalizeScannedUsername(decodeURIComponent(queryMatch[1]));
    } catch {
      return normalizeScannedUsername(queryMatch[1]);
    }
  }

  const profileMatch =
    scannedValue.match(/(?:^|\/)@([a-z0-9.-]+)/i) ||
    scannedValue.match(/(?:^|\/)(?:profile|user|account)\/([a-z0-9.-]+)/i);
  if (profileMatch?.[1]) {
    return normalizeScannedUsername(profileMatch[1]);
  }

  const username = normalizeScannedUsername(scannedValue);
  return /^[a-z0-9.-]{3,16}$/.test(username) ? username : '';
};

interface TransferViewProps {
  currentAccountName: string;
  transferType: string;
  getAccountsWithUsername: (username: string) => any;
  balance: number | string;
  transferToAccount: (
    from: string,
    destination: string,
    amount: string | number,
    memo?: string,
    recurrence?: string | number | null,
    executions?: string | number | null,
    transferType?: string,
  ) => void;
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
  fetchRecurrentTransfers?: (username: string) => void;
  recurrentTransfers?: any;
  tokenLayer?: string;
  tokenPrecision?: number;
  badActors?: Set<string>;
  setFundType?: (fundType: string) => void;
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
  tokenPrecision,
  badActors,
  setFundType,
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
  const [isScheduledTransfer, setIsScheduledTransfer] = useState(
    transferType === TransferTypes.RECURRENT_TRANSFER,
  );

  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [usersResult, setUsersResult] = useState<string[]>([]);
  const [hsTransfer, setHsTransfer] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);

  const destinationRef = useRef<string[]>([]);
  const hasInitializedRef = useRef(false);
  const dpRef = useRef();
  // Tracks the recipient whose existing on-chain schedule we last autofilled, so a
  // different recipient without a schedule can be reset without wiping manual input.
  const lastHydratedRecipientRef = useRef<string | null>(null);

  const oneTimeTransferType =
    transferType === TransferTypes.RECURRENT_TRANSFER ? TransferTypes.TRANSFER : transferType;
  const isRecurrentTransfer = isScheduledTransfer;
  const effectiveTransferType = isRecurrentTransfer
    ? TransferTypes.RECURRENT_TRANSFER
    : oneTimeTransferType;
  const isEngineToken = tokenLayer === TokenLayers.ENGINE;
  const isSpkToken = tokenLayer === TokenLayers.SPK;

  const destinationLocked = useMemo(() => {
    switch (oneTimeTransferType) {
      case TransferTypes.CONVERT:
      case TransferTypes.UNSTAKE:
      case TransferTypes.POWER_UP_SPK:
      case TransferTypes.POWER_DOWN_SPK:
        return true;
      default:
        return false;
    }
  }, [oneTimeTransferType]);

  const allowMultipleDest =
    !isRecurrentTransfer &&
    ((tokenLayer === TokenLayers.HIVE && effectiveTransferType === TransferTypes.TRANSFER) ||
      (tokenLayer === TokenLayers.POINTS &&
        effectiveTransferType === TransferTypes.ECENCY_POINT_TRANSFER) ||
      (tokenLayer === TokenLayers.ENGINE && effectiveTransferType === TransferTypes.TRANSFER));

  const showMemo =
    effectiveTransferType === TransferTypes.ECENCY_POINT_TRANSFER ||
    effectiveTransferType === TransferTypes.TRANSFER ||
    effectiveTransferType === TransferTypes.RECURRENT_TRANSFER ||
    effectiveTransferType === TransferTypes.TRANSFER_TO_SAVINGS ||
    effectiveTransferType === TransferTypes.TRANSFER_SPK ||
    effectiveTransferType === TransferTypes.TRANSFER_LARYNX;

  const displayFundType = fundType === 'POINT' ? 'Points' : fundType;
  const isNativeTokenLayer = !tokenLayer || tokenLayer === TokenLayers.HIVE;
  // Balance is '' (or nullish) while the container is fetching/refetching it; treat
  // that as a loading state rather than a usable 0 so the amount field stays usable
  // and no false low-liquidity alert fires before the real balance arrives.
  const isBalanceLoading = balance === '' || balance === undefined || balance === null;

  // Token switching is only available for basic transfers
  const canSwitchToken =
    !!setFundType &&
    (oneTimeTransferType === TransferTypes.TRANSFER ||
      transferType === TransferTypes.RECURRENT_TRANSFER) &&
    isNativeTokenLayer;
  const canScheduleTransfer =
    isNativeTokenLayer &&
    (oneTimeTransferType === TransferTypes.TRANSFER ||
      transferType === TransferTypes.RECURRENT_TRANSFER) &&
    (fundType === 'HIVE' || fundType === 'HBD');

  const scheduleOptions = useMemo(
    () => [
      intl.formatMessage({ id: 'transfer.one_time', defaultMessage: 'One Time' }),
      ...RECURRENCE_TYPES.map((item) => intl.formatMessage({ id: item.intlId })),
    ],
    [intl],
  );

  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const transferableTokens = ['HIVE', 'HBD'];

  const _onFundBadgePress = () => {
    if (!canSwitchToken) return;
    setShowTokenPicker(true);
  };

  const _onTokenSelect = (token: string) => {
    setShowTokenPicker(false);
    if (token !== fundType) {
      setFundType!(token);
      setAmount('');
    }
  };

  // --- Validation ---
  const _debouncedValidateUsername = useCallback(
    debounce(async (usernames: string[]) => {
      if (usernames.length === 0) {
        setIsUsernameValid(false);
        setUsersResult([]);
        return;
      }
      const maxUsernames = allowMultipleDest ? 50 : 5;
      if (usernames.length > maxUsernames) {
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
    [recurrentTransfers, allowMultipleDest],
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
  const _handleDestinationChange = useCallback(
    (val: string) => {
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
    },
    [_debouncedValidateUsername, allowMultipleDest],
  );

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

  const _handleScannedRecipient = useCallback(
    (value: string) => {
      const username = extractUsernameFromScannedValue(value);
      if (!username) {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'transfer.invalid_recipient_qr',
              defaultMessage: 'Could not find a username in this QR code.',
            }),
          ),
        );
        return;
      }
      _handleDestinationChange(username);
    },
    [dispatch, intl, _handleDestinationChange],
  );

  const _openQrScanner = useCallback(() => {
    SheetManager.show(SheetNames.QR_SCAN, {
      payload: {
        onScan: _handleScannedRecipient,
      },
    });
  }, [_handleScannedRecipient]);

  const _openFavorites = useCallback(async () => {
    const username = await SheetManager.show(SheetNames.TRANSFER_FAVORITES, {
      payload: { limit: 50 },
    });
    if (username) {
      _handleDestinationChange(username);
    }
  }, [_handleDestinationChange]);

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
    // Cap decimals to the asset's precision so an over-precise amount can never be
    // entered (HIVE/HBD/POINTS = 3, VESTS = 6; engine tokens allow up to 8).
    const maxDecimals = isEngineToken ? tokenPrecision ?? 8 : getAssetPrecision(fundType);
    const dotIndex = newValue.indexOf('.');
    if (dotIndex !== -1 && newValue.length - dotIndex - 1 > maxDecimals) {
      newValue = newValue.slice(0, dotIndex + 1 + maxDecimals);
    }
    const parsed = parseFloat(newValue);
    if (newValue === '' || newValue === '.' || Number.isNaN(parsed)) {
      setAmount(newValue);
    } else if (isBalanceLoading || parsed <= parseFloat(String(balance))) {
      setAmount(newValue);
    }
  };

  // Derived from `recurrence` (the single source of truth) — RECURRENCE_TYPES.hours
  // is numeric, so coerce the string state with +recurrence before matching.
  const recurrenceIndex = RECURRENCE_TYPES.findIndex((r) => r.hours === +recurrence);
  const scheduleSelectedIndex = isRecurrentTransfer ? Math.max(recurrenceIndex + 1, 1) : 0;

  useEffect(() => {
    const newSelectedIndex = RECURRENCE_TYPES.findIndex((r) => r.hours === +recurrence);
    if (newSelectedIndex > -1) {
      setRecurrence(`${RECURRENCE_TYPES[newSelectedIndex].hours}`);
    }
    if (dpRef?.current) {
      dpRef.current.select(isRecurrentTransfer ? Math.max(newSelectedIndex + 1, 1) : 0);
    }
  }, [recurrence, isRecurrentTransfer]);

  useEffect(() => {
    if (!isRecurrentTransfer) return;
    if (!recurrence) {
      setRecurrence(`${RECURRENCE_TYPES[0].hours}`);
    }
    if (!executions) {
      setExecutions('2');
    }
  }, [executions, isRecurrentTransfer, recurrence]);

  const _handleScheduleSelect = useCallback(
    (index: number) => {
      if (index === 0) {
        setIsScheduledTransfer(false);
        setRecurrence('');
        setExecutions('');
        setStartDate('');
        return;
      }

      const selectedRecurrence = RECURRENCE_TYPES[index - 1];
      if (!selectedRecurrence) return;

      setIsScheduledTransfer(true);
      setRecurrence(`${selectedRecurrence.hours}`);
      if (!executions) {
        setExecutions('2');
      }
    },
    [executions],
  );

  // --- Transfer Actions ---
  const _handleTransferAction = debounce(
    () => {
      if (isTransfering) return;
      setIsTransfering(true);

      if (accountType === AUTH_TYPE.STEEM_CONNECT) {
        setHsTransfer(true);
      } else if (accountType === AUTH_TYPE.HIVE_AUTH) {
        const opArray = buildTransferOpsArray(effectiveTransferType, {
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
          effectiveTransferType,
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
        transferToAccount(from, destination, '0', memo, 24, 2, TransferTypes.RECURRENT_TRANSFER);
      }
    },
    300,
    { trailing: true },
  );

  // --- HiveSigner Path ---
  let path;
  if (hsTransfer) {
    // Normalize the amount to the asset's on-chain precision before encoding the
    // hive-uri; this HiveSigner path previously sent the raw, unclamped user input.
    const hsNativeAmount = `${toFixedNoExp(amount, getAssetPrecision(fundType))} ${fundType}`;
    const hsEngineAmount = `${formatTokenQuantity(amount, tokenPrecision)} ${fundType}`;
    const destinations = destination
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);

    if (isEngineToken) {
      if (effectiveTransferType === TransferTypes.TRANSFER && destinations.length > 1) {
        path = hiveuri
          .encodeOps(
            destinations.map((receiver) => [
              'custom_json',
              {
                required_auths: [selectedAccount.name],
                required_posting_auths: [],
                id: 'ssc-mainnet-hive',
                json: JSON.stringify(
                  getEngineActionJSON(
                    EngineActions.TRANSFER,
                    receiver,
                    hsEngineAmount,
                    fundType,
                    memo,
                  ),
                ),
              },
            ]),
          )
          .replace('hive://', '');
        path += '?authority=active';
      } else {
        const json = getEngineActionJSON(
          effectiveTransferType as EngineActions,
          destination,
          hsEngineAmount,
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
    } else if (isSpkToken) {
      const json = getSpkActionJSON(Number(amount), destination, memo);
      path = `sign/custom-json?authority=active&required_auths=%5B%22${
        selectedAccount.name
      }%22%5D&required_posting_auths=%5B%5D&id=${effectiveTransferType}&json=${encodeURIComponent(
        JSON.stringify(json),
      )}`;
    } else if (effectiveTransferType === TransferTypes.RECURRENT_TRANSFER) {
      path = `sign/recurrent_transfer?from=${from}&to=${destination}&amount=${encodeURIComponent(
        hsNativeAmount,
      )}&memo=${encodeURIComponent(memo)}&recurrence=${recurrence}&executions=${executions}`;
    } else if (effectiveTransferType === TransferTypes.TRANSFER_TO_SAVINGS) {
      path = `sign/transfer_to_savings?from=${from}&to=${destination}&amount=${encodeURIComponent(
        hsNativeAmount,
      )}&memo=${encodeURIComponent(memo)}`;
    } else if (effectiveTransferType === TransferTypes.DELEGATE_VESTING_SHARES) {
      path = `sign/delegate_vesting_shares?delegator=${from}&delegatee=${destination}&vesting_shares=${encodeURIComponent(
        hsNativeAmount,
      )}`;
    } else if (effectiveTransferType === TransferTypes.TRANSFER_TO_VESTING) {
      path = `sign/transfer_to_vesting?from=${from}&to=${destination}&amount=${encodeURIComponent(
        hsNativeAmount,
      )}`;
    } else if (effectiveTransferType === TransferTypes.TRANSFER_FROM_SAVINGS) {
      path = `sign/transfer_from_savings?from=${from}&to=${destination}&amount=${encodeURIComponent(
        hsNativeAmount,
      )}&memo=${encodeURIComponent(memo ?? '')}&request_id=${new Date().getTime() >>> 0}`;
    } else if (effectiveTransferType === TransferTypes.CONVERT) {
      path = `sign/convert?owner=${from}&amount=${encodeURIComponent(hsNativeAmount)}&requestid=${
        new Date().getTime() >>> 0
      }`;
    } else if (effectiveTransferType === TransferTypes.WITHDRAW_VESTING) {
      path = `sign/withdraw_vesting?account=${from}&vesting_shares=${encodeURIComponent(
        hsNativeAmount,
      )}`;
    } else if (effectiveTransferType === TransferTypes.ECENCY_POINT_TRANSFER) {
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
                amount: hsNativeAmount,
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
            { from, to: receiver, amount: hsNativeAmount, memo },
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
    if (!isBalanceLoading && balance < amount * recipientCount) {
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

  const nextBtnDisabled = !(
    (isEngineToken ? amount > 0 : amount >= 0.001) &&
    isUsernameValid &&
    // Don't allow submit until the real balance has loaded (it is '' while fetching).
    !isBalanceLoading &&
    // Wait for the Engine token's precision to load so the amount can't be
    // broadcast with the fallback 8-decimal precision before it is known.
    (!isEngineToken || tokenPrecision !== undefined) &&
    (!isRecurrentTransfer || (!!recurrence && Number(executions) >= 2))
  );

  useEffect(() => {
    if (isRecurrentTransfer) {
      fetchRecurrentTransfers?.(currentAccountName);
    }
  }, [currentAccountName, fetchRecurrentTransfers, isRecurrentTransfer]);

  const _findRecurrentTransferOfUser = useCallback(
    (userToFind) => {
      if (!isRecurrentTransfer) {
        return false;
      }

      const existingRecurrentTransfer = (recurrentTransfers || []).find(
        (rt) => rt.to === userToFind,
      );

      if (!existingRecurrentTransfer) {
        // This recipient has no on-chain schedule. If the fields were autofilled
        // from a *different* recipient's existing schedule, reset them to a fresh
        // schedule so that recipient's amount/memo/cadence don't bleed onto this
        // one. Manually entered values (no prior autofill) are left untouched.
        if (lastHydratedRecipientRef.current && lastHydratedRecipientRef.current !== userToFind) {
          setMemo('');
          setAmount('');
          setRecurrence(`${RECURRENCE_TYPES[0].hours}`);
          setExecutions('2');
        }
        lastHydratedRecipientRef.current = null;
        setStartDate('');
        return false;
      }

      lastHydratedRecipientRef.current = userToFind;
      setIsScheduledTransfer(true);
      setMemo(existingRecurrentTransfer.memo);
      setAmount(parseToken(existingRecurrentTransfer.amount).toString());
      setRecurrence(existingRecurrentTransfer.recurrence.toString());
      setExecutions(`${existingRecurrentTransfer.remaining_executions}`);
      setStartDate(existingRecurrentTransfer.trigger_date);

      return existingRecurrentTransfer;
    },
    [isRecurrentTransfer, recurrentTransfers],
  );

  // When Schedule is enabled after a recipient is already validated, hydrate any
  // existing on-chain recurrent transfer for that recipient. The username-validation
  // autofill only runs while already in scheduled mode, so a user who picks the
  // recipient first and toggles Schedule afterwards would otherwise see the existing
  // schedule's executions/start date stay blank.
  useEffect(() => {
    if (isRecurrentTransfer && isUsernameValid && destination && !allowMultipleDest) {
      _findRecurrentTransferOfUser(destination);
    }
  }, [isRecurrentTransfer, recurrentTransfers]);

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
        title={intl.formatMessage({ id: `wallet.${oneTimeTransferType}` })}
        backIconName="close"
      />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        enableOnAndroid={true}
        extraScrollHeight={80}
        contentContainerStyle={styles.scrollContent}
      >
        {canScheduleTransfer && (
          <View style={styles.scheduleSection}>
            <Text style={styles.fieldLabel}>
              {intl.formatMessage({ id: 'transfer.schedule', defaultMessage: 'Schedule' })}
            </Text>
            <DropdownButton
              dropdownButtonStyle={styles.scheduleButton}
              rowTextStyle={styles.dropdownRowText}
              style={styles.dropdownWrapper}
              dropdownStyle={styles.dropdownMenu}
              textStyle={styles.scheduleButtonText}
              options={scheduleOptions}
              defaultText={scheduleOptions[0]}
              selectedOptionIndex={scheduleSelectedIndex}
              onSelect={_handleScheduleSelect}
              dropdownRef={dpRef}
            />
          </View>
        )}

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
                  <View style={styles.recipientInputControl}>
                    <TextInput
                      style={[styles.inputField, styles.recipientTextInput]}
                      onChangeText={_handleDestinationChange}
                      value={destination}
                      placeholder={intl.formatMessage({ id: 'transfer.to_placeholder' })}
                      placeholderTextColor="#c1c5c7"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <View style={styles.recipientActionButtons}>
                      <TouchableOpacity
                        style={styles.recipientActionButton}
                        onPress={_openFavorites}
                        activeOpacity={0.7}
                      >
                        <Icon
                          iconType="MaterialCommunityIcons"
                          name="account-circle-outline"
                          size={22}
                          color="#8d969e"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.recipientActionButton}
                        onPress={_openQrScanner}
                        activeOpacity={0.7}
                      >
                        <Icon
                          iconType="MaterialCommunityIcons"
                          name="qrcode-scan"
                          size={20}
                          color="#8d969e"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
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
            <TouchableOpacity
              style={styles.fundBadge}
              onPress={_onFundBadgePress}
              disabled={!canSwitchToken}
              activeOpacity={canSwitchToken ? 0.7 : 1}
            >
              <Text style={styles.fundBadgeText}>{displayFundType}</Text>
              {canSwitchToken && (
                <Icon
                  iconType="MaterialCommunityIcons"
                  name="chevron-down"
                  size={16}
                  color="#fff"
                  style={{ marginLeft: 4 }}
                />
              )}
            </TouchableOpacity>
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
        {effectiveTransferType === TransferTypes.CONVERT && (
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

      {/* Token Picker Overlay */}
      {showTokenPicker && (
        <TouchableOpacity
          style={styles.tokenPickerOverlay}
          activeOpacity={1}
          onPress={() => setShowTokenPicker(false)}
        >
          <View style={styles.tokenPickerContainer}>
            <Text style={styles.tokenPickerTitle}>
              {intl.formatMessage({ id: 'transfer.select_token', defaultMessage: 'Select Token' })}
            </Text>
            {transferableTokens.map((token) => (
              <TouchableOpacity
                key={token}
                style={[styles.tokenPickerItem, token === fundType && styles.tokenPickerItemActive]}
                onPress={() => _onTokenSelect(token)}
              >
                <Text
                  style={[
                    styles.tokenPickerItemText,
                    token === fundType && styles.tokenPickerItemTextActive,
                  ]}
                >
                  {token}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default TransferView;
