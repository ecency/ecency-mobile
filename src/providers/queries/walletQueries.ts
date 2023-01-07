import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchAndSetCoinsData } from '../../redux/actions/walletActions';
import QUERIES from './queryKeys';

/** hook used to return user drafts */
export const useGetAssetsQuery = () => {
  const dispatch = useAppDispatch();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const refreshRef = useRef(false);

  const query = useQuery([QUERIES.WALLET.GET, currentAccount.username], async () => {
    try {
      await dispatch(fetchAndSetCoinsData(refreshRef.current));
      refreshRef.current = false;
    } catch (err) {
      refreshRef.current = false;
      console.warn('failed to get query response', err);
    }

    return true;
  });

  const _onRefresh = () => {
    if (!refreshRef.current) {
      refreshRef.current = true;
      console.log('refresh initiated');
      query.refetch();
    }
  };

  return {
    ...query,
    refresh: _onRefresh,
    isRefreshing: refreshRef.current,
  };
};
