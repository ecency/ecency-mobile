import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchAndSetCoinsData } from '../../redux/actions/walletActions';
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
