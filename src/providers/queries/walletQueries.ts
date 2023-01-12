import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { ASSET_IDS } from '../../constants/defaultAssets';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchAndSetCoinsData } from '../../redux/actions/walletActions';
import parseToken from '../../utils/parseToken';
import { getPointsSummary } from '../ecency/ePoint';
import { fetchUnclaimedRewards } from '../hive-engine/hiveEngine';
import { getAccount } from '../hive/dhive';
import QUERIES from './queryKeys';

/** hook used to return user drafts */
export const useGetAssetsQuery = () => {
  const dispatch = useAppDispatch();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const coinsData = useAppSelector((state) => state.wallet.coinsData);

  const refreshRef = useRef(Object.keys(coinsData).length > 0);

  return useQuery([QUERIES.WALLET.GET, currentAccount.username], async () => {
    try {
      await dispatch(fetchAndSetCoinsData(refreshRef.current));
    } catch (err) {
      console.warn('failed to get query response', err);
    }

    return true;
  });
};

export const useUnclaimedRewardsQuery = () => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  // Ecency unclaimed balance
  const _fetchUnclaimedPoints = async (username) => {
    const _rewardsCollection: RewardsCollection = {};
    try {
      const _pointsSummary = await getPointsSummary(username);
      const unclaimedPoints = parseFloat(_pointsSummary.unclaimed_points || '0');
      const unclaimedEstm = unclaimedPoints ? `${unclaimedPoints} Points` : '';
      _rewardsCollection[ASSET_IDS.ECENCY] = unclaimedEstm;
    } catch (err) {
      console.warn('failed to get unclaimed points', err);
    }

    return _rewardsCollection
  }


  // HP unclaimed balance
  const _fetchUnclaimedHive = async (username: string) => {
    // agggregate claim button text
    const _rewardsCollection: RewardsCollection = {};
    try {
      const userdata = await getAccount(username);
      const _getBalanceStr = (val: number, cur: string) =>
        val ? Math.round(val * 1000) / 1000 + cur : '';
      const unclaimedHp = [
        _getBalanceStr(parseToken(userdata.reward_hive_balance), ' HIVE'),
        _getBalanceStr(parseToken(userdata.reward_hbd_balance), ' HBD'),
        _getBalanceStr(parseToken(userdata.reward_vesting_hive), ' HP'),
      ].reduce(
        (prevVal, bal) => prevVal + (!bal ? '' : `${prevVal !== '' ? '   ' : ''}${bal}`),
        '',
      );
      _rewardsCollection[ASSET_IDS.HP] = unclaimedHp;
    } catch (err) {
      console.warn('failed to get unclaimed HIVE', err);
    }
    return _rewardsCollection;
  }


  //Engine unclaimed balance
  const _fetchUnclaimedEngine = async (username:string) => {
    const _rewardsCollection:RewardsCollection = {}
    try {
      const unclaimedEngine = await fetchUnclaimedRewards(username);
      unclaimedEngine.forEach((tokenStatus) => {
        const unclaimedBal = tokenStatus
          ? `${tokenStatus.pendingRewards} ${tokenStatus.symbol}`
          : '';
          _rewardsCollection[tokenStatus.symbol] = unclaimedBal;
      });
    } catch (err) {
      console.warn('failed to get unclaimed engine', err);
    }
    return _rewardsCollection;
  }


  const _fetchUnclaimedRewards = async () => {
    const rewardsCollection: RewardsCollection = {};

    const username = currentAccount?.username;
    if (!username) {
      return rewardsCollection;
    }

    const _unclaimedPoints = await _fetchUnclaimedPoints(username);
    const _unclaimedHive = await _fetchUnclaimedHive(username);
    const _unclaimedEngine = await _fetchUnclaimedEngine(username);


    return {
      ..._unclaimedPoints,
      ..._unclaimedHive,
      ..._unclaimedEngine
    };
  }

  return useQuery<RewardsCollection>(
    [QUERIES.WALLET.UNCLAIMED_GET, currentAccount.username],
    _fetchUnclaimedRewards
  );
};


interface RewardsCollection { [key: string]: string }
