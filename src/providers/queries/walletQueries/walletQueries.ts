import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { unionBy } from 'lodash';
import { RecurrentTransfer } from 'providers/hive/hive.types';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import parseToken from '../../../utils/parseToken';
import { claimPoints, getPointsSummary } from '../../ecency/ePoint';
import { fetchUnclaimedRewards } from '../../hive-engine/hiveEngine';
import { claimRewardBalance, getAccount, getRecurrentTransfers, profileUpdate } from '../../hive/dhive';
import QUERIES from '../queryKeys';
import { claimRewards } from '../../hive-engine/hiveEngineActions';
import { toastNotification } from '../../../redux/actions/uiAction';
import { updateClaimCache } from '../../../redux/actions/cacheActions';
import { ClaimsCollection } from '../../../redux/reducers/cacheReducer';
import { fetchCoinActivities, fetchPendingRequests } from '../../../utils/wallet';
import { recurrentTransferToken } from '../../hive/dhive';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { Alert } from 'react-native';
import { getPortfolio } from '../../../providers/ecency/ecency';
import { ProfileToken } from '../../../redux/reducers/walletReducer';
import { PortfolioLayer } from 'providers/ecency/ecency.types';

interface RewardsCollection {
  [key: string]: string;
}

interface ClaimRewardsMutationVars {
  symbol: string;
}

const ACTIVITIES_FETCH_LIMIT = 50;



/** hook used to return user drafts */
export const useAssetsQuery = () => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const selectedAssets: ProfileToken[] = useAppSelector((state) => state.wallet.selectedAssets);

  //TODO: test assets update with currency and quote change

  const assetsQuery = useQuery({
    queryKey: [QUERIES.WALLET.GET, currentAccount.username],
    queryFn: async () => {
      try {

        const response = await getPortfolio(currentAccount.username);

        if (!response || response.length === 0) {
          return [];
        }


        return response;

      } catch (err) {
        console.warn('failed to get query response', err);
        return []
      }

    },
  });

  const selectedData = useMemo(() => {
    if (!assetsQuery.data || !assetsQuery.data.length || selectedAssets.length === 0) {
      return [];
    }

    // filter only selected tokens from portfolio data
    const dataMap = new Map(assetsQuery.data.map(item => [item.symbol, item]));
    return selectedAssets
      .map((token) => dataMap.get(token.symbol))
      .filter(Boolean);

  }, [assetsQuery.data, selectedAssets]);

  const selectedableData = useMemo(() => {
    if (!assetsQuery.data || !assetsQuery.data.length) {
      return [];
    }

    return assetsQuery.data.filter(
      (asset) => asset.layer !== 'hive' && asset.layer !== 'points',
    );
  }, [assetsQuery.data]);

  return {
    ...assetsQuery,
    selectedData,
    selectedableData
  }
};



export const useUnclaimedRewardsQuery = () => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const claimsCollection: ClaimsCollection = useAppSelector(
    (state) => state.cache.claimsCollection,
  );

  // process cached claims data
  const _processCachedData = (rewardsCollection: RewardsCollection) => {
    if (claimsCollection) {
      const _curTime = new Date().getTime();
      Object.keys(claimsCollection).forEach((key) => {
        const _claimCache = claimsCollection[key];
        const _rewardValue = rewardsCollection[key];
        if (
          _claimCache &&
          _claimCache.rewardValue &&
          _rewardValue &&
          _claimCache.rewardValue === _rewardValue &&
          (_claimCache.expiresAt || 0) > _curTime
        ) {
          delete rewardsCollection[key];
        }
      });
    }

    return rewardsCollection;
  };

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

    return _rewardsCollection;
  };

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
  };

  // Engine unclaimed balance
  const _fetchUnclaimedEngine = async (username: string) => {
    const _rewardsCollection: RewardsCollection = {};
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
  };

  const _fetchUnclaimedRewards = async () => {
    const username = currentAccount?.username;
    if (!username) {
      return {};
    }

    const _unclaimedPoints = await _fetchUnclaimedPoints(username);
    const _unclaimedHive = await _fetchUnclaimedHive(username);
    const _unclaimedEngine = await _fetchUnclaimedEngine(username);

    const rewardsCollection = {
      ..._unclaimedPoints,
      ..._unclaimedHive,
      ..._unclaimedEngine,
    };

    return _processCachedData(rewardsCollection);
  };

  return useQuery<RewardsCollection>({
    queryKey: [QUERIES.WALLET.UNCLAIMED_GET, currentAccount.username],
    queryFn: _fetchUnclaimedRewards,
  });
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
    switch (symbol) {
      case 'POINTS':
        await claimPoints();
        break;
      case 'HP':
        const account = await getAccount(currentAccount.name);
        await claimRewardBalance(
          currentAccount,
          pinHash,
          account.reward_hive_balance,
          account.reward_hbd_balance,
          account.reward_vesting_balance,
        );
        break;
      //TODO: add support for other asset claims, 
      default:
        await claimRewards([symbol], currentAccount, pinHash);
        break;
    }
    return true;
  };

  const mutation = useMutation<boolean, Error, ClaimRewardsMutationVars>({
    mutationFn: _mutationFn,
    retry: 2,
    onMutate({ symbol }) {
      setIsClaimingColl({ ...isClaimingColl, [symbol]: true });
    },
    onSuccess: (data, { symbol }) => {
      console.log('successfully initiated claim action activity', data, { symbol });
      setIsClaimingColl({ ...isClaimingColl, [symbol]: false });

      // get current rewards data from query
      const rewardsData: RewardsCollection | undefined = queryClient.getQueryData([
        QUERIES.WALLET.UNCLAIMED_GET,
        currentAccount.username,
      ]);
      if (rewardsData) {
        // update claim cache value in redux;

        // TOOD: assess what is happening here, possibly rewardsData already have some value set as cache
        dispatch(updateClaimCache(symbol, rewardsData[symbol]));

        // mutate claim data
        delete rewardsData[symbol];
        queryClient.setQueryData(
          [QUERIES.WALLET.UNCLAIMED_GET, currentAccount.username],
          rewardsData,
        );
      }

      // invalidate wallet data;
      queryClient.invalidateQueries({ queryKey: [QUERIES.WALLET.GET, currentAccount.username] });

      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.claim_reward_balance_ok',
          }),
        ),
      );
    },
    onError: (error, { symbol }) => {
      setIsClaimingColl({ ...isClaimingColl, [symbol]: false });
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
      isEngine: isEngine,
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

      return newProfileMeta
    },

    onSuccess: (newProfileMeta) => {
      //update current account in redux
      const _currentAccount = {
        ...currentAccount,
        about: {
          ...currentAccount.about,
          profile: newProfileMeta
        }
      }
      dispatch(updateCurrentAccount({ ..._currentAccount }))
    },

    onError: (error) => {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        (error instanceof Error ? error.message : String(error)),
      );
    },
  });

  return mutation;
};