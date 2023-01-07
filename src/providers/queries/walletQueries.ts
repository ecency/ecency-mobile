import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { ASSET_IDS } from '../../constants/defaultAssets';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchAndSetCoinsData } from '../../redux/actions/walletActions';
import { getPointsSummary } from '../ecency/ePoint';
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

  return useQuery<{ [key: string]: string }>([QUERIES.WALLET.UNCLAIMED_GET, currentAccount.username], async () => {

    const unclaimedCollection: { [key: string]: string } = {}

    //Ecency unclaimed balance
    const _pointsSummary = await getPointsSummary(currentAccount.username);
    const unclaimedFloat = parseFloat(_pointsSummary.unclaimed_points || '0');
    const unclaimedBalance = unclaimedFloat ? unclaimedFloat + ' Points' : '1.23 Points';
    unclaimedCollection[ASSET_IDS.ECENCY] = unclaimedBalance;

    //HP unclaimed balance
    
    return unclaimedCollection;
  })
}
