import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import get from 'lodash/get';
import { toastNotification } from '../redux/actions/uiAction';

// Dsteem
import { getAccount, claimRewardBalance } from '../providers/steem/dsteem';

// Utils
import { groomingWalletData, groomingTransactionData } from '../utils/wallet';
import parseToken from '../utils/parseToken';
import { vestsToSp } from '../utils/conversions';

const STEEM_DROPDOWN = ['transfer_token', 'transfer_to_saving', 'powerUp'];
const SBD_DROPDOWN = ['transfer_token', 'transfer_to_saving'];
const SAVING_STEEM_DROPDOWN = ['withdraw_steem'];
const SAVING_SBD_DROPDOWN = ['withdraw_sbd'];
const STEEM_POWER_DROPDOWN = ['delegate', 'power_down'];

const WalletContainer = ({
  children,
  currentAccount,
  globalProps,
  handleOnScroll,
  pinCode,
  selectedUser,
  setEstimatedWalletValue,
  steemPerMVests,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [userActivities, setUserActivities] = useState(null);
  const [sbdBalance, setSbdBalance] = useState(0);
  const [steemBalance, setSteemBalance] = useState(0);
  const [spBalance, setSpBalance] = useState(0);
  const [steemSavingBalance, setSteemSavingBalance] = useState(0);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const intl = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    _getWalletData(selectedUser);
  }, [_getWalletData, selectedUser]);

  useEffect(() => {
    _getWalletData(selectedUser);
  }, [_getWalletData, selectedUser]);

  useEffect(() => {
    setSbdBalance(Math.round(get(walletData, 'sbdBalance', 0) * 1000) / 1000);
    setSteemBalance(Math.round(get(walletData, 'balance', 0) * 1000) / 1000);
    setSteemSavingBalance(Math.round(get(walletData, 'savingBalance', 0) * 1000) / 1000);
    setSpBalance(
      Math.round(
        vestsToSp(get(walletData, 'vestingShares', 0), get(walletData, 'steemPerMVests', 0)) * 1000,
      ) / 1000,
    );
    setEstimatedValue(get(walletData, 'estimatedValue', 0));
  }, [walletData]);

  // Components functions

  const _getWalletData = useCallback(
    async _selectedUser => {
      const _walletData = await groomingWalletData(_selectedUser, globalProps);

      setWalletData(_walletData);
      setIsLoading(false);
      setUserActivities(
        get(_walletData, 'transactions', []).map(item =>
          groomingTransactionData(item, steemPerMVests, intl.formatNumber),
        ),
      );
      setEstimatedWalletValue && setEstimatedWalletValue(_walletData.estimatedValue);
    },
    [globalProps, intl.formatNumber, setEstimatedWalletValue, steemPerMVests],
  );

  const _isHasUnclaimedRewards = account => {
    return (
      parseToken(get(account, 'reward_steem_balance')) > 0 ||
      parseToken(get(account, 'reward_sbd_balance')) > 0 ||
      parseToken(get(account, 'reward_vesting_steem')) > 0
    );
  };

  const _claimRewardBalance = async () => {
    let isHasUnclaimedRewards;

    if (isClaiming) {
      return;
    }

    await setIsClaiming(true);

    getAccount(currentAccount.name)
      .then(account => {
        isHasUnclaimedRewards = _isHasUnclaimedRewards(account[0]);
        if (isHasUnclaimedRewards) {
          const {
            reward_steem_balance: steemBal,
            reward_sbd_balance: sbdBal,
            reward_vesting_balance: vestingBal,
          } = account[0];
          return claimRewardBalance(currentAccount, pinCode, steemBal, sbdBal, vestingBal);
        }
        setIsClaiming(false);
      })
      .then(() => getAccount(currentAccount.name))
      .then(account => {
        _getWalletData(account && account[0]);
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
      .then(account => {
        _getWalletData(account && account[0]);
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
    setRefreshing(true);

    getAccount(selectedUser.name)
      .then(account => {
        _getWalletData(account && account[0]);
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

  return (
    children &&
    children({
      claimRewardBalance: _claimRewardBalance,
      currentAccountUsername: currentAccount.name,
      handleOnWalletRefresh: _handleOnWalletRefresh,
      isClaiming: isClaiming,
      refreshing: refreshing,
      selectedUsername: get(selectedUser, 'name', ''),
      isLoading,
      walletData,
      steemPerMVests,
      userActivities,
      steemBalance,
      spBalance,
      sbdBalance,
      steemSavingBalance,
      estimatedValue,
      steemDropdown: STEEM_DROPDOWN,
      sbdDropdown: SBD_DROPDOWN,
      savingSteemDropdown: SAVING_STEEM_DROPDOWN,
      savingSbdDropdown: SAVING_SBD_DROPDOWN,
      steemPowerDropdown: STEEM_POWER_DROPDOWN,
    })
  );
};

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  globalProps: state.account.globalProps,
  steemPerMVests: state.account.globalProps.steemPerMVests,
});

export default connect(mapStateToProps)(WalletContainer);
