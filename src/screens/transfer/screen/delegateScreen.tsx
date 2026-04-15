import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useIntl } from 'react-intl';
import Slider from '@react-native-community/slider';
import get from 'lodash/get';
import { debounce } from 'lodash';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
import { getVestingDelegationsQueryOptions } from '@ecency/sdk';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { BasicHeader, TextInput, MainButton, UserAvatar, Icon, Modal } from '../../../components';

import styles from './transferStyles';
import { hsOptions } from '../../../constants/hsOptions';
import { getQueryClient } from '../../../providers/queries';
import parseToken from '../../../utils/parseToken';
import { isEmptyDate } from '../../../utils/time';
import { hpToVests, vestsToHp } from '../../../utils/conversions';
import parseAsset from '../../../utils/parseAsset';
import { delay } from '../../../utils/editor';
import { SheetNames } from '../../../navigation/sheets';

interface DelegateScreenProps {
  currentAccountName: string;
  selectedAccount: any;
  getAccountsWithUsername: (username: string) => Promise<string[]>;
  transferToAccount: (...args: any[]) => Promise<void>;
  handleOnModalClose: () => void;
  hivePerMVests: number;
  referredUsername?: string;
  badActors?: Set<string>;
}

const DelegateScreen = ({
  currentAccountName,
  selectedAccount,
  getAccountsWithUsername,
  handleOnModalClose,
  hivePerMVests,
  referredUsername,
  badActors,
  transferToAccount,
}: DelegateScreenProps) => {
  const intl = useIntl();

  // --- State ---
  const [from] = useState(currentAccountName);
  const [destination, setDestination] = useState(referredUsername || '');
  const [hp, setHp] = useState(0.0);
  const [amount, setAmount] = useState(0); // VESTS
  const [delegatedHP, setDelegatedHP] = useState<number>(0);
  const [delegatedVests, setDelegatedVests] = useState<number>(0);
  const [isAmountValid, setIsAmountValid] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);
  const [usersResult, setUsersResult] = useState<string[]>([]);
  const [hasValidDestination, setHasValidDestination] = useState(false);
  const [steemConnectTransfer] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(true);

  // --- Refs ---
  const destinationRef = useRef<any>(null);
  const amountRef = useRef<any>(null);

  // --- Computed ---
  const availableVestingShares = useMemo(() => {
    if (!isEmptyDate(get(selectedAccount, 'next_vesting_withdrawal'))) {
      return (
        parseToken(get(selectedAccount, 'vesting_shares')) -
        (Number(get(selectedAccount, 'to_withdraw')) - Number(get(selectedAccount, 'withdrawn'))) /
          1e6 -
        parseToken(get(selectedAccount, 'delegated_vesting_shares'))
      );
    }
    return (
      parseToken(get(selectedAccount, 'vesting_shares')) -
      parseToken(get(selectedAccount, 'delegated_vesting_shares'))
    );
  }, [selectedAccount]);

  // The slider max must include the existing delegation to this specific user
  // because those VESTS are reclaimable (the chain interprets the op as the
  // new TOTAL delegation, not an incremental change).
  const effectiveMaxVests = availableVestingShares + delegatedVests;

  const totalHP = useMemo(
    () => vestsToHp(effectiveMaxVests, hivePerMVests),
    [effectiveMaxVests, hivePerMVests],
  );

  const isBadActor = destination && badActors?.has(destination.trim().toLowerCase());

  // --- Fetch existing delegation ---
  const fetchExistingDelegation = useCallback(
    async (delegatorUser: string, delegateeUser: string) => {
      if (!delegatorUser || !delegateeUser) {
        setDelegatedHP(0);
        setDelegatedVests(0);
        setHp(0);
        setAmount(0);
        setIsAmountValid(false);
        return;
      }

      try {
        const queryClient = getQueryClient();
        const limit = 1000;
        const queryOpts = getVestingDelegationsQueryOptions(delegatorUser, limit);

        const fetchAllPages = async (cursor = ''): Promise<any[]> => {
          const page = await queryClient.fetchQuery({
            ...queryOpts,
            queryKey: [...queryOpts.queryKey, cursor],
            queryFn: () => queryOpts.queryFn({ pageParam: cursor }),
          });
          if (page.length < limit) {
            return page;
          }
          const lastDelegatee = page[page.length - 1]?.delegatee;
          if (!lastDelegatee || lastDelegatee === cursor) {
            return page;
          }
          const rest = await fetchAllPages(lastDelegatee);
          return page.concat(rest);
        };

        const allDelegations = await fetchAllPages();

        if (allDelegations.length) {
          const curShare = allDelegations.find((item) => item.delegatee === delegateeUser);
          if (curShare) {
            const vestShares = parseAsset(curShare.vesting_shares);
            const hpValue = parseFloat(vestsToHp(vestShares.amount, hivePerMVests).toFixed(3));
            // Slider max must include the existing delegation since those VESTS
            // are reclaimable — availableVestingShares excludes ALL delegations.
            const effectiveMax = availableVestingShares + vestShares.amount;
            const maxHP = parseFloat(vestsToHp(effectiveMax, hivePerMVests).toFixed(3));
            const isValid = !(Number.isNaN(hpValue) || hpValue <= 0.001 || hpValue > maxHP);
            setDelegatedHP(hpValue);
            setDelegatedVests(vestShares.amount);
            setHp(hpValue);
            setAmount(vestShares.amount);
            setIsAmountValid(isValid);
          } else {
            setDelegatedHP(0);
            setDelegatedVests(0);
            setHp(0);
            setAmount(0);
            setIsAmountValid(false);
          }
        } else {
          setDelegatedHP(0);
          setDelegatedVests(0);
          setHp(0);
          setAmount(0);
          setIsAmountValid(false);
        }
      } catch (err) {
        console.warn(err);
        setDelegatedHP(0);
        setDelegatedVests(0);
        setHp(0);
        setAmount(0);
        setIsAmountValid(false);
      }
    },
    [hivePerMVests, availableVestingShares],
  );

  // --- Username validation (debounced) ---
  const debouncedValidate = useCallback(
    debounce(async (value: string) => {
      if (!value) {
        setUsersResult([]);
        setHasValidDestination(false);
        return;
      }
      try {
        const res = await getAccountsWithUsername(value);
        setUsersResult([...res]);
        const isValid = res.includes(value);
        setHasValidDestination(isValid);
        if (isValid) {
          fetchExistingDelegation(from, value);
        }
      } catch {
        setHasValidDestination(false);
      }
    }, 500),
    [from, fetchExistingDelegation, getAccountsWithUsername],
  );

  const handleDestinationChange = useCallback(
    (value: string) => {
      const lowercaseValue = value.toLowerCase();
      setDestination(lowercaseValue);
      setHasValidDestination(false);
      debouncedValidate(lowercaseValue);
    },
    [debouncedValidate],
  );

  const handleUserSelect = useCallback(
    (username: string) => {
      if (username === from) {
        Alert.alert(
          intl.formatMessage({ id: 'transfer.username_alert' }),
          intl.formatMessage({ id: 'transfer.username_alert_detail' }),
        );
        return;
      }

      setDestination(username);
      setUsersResult([]);
      setHasValidDestination(true);
      fetchExistingDelegation(from, username);
      destinationRef.current?.blur();
    },
    [from, intl, fetchExistingDelegation],
  );

  // --- Mount: validate referredUsername ---
  useEffect(() => {
    if (referredUsername) {
      getAccountsWithUsername(referredUsername)
        .then((res) => {
          if (res.includes(referredUsername)) {
            setHasValidDestination(true);
            fetchExistingDelegation(from, referredUsername);
          }
        })
        .catch(() => {
          setHasValidDestination(false);
        });
    } else {
      destinationRef.current?.focus();
    }
  }, [referredUsername, from, fetchExistingDelegation, getAccountsWithUsername]);

  // --- HP validation ---
  const validateHP = useCallback(
    (value: number) => {
      const maxHP = parseFloat(vestsToHp(effectiveMaxVests, hivePerMVests).toFixed(3));
      return !(Number.isNaN(value) || value <= 0.001 || value > maxHP);
    },
    [effectiveMaxVests, hivePerMVests],
  );

  // --- Amount handlers ---
  const handleHpInputChange = useCallback(
    (text: string) => {
      const cleaned = text.replace(',', '.');
      setHp(cleaned);
      const parsed = parseFloat(cleaned);
      setIsAmountValid(validateHP(parsed));
    },
    [validateHP],
  );

  const handleHpInputEnd = useCallback(
    (text: string) => {
      const parsed = parseFloat(text.replace(',', '.'));
      if (Number.isNaN(parsed)) {
        setAmount(0);
        setHp(0.0);
        setIsAmountValid(false);
      } else {
        const maxHP = parseFloat(vestsToHp(effectiveMaxVests, hivePerMVests).toFixed(3));
        if (parsed > maxHP) {
          setAmount(hpToVests(maxHP, hivePerMVests));
          setHp(maxHP);
          setIsAmountValid(true);
        } else {
          const vestsForHp = hpToVests(parsed, hivePerMVests);
          setAmount(vestsForHp);
          setHp(parsed);
          setIsAmountValid(validateHP(parsed));
        }
      }
    },
    [availableVestingShares, hivePerMVests, validateHP],
  );

  const handleSliderChange = useCallback(
    (value: number) => {
      const hpValue = vestsToHp(value, hivePerMVests).toFixed(3);
      const isValid = value !== 0 && value <= effectiveMaxVests;
      setAmount(value);
      setHp(hpValue);
      setIsAmountValid(isValid);
    },
    [effectiveMaxVests, hivePerMVests],
  );

  const handleSetMax = useCallback(() => {
    setAmount(effectiveMaxVests);
    setHp(totalHP.toFixed(3));
    setIsAmountValid(effectiveMaxVests > 0);
  }, [effectiveMaxVests, totalHP]);

  // --- Transfer ---
  const handleTransferAction = useCallback(async () => {
    if (isTransfering) return;
    setIsTransfering(true);

    try {
      await transferToAccount(from, destination, amount, '');
      setIsTransfering(false);
      handleOnModalClose?.();
    } catch (error) {
      setIsTransfering(false);
      Alert.alert(intl.formatMessage({ id: 'alert.error' }), error.message || error.toString());
    }
  }, [isTransfering, from, destination, amount, transferToAccount, handleOnModalClose, intl]);

  // --- Review / Confirm ---
  const handleReview = useCallback(async () => {
    const parsedHpValue = parseFloat(hp);
    const vestsForHp = hpToVests(parsedHpValue, hivePerMVests);
    const amountValid = validateHP(parsedHpValue);

    setHp(parsedHpValue);
    setIsAmountValid(amountValid);
    setAmount(vestsForHp);

    if (!amountValid) {
      Alert.alert(
        intl.formatMessage({ id: 'transfer.invalid_amount' }),
        intl.formatMessage({ id: 'transfer.invalid_amount_desc' }),
      );
      return;
    }

    amountRef.current?.blur();
    await delay(300);

    const body =
      intl.formatMessage(
        { id: 'transfer.confirm_summary' },
        {
          hp: parsedHpValue,
          vests: vestsForHp.toFixed(3),
          delegatee: from,
          delegator: destination,
        },
      ) +
      (delegatedHP
        ? `\n${intl.formatMessage({ id: 'transfer.confirm_summary_para' }, { prev: delegatedHP })}`
        : '');

    setConfirmModalOpen(true);
    try {
      const action = await SheetManager.show(SheetNames.ACTION_MODAL, {
        payload: {
          title: intl.formatMessage({ id: 'transfer.confirm' }),
          body,
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
          headerContent: (
            <View style={styles.recipientRow}>
              <UserAvatar username={from} size="xl" noAction />
              <Icon style={styles.arrowIcon} name="arrow-forward" iconType="MaterialIcons" />
              <UserAvatar username={destination} size="xl" noAction />
            </View>
          ),
        },
      });

      if (action === 'confirm') {
        handleTransferAction();
      }
    } finally {
      setConfirmModalOpen(false);
    }
  }, [hp, hivePerMVests, validateHP, intl, from, destination, delegatedHP, handleTransferAction]);

  // --- HiveSigner path (preserved for completeness) ---
  const fixedAmount = `${(amount || 0).toFixed ? amount.toFixed(6) : '0.000000'} VESTS`;
  const hsPath = `sign/delegate-vesting-shares?delegator=${from}&delegatee=${destination}&vesting_shares=${encodeURIComponent(
    fixedAmount,
  )}`;

  const isSubmitDisabled = !isAmountValid || !hasValidDestination;

  // --- Render suggestion item ---
  const renderSuggestionItem = useCallback(
    ({ item: username }) => (
      <TouchableOpacity onPress={() => handleUserSelect(username)} style={styles.usersDropItemRow}>
        <UserAvatar username={username} noAction />
        <Text style={styles.usersDropItemRowText}>{username}</Text>
      </TouchableOpacity>
    ),
    [handleUserSelect],
  );

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'transfer.delegate' })} backIconName="close" />

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        enableOnAndroid={true}
        extraScrollHeight={80}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Recipient Section --- */}
        <View style={styles.recipientSection}>
          <View style={styles.recipientInputRow}>
            <UserAvatar username={from} size="large" noAction />
            <Icon style={styles.arrowIcon} name="arrow-forward" iconType="MaterialIcons" />
            {destination ? <UserAvatar username={destination} size="large" noAction /> : null}
            <View style={styles.recipientInputWrapper}>
              <TextInput
                style={styles.inputField}
                onChangeText={handleDestinationChange}
                value={destination}
                placeholder={intl.formatMessage({ id: 'transfer.to_placeholder' })}
                placeholderTextColor="#c1c5c7"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                innerRef={destinationRef}
              />

              {destination !== '' && usersResult.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={usersResult}
                    keyboardShouldPersistTaps="always"
                    renderItem={renderSuggestionItem}
                    keyExtractor={(item) => `suggest-${item}`}
                    style={styles.suggestionsList}
                  />
                </View>
              )}
            </View>
          </View>

          {isBadActor && (
            <Text style={styles.badActorWarning}>
              {intl.formatMessage({ id: 'transfer.to_bad_actor' })}
            </Text>
          )}
        </View>

        {/* --- Existing Delegation Info --- */}
        {hasValidDestination && delegatedHP > 0 && (
          <View style={styles.delegationInfoRow}>
            <Text style={styles.delegationInfoLabel}>
              {intl.formatMessage({ id: 'transfer.already_delegated' })} @{destination}
            </Text>
            <Text style={styles.delegationInfoValue}>{delegatedHP} HP</Text>
          </View>
        )}

        {/* --- Amount Section --- */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{intl.formatMessage({ id: 'transfer.amount_hp' })}</Text>

          <View style={styles.amountRow}>
            <TextInput
              style={[
                styles.inputField,
                styles.amountInputLarge,
                !isAmountValid && hp > 0 && styles.inputError,
              ]}
              onChangeText={handleHpInputChange}
              value={hp.toString()}
              placeholder="0.000"
              placeholderTextColor="#c1c5c7"
              keyboardType="decimal-pad"
              autoCapitalize="none"
              innerRef={amountRef}
              blurOnSubmit={true}
              returnKeyType="done"
              selectTextOnFocus={true}
              onEndEditing={(e) => handleHpInputEnd(e.nativeEvent.text)}
            />
            <View style={styles.fundBadge}>
              <Text style={styles.fundBadgeText}>HP</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.balanceRow} onPress={handleSetMax}>
            <Text style={styles.balanceText}>
              {`${intl.formatMessage({ id: 'transfer.remain_hp' })}: ${totalHP.toFixed(3)} HP`}
            </Text>
            <Text style={styles.maxButton}>MAX</Text>
          </TouchableOpacity>
        </View>

        {/* --- Slider --- */}
        <View style={styles.fieldGroup}>
          <Slider
            minimumTrackTintColor="#357ce6"
            maximumTrackTintColor="#b1b1b1"
            thumbTintColor="#007ee5"
            maximumValue={effectiveMaxVests}
            value={amount}
            onValueChange={handleSliderChange}
          />
        </View>

        {/* --- Submit --- */}
        <View style={styles.submitContainer}>
          <MainButton
            style={styles.submitButton}
            onPress={handleReview}
            isLoading={isTransfering}
            isDisable={isSubmitDisabled}
          >
            <Text style={styles.submitButtonText}>
              {intl.formatMessage({ id: 'transfer.review' })}
            </Text>
          </MainButton>
        </View>
      </KeyboardAwareScrollView>

      {hsPath && !confirmModalOpen && (
        <Modal
          isOpen={steemConnectTransfer}
          isFullScreen
          isCloseButton
          handleOnModalClose={handleOnModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
          <WebView source={{ uri: `${hsOptions.base_url}${hsPath}` }} />
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default DelegateScreen;
