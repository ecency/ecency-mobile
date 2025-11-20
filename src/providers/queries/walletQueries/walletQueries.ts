import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { unionBy } from 'lodash';
import { RecurrentTransfer } from 'providers/hive/hive.types';
import { Alert } from 'react-native';
import { PortfolioItem, PortfolioLayer } from 'providers/ecency/ecency.types';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { claimPoints } from '../../ecency/ePoint';
import {
  claimRewardBalance,
  getAccount,
  getRecurrentTransfers,
  profileUpdate,
} from '../../hive/dhive';
import QUERIES from '../queryKeys';
import { claimRewards } from '../../hive-engine/hiveEngineActions';
import { toastNotification } from '../../../redux/actions/uiAction';
import { updateClaimCache } from '../../../redux/actions/cacheActions';
import { ClaimsCollection } from '../../../redux/reducers/cacheReducer';
import { fetchCoinActivities, fetchPendingRequests } from '../../../utils/wallet';
import { recurrentTransferToken } from '../../hive/dhive';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { getPortfolio } from '../../ecency/ecency';
import { ProfileToken } from '../../../redux/reducers/walletReducer';

interface ClaimRewardsMutationVars {
  symbol: string;
}

const ACTIVITIES_FETCH_LIMIT = 50;

/** hook used to return user drafts */
export const useAssetsQuery = () => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const selectedAssets: ProfileToken[] = useAppSelector((state) => state.wallet.selectedAssets);
  const claimsCollection: ClaimsCollection = useAppSelector(
    (state) => state.cache.claimsCollection,
  );

  // TODO: test assets update with currency and quote change

  const assetsQuery = useQuery({
    queryKey: [QUERIES.WALLET.GET, currentAccount.username],
    queryFn: async () => {
      try {
        const response = await getPortfolio(currentAccount.username);

        if (!response || response.length === 0) {
          return [];
        }

        // update response with redux claim cachce if pendingRewards value and cache valuye is equal and cache is not expired
        const updatedResponse = response.map((item) => {
          const claimCache = claimsCollection[item.symbol];
          const cachedRewardValue = Number(claimCache?.rewardValue) || 0;
          if (
            claimCache?.expiresAt &&
            claimCache?.expiresAt > Date.now() &&
            item.pendingRewards === cachedRewardValue
          ) {
            return { ...item, pendingRewards: 0 };
          }
          return item;
        });

        return updatedResponse;
      } catch (err) {
        console.warn('failed to get query response', err);
        return [];
      }
    },
    initialData: [],
  });

  const selectedData = useMemo(() => {
    if (!assetsQuery.data || !assetsQuery.data.length || selectedAssets.length === 0) {
      return [];
    }

    // filter only selected tokens from portfolio data
    const dataMap = new Map(assetsQuery.data.map((item) => [item.symbol, item]));
    return selectedAssets.map((token) => dataMap.get(token.symbol)).filter(Boolean);
  }, [assetsQuery.data, selectedAssets]);

  const selectedableData = useMemo(() => {
    if (!assetsQuery.data || !assetsQuery.data.length) {
      return [];
    }

    return assetsQuery.data.filter((asset) => asset.layer !== 'hive' && asset.layer !== 'points');
  }, [assetsQuery.data]);

  const _getAssetBySymbol = (symbol: string) => {
    return assetsQuery.data.find((asset) => asset.symbol === symbol);
  };

  return {
    ...assetsQuery,
    selectedData,
    selectedableData,
    getAssetBySymbol: _getAssetBySymbol,
  };
};

/**
 * query hook responsible for claiming any kind asset rewards, mutate rewards api.
 * Also updates claimsCollection in cache store redux and invalidates wallet data.
 * @returns mutation hook, claiming status checker
 */
export const useClaimRewardsMutation = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);
  const [isClaimingColl, setIsClaimingColl] = useState<{ [key: string]: boolean }>({});

  const _mutationFn = async ({ symbol }: ClaimRewardsMutationVars) => {
    const account = await getAccount(currentAccount.name);
    if (!account) {
      throw new Error('Account not found');
    }

    if (symbol === 'POINTS') {
      await claimPoints();
    } else if (['HP', 'HBD', 'HIVE'].includes(symbol)) {
      await claimRewardBalance(
        currentAccount,
        pinHash,
        symbol === 'HIVE' ? account.reward_hive_balance : '0.000 HIVE',
        symbol === 'HBD' ? account.reward_hbd_balance : '0.000 HBD',
        symbol === 'HP' ? account.reward_vesting_balance : '0.000000 VESTS',
      );
    } else {
      await claimRewards([symbol], currentAccount, pinHash);
    }
    return true;
  };

  const mutation = useMutation<boolean, Error, ClaimRewardsMutationVars>({
    mutationFn: _mutationFn,
    retry: 2,
    onMutate({ symbol }) {
      setIsClaimingColl((prev) => ({ ...prev, [symbol]: true }));
    },
    onSuccess: (data, { symbol }) => {
      console.log('successfully initiated claim action activity', data, { symbol });
      setIsClaimingColl((prev) => ({ ...prev, [symbol]: false }));

      // Update claim cache and set claimed asset to zero in portfolio data (loop only once)
      const portfolioData: PortfolioItem[] | undefined = queryClient.getQueryData<any[]>([
        QUERIES.WALLET.GET,
        currentAccount.username,
      ]);

      if (portfolioData) {
        let claimedValue = undefined;
        const updatedPortfolioData = portfolioData.map((item) => {
          if (item.symbol === symbol) {
            claimedValue = item.pendingRewards;
            return { ...item, pendingRewards: 0 };
          }
          return item;
        });

        // update redux claim cache
        if (claimedValue) {
          dispatch(updateClaimCache(symbol, claimedValue));
        }

        queryClient.setQueryData(
          [QUERIES.WALLET.GET, currentAccount.username],
          updatedPortfolioData,
        );
      }

      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.claim_reward_balance_ok',
          }),
        ),
      );
    },
    onError: async (error, { symbol }) => {
      setIsClaimingColl((prev) => ({ ...prev, [symbol]: false }));

      if (symbol === 'POINTS') {
        // In some cases claim request may succeed on backend but fail locally due to
        // long-running response or connectivity hiccups. Re-fetch the portfolio to
        // verify whether pending rewards were actually claimed before surfacing an error.
        const refreshedPortfolio = await queryClient.fetchQuery<PortfolioItem[]>([
          QUERIES.WALLET.GET,
          currentAccount.username,
        ]);

        const pointsAsset = refreshedPortfolio?.find((item) => item.symbol === symbol);
        if (pointsAsset && pointsAsset.pendingRewards === 0) {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.claim_reward_balance_ok',
              }),
            ),
          );
          return;
        }
      }

      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'alert.claim_failed' }, { message: error.message }),
        ),
      );
    },
  });

  const checkIsClaiming = (symbol?: string) => {
    if (symbol) {
      return isClaimingColl[symbol] || false;
    }

    Object.keys(isClaimingColl).forEach((key) => {
      if (isClaimingColl[key] === true) {
        return true;
      }
    });

    return false;
  };

  return {
    ...mutation,
    checkIsClaiming,
  };
};

export const useActivitiesQuery = (symbol: string, layer: PortfolioLayer) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const globalProps = useAppSelector((state) => state.account.globalProps);

  const isEngine = layer === 'engine';

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [noMoreData, setNoMoreData] = useState(false);
  const [pageParams, setPageParams] = useState(isEngine ? [0] : [-1]);

  const _fetchActivities = async (pageParam: number) => {
    console.log('fetching page since:', pageParam);

    const _activites = await fetchCoinActivities({
      username: currentAccount.name,
      assetSymbol: symbol,
      globalProps,
      startIndex: pageParam,
      limit: ACTIVITIES_FETCH_LIMIT,
      isEngine,
    });

    // console.log('new page fetched', _activites);
    return _activites || [];
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastId = !!lastPage?.length && lastPage[lastPage.length - 1].trxIndex;
    console.log('extracting next page parameter', lastId);
    return lastId;
  };

  // query initialization
  const queries = useQueries({
    queries: pageParams.map((pageParam) => ({
      queryKey: [QUERIES.WALLET.GET_ACTIVITIES, currentAccount.username, symbol, pageParam],
      queryFn: () => _fetchActivities(pageParam),
      initialData: [],
    })),
  });

  const _lastItem = queries[queries.length - 1];

  const _refresh = async () => {
    setIsRefreshing(true);
    setNoMoreData(false);
    setPageParams(isEngine ? [0] : [-1]);
    await queries[0].refetch();
    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {
    const lastPage = queries[queries.length - 1];

    if (!lastPage || lastPage.isFetching || lastPage.isLoading || noMoreData) {
      return;
    }

    if (!lastPage.data?.length) {
      setNoMoreData(true);
      return;
    }

    if (isEngine) {
      pageParams.push(pageParams.length);
      setPageParams([...pageParams]);
    } else {
      const lastId = _getNextPageParam(lastPage.data);
      if (lastId && !pageParams.includes(lastId)) {
        pageParams.push(lastId);
        setPageParams([...pageParams]);
      }
    }
  };

  const _data = useMemo(() => {
    const _dataArrs = queries.map((query) => query.data);
    return unionBy(..._dataArrs, 'trxIndex');
  }, [_lastItem?.data]);

  return {
    data: _data,
    isRefreshing,
    isLoading: _lastItem?.isLoading || _lastItem?.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};

// added query to tracker recurring transfers]
export const useRecurringActivitesQuery = (coinId: string) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  if (coinId !== ASSET_IDS.HIVE) {
    return null;
  }

  const query = useQuery({
    queryKey: [QUERIES.WALLET.GET_RECURRING_TRANSFERS, coinId, currentAccount.username],
    queryFn: async () => {
      if (!currentAccount?.username) {
        return [];
      }
      const recurringTransfers = await getRecurrentTransfers(currentAccount.username);

      if (!recurringTransfers) {
        return [];
      }

      return recurringTransfers as RecurrentTransfer[];
    },
  });

  const totalAmount = useMemo(() => {
    if (!query.data || !query.data.length) {
      return 0;
    }

    return query.data.reduce((acc, item) => {
      const amount = parseFloat(item.amount);
      return acc + (!amount ? 0 : amount);
    }, 0);
  }, [query.data]);

  return {
    ...query,
    totalAmount,
  };
};

export const usePendingRequestsQuery = (symbol: string) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  return useQuery({
    queryKey: [QUERIES.WALLET.GET_PENDING_REQUESTS, currentAccount.username, symbol],
    queryFn: async () => {
      const pendingRequests = await fetchPendingRequests(currentAccount.username, symbol);
      return pendingRequests;
    },
  });
};

export const useDeleteRecurrentTransferMutation = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  const mutation = useMutation<boolean, Error, { recurrentTransfer: RecurrentTransfer }>({
    mutationFn: async ({ recurrentTransfer }) => {
      // form up rec transfer data for deletion
      const data = {
        from: recurrentTransfer.from,
        destination: recurrentTransfer.to,
        amount: '0.000 HIVE',
        memo: recurrentTransfer.memo || '',
        recurrence: recurrentTransfer.recurrence || 0,
        executions: recurrentTransfer.remaining_executions || 0,
      };

      await recurrentTransferToken(currentAccount, pinHash, data);
      return true;
    },
    retry: 2,
    onSuccess: (_, { recurrentTransfer }) => {
      // manually update previous query data
      const prevData = queryClient.getQueryData<RecurrentTransfer[]>([
        QUERIES.WALLET.GET_RECURRING_TRANSFERS,
        ASSET_IDS.HIVE,
        currentAccount.username,
      ]);

      if (prevData) {
        const updatedData = prevData.filter(
          (item) =>
            !(
              item.from === recurrentTransfer.from &&
              item.to === recurrentTransfer.to &&
              item.recurrence === recurrentTransfer.recurrence
            ),
        );
        queryClient.setQueryData(
          [QUERIES.WALLET.GET_RECURRING_TRANSFERS, ASSET_IDS.HIVE, currentAccount.username],
          updatedData,
        );
      }
      dispatch(toastNotification(intl.formatMessage({ id: 'recurrent.delete_success' })));
    },
    onError: (error) => {
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'recurrent.delete_failed' }, { error: error.message }),
        ),
      );
    },
  });

  return mutation;
};

export const useUpdateProfileTokensMutation = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  const mutation = useMutation<any, Error, ProfileToken[]>({
    mutationFn: async (tokens) => {
      const newProfileMeta = {
        ...currentAccount.about.profile,
        tokens: [...tokens],
      };

      await profileUpdate(newProfileMeta, pinHash, currentAccount);

      return newProfileMeta;
    },

    onSuccess: (newProfileMeta) => {
      // update current account in redux
      const _currentAccount = {
        ...currentAccount,
        about: {
          ...currentAccount.about,
          profile: newProfileMeta,
        },
      };
      dispatch(updateCurrentAccount({ ..._currentAccount }));
    },

    onError: (error) => {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error instanceof Error ? error.message : String(error),
      );
    },
  });

  return mutation;
};
