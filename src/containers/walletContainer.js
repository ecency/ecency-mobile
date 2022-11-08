import React, { useState, useEffect, useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import get from 'lodash/get';
import { toastNotification } from '../redux/actions/uiAction';

// dhive
import { getAccount, claimRewardBalance, getBtcAddress } from '../providers/hive/dhive';

// Utils
import { groomingWalletData, groomingTransactionData, transferTypes } from '../utils/wallet';
import parseToken from '../utils/parseToken';
import { vestsToHp } from '../utils/conversions';
import RootNavigation from '../navigation/rootNavigation';
import { getEstimatedAmount } from '../utils/vote';

// Constants
import ROUTES from '../constants/routeNames';
import { COIN_IDS } from '../constants/defaultCoins';

const HIVE_DROPDOWN = [
  'purchase_estm',
  'transfer_token',
  'transfer_to_savings',
  'transfer_to_vesting',
];
const BTC_DROPDOWN = ['transfer_token'];
const HBD_DROPDOWN = ['purchase_estm', 'transfer_token', 'transfer_to_savings', 'convert'];
const SAVING_HIVE_DROPDOWN = ['withdraw_hive'];
const SAVING_HBD_DROPDOWN = ['withdraw_hbd'];
const HIVE_POWER_DROPDOWN = ['delegate', 'power_down'];

const WalletContainer = ({
  children,
  currentAccount,
  coinSymbol,
  globalProps,
  handleOnScroll,
  pinCode,
  selectedUser,
  setEstimatedWalletValue,
  hivePerMVests,
  isPinCodeOpen,
  currency,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [hbdBalance, setHbdBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenAddress, setTokenAddress] = useState('');
  const [hiveBalance, setHiveBalance] = useState(0);
  const [hpBalance, setHpBalance] = useState(0);
  const [hiveSavingBalance, setHiveSavingBalance] = useState(0);
  const [hbdSavingBalance, setHbdSavingBalance] = useState(0);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [estimatedHiveValue, setEstimatedHiveValue] = useState(0);
  const [estimatedHbdValue, setEstimatedHbdValue] = useState(0);
  const [estimatedTokenValue, setEstimatedTokenValue] = useState(0);
  const [estimatedHpValue, setEstimatedHpValue] = useState(0);
  const [unclaimedBalance, setUnclaimedBalance] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [delegationsAmount, setDelegationsAmount] = useState(0);
  const [transferHistory, setTransferHistory] = useState([]);
  const intl = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    setEstimatedAmount(getEstimatedAmount(currentAccount, globalProps));
  }, [currentAccount, globalProps]);

  useEffect(() => {
    _getWalletData(selectedUser);
  }, [_getWalletData, selectedUser]);

  useEffect(() => {
    const _transferHistory = userActivities.filter((item) =>
      transferTypes.includes(get(item, 'textKey')),
    );

    setTransferHistory(_transferHistory);
    setHbdBalance(Math.round(get(walletData, 'hbdBalance', 0) * 1000) / 1000);
    setTokenBalance(Math.round(get(walletData, 'tokenBalance', 0) * 1000) / 1000);
    setTokenAddress(get(walletData, 'tokenAddress', ''));
    setHiveBalance(Math.round(get(walletData, 'balance', 0) * 1000) / 1000);
    setHiveSavingBalance(Math.round(get(walletData, 'savingBalance', 0) * 1000) / 1000);
    setHbdSavingBalance(Math.round(get(walletData, 'savingBalanceHbd', 0) * 1000) / 1000);
    setHpBalance(
      Math.round(
        vestsToHp(get(walletData, 'vestingShares', 0), get(walletData, 'hivePerMVests', 0)) * 1000,
      ) / 1000,
    );
    setEstimatedValue(get(walletData, 'estimatedValue', 0));
    setEstimatedHiveValue(get(walletData, 'estimatedHiveValue', 0));
    setEstimatedHbdValue(get(walletData, 'estimatedHbdValue', 0));
    setEstimatedTokenValue(get(walletData, 'estimatedTokenValue', 0));
    setEstimatedHpValue(get(walletData, 'estimatedHpValue', 0));
    setDelegationsAmount(
      vestsToHp(
        get(walletData, 'vestingSharesReceived', 0) - get(walletData, 'vestingSharesDelegated', 0),
        get(walletData, 'hivePerMVests', 0),
      ).toFixed(3),
    );

    if (
      get(walletData, 'rewardHiveBalance', 0) ||
      get(walletData, 'rewardHbdBalance', 0) ||
      get(walletData, 'rewardVestingHive', 0)
    ) {
      const getBalance = (val, cur) => (val ? Math.round(val * 1000) / 1000 + cur : '');

      setUnclaimedBalance(
        `${getBalance(get(walletData, 'rewardHiveBalance', 0), ' HIVE')} ${getBalance(
          get(walletData, 'rewardHbdBalance', 0),
          ' HBD',
        )} ${getBalance(get(walletData, 'rewardVestingHive', 0), ' HP')}`,
      );
    }
  }, [userActivities, walletData]);

  // Components functions

  const _getWalletData = useCallback(
    async (_selectedUser) => {
      const _walletData = await groomingWalletData(_selectedUser, globalProps, currency);

      setWalletData(_walletData);
      setIsLoading(false);
      setUserActivities(
        get(_walletData, 'transactions', []).map((item) =>
          groomingTransactionData(item, hivePerMVests),
        ),
      );
      setEstimatedWalletValue && setEstimatedWalletValue(_walletData.estimatedValue);
      const getBalance = (val, cur) => (val ? Math.round(val * 1000) / 1000 + cur : '');
      setUnclaimedBalance(
        `${getBalance(get(_walletData, 'rewardHiveBalance', 0), ' HIVE')} ${getBalance(
          get(_walletData, 'rewardHbdBalance', 0),
          ' HBD',
        )} ${getBalance(get(_walletData, 'rewardVestingHive', 0), ' HP')}`,
      );
    },
    [globalProps, setEstimatedWalletValue, hivePerMVests],
  );

  const _isHasUnclaimedRewards = (account) => {
    return (
      parseToken(get(account, 'reward_hive_balance')) > 0 ||
      parseToken(get(account, 'reward_hbd_balance')) > 0 ||
      parseToken(get(account, 'reward_vesting_hive')) > 0
    );
  };

  const _claimRewardBalance = async () => {
    let isHasUnclaimedRewards;

    if (isClaiming) {
      return;
    }

    await setIsClaiming(true);

    getAccount(currentAccount.name)
      .then((account) => {
        isHasUnclaimedRewards = _isHasUnclaimedRewards(account);
        if (isHasUnclaimedRewards) {
          const {
            reward_hive_balance: hiveBal,
            reward_hbd_balance: hbdBal,
            reward_vesting_balance: vestingBal,
          } = account;
          return claimRewardBalance(currentAccount, pinCode, hiveBal, hbdBal, vestingBal);
        }
        setIsClaiming(false);
      })
      .then(() => getAccount(currentAccount.name))
      .then((account) => {
        _getWalletData(selectedUser);
        if (isHasUnclaimedRewards) {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.claim_reward_balance_ok',
              }),
            ),
          );
        }
      })
      .then((account) => {
        _getWalletData(selectedUser);
        setIsClaiming(false);
      })
      .catch(() => {
        setIsClaiming(false);

        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
      });
  };

  const _handleOnWalletRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);

    getAccount(selectedUser.name)
      .then((account) => {
        _getWalletData(selectedUser);
        setRefreshing(false);
      })
      .catch(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
        setRefreshing(false);
      });
  };

  const _navigate = async (transferType, fundType) => {
    let balance;

    if (
      (transferType === 'transfer_token' || transferType === 'purchase_estm') &&
      fundType === 'HIVE'
    ) {
      balance = Math.round(walletData.balance * 1000) / 1000;
    }
    if (
      (transferType === 'transfer_token' ||
        transferType === 'convert' ||
        transferType === 'purchase_estm') &&
      fundType === 'HBD'
    ) {
      balance = Math.round(walletData.hbdBalance * 1000) / 1000;
    }
    if (transferType === 'withdraw_hive' && fundType === 'HIVE') {
      balance = Math.round(walletData.savingBalance * 1000) / 1000;
    }
    if (transferType === 'withdraw_hbd' && fundType === 'HBD') {
      balance = Math.round(walletData.savingBalanceHbd * 1000) / 1000;
    }

    if (isPinCodeOpen) {
      RootNavigation.navigate({
        name: ROUTES.SCREENS.PINCODE,
        params: {
          navigateTo: ROUTES.SCREENS.TRANSFER,
          navigateParams: { transferType, fundType, balance, tokenAddress },
        },
      });
    } else {
      RootNavigation.navigate({
        name: ROUTES.SCREENS.TRANSFER,
        params: { transferType, fundType, balance, tokenAddress },
      });
    }
  };

  const getTokenAddress = (tokenType) => {
    if (tokenType === 'BTC') {
      // console.log(getBtcAddress(pinCode, currentAccount));
    }
  };

  // process symbol based data
  let balance = 0;
  let estimateValue = 0;
  let savings = 0;
  switch (coinSymbol) {
    case COIN_IDS.HIVE:
      balance = hiveBalance;
      estimateValue = estimatedHiveValue;
      savings = hiveSavingBalance;
      break;
    case COIN_IDS.HBD:
      balance = hbdBalance;
      estimateValue = estimatedHbdValue;
      savings = hbdSavingBalance;
      break;

    default:
      break;
  }

  return (
    children &&
    children({
      claimRewardBalance: _claimRewardBalance,
      currentAccountUsername: currentAccount.name,
      handleOnWalletRefresh: _handleOnWalletRefresh,
      isClaiming,
      refreshing,
      selectedUsername: get(selectedUser, 'name', ''),
      isLoading,
      walletData,
      hivePerMVests,
      userActivities,
      transferHistory,
      hiveBalance,
      hpBalance,
      hbdBalance,
      tokenBalance,
      getTokenAddress,
      hiveSavingBalance,
      hbdSavingBalance,
      estimatedValue,
      estimatedHiveValue,
      estimatedHbdValue,
      estimatedTokenValue,
      estimatedHpValue,
      delegationsAmount,
      navigate: _navigate,
      hiveDropdown: HIVE_DROPDOWN,
      hbdDropdown: HBD_DROPDOWN,
      btcDropdown: BTC_DROPDOWN,
      savingHiveDropdown: SAVING_HIVE_DROPDOWN,
      savingHbdDropdown: SAVING_HBD_DROPDOWN,
      hivePowerDropdown: HIVE_POWER_DROPDOWN,
      unclaimedBalance: unclaimedBalance && unclaimedBalance.trim(),
      estimatedAmount,

      // symbol based data
      balance,
      estimateValue,
      savings,
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  globalProps: state.account.globalProps,
  currency: state.application.currency.currency,
  hivePerMVests: state.account.globalProps.hivePerMVests,
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default connect(mapStateToProps)(WalletContainer);
