import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { unionBy } from 'lodash';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { fetchAndSetCoinsData } from '../../../redux/actions/walletActions';
import parseToken from '../../../utils/parseToken';
import { claimPoints, getPointsSummary } from '../../ecency/ePoint';
import { fetchUnclaimedRewards } from '../../hive-engine/hiveEngine';
import { claimRewardBalance, getAccount } from '../../hive/dhive';
import QUERIES from '../queryKeys';
import { claimRewards } from '../../hive-engine/hiveEngineActions';
import { toastNotification } from '../../../redux/actions/uiAction';
import { updateClaimCache } from '../../../redux/actions/cacheActions';
import { ClaimsCollection } from '../../../redux/reducers/cacheReducer';
import { fetchCoinActivities, fetchPendingRequests } from '../../../utils/wallet';

interface RewardsCollection {
  [key: string]: string;
}

interface ClaimRewardsMutationVars {
  assetId: ASSET_IDS | string;
}

const ACTIVITIES_FETCH_LIMIT = 500;

/** hook used to return user drafts */
export const useAssetsQuery = () => {
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
  const claimsCollection: ClaimsCollection = useAppSelector(
    (state) => state.cache.claimsCollection,
  );

  // process cached claims data
  const _processCachedData = (rewardsCollection: RewardsCollection) => {
    if (claimsCollection) {
      const _curTime = new Date().getTime();
      for (const key in claimsCollection) {
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
      }
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

  return useQuery<RewardsCollection>(
    [QUERIES.WALLET.UNCLAIMED_GET, currentAccount.username],
    _fetchUnclaimedRewards,
  );
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

  const _mutationFn = async ({ assetId }: ClaimRewardsMutationVars) => {
    switch (assetId) {
      case ASSET_IDS.ECENCY:
        await claimPoints();
        break;
      case ASSET_IDS.HP:
        const account = await getAccount(currentAccount.name);
        await claimRewardBalance(
          currentAccount,
          pinHash,
          account.reward_hive_balance,
          account.reward_hbd_balance,
          account.reward_vesting_balance,
        );
        break;
      default:
        await claimRewards([assetId], currentAccount, pinHash);
        break;
    }
    return true;
  };

  const mutation = useMutation<boolean, Error, ClaimRewardsMutationVars>(_mutationFn, {
    retry: 2,
    onMutate({ assetId }) {
      setIsClaimingColl({ ...isClaimingColl, [assetId]: true });
    },
    onSuccess: (data, { assetId }) => {
      console.log('successfully initiated claim action activity', data, { assetId });
      setIsClaimingColl({ ...isClaimingColl, [assetId]: false });

      // get current rewards data from query
      const rewardsData: RewardsCollection | undefined = queryClient.getQueryData([
        QUERIES.WALLET.UNCLAIMED_GET,
        currentAccount.username,
      ]);
      if (rewardsData) {
        // update claim cache value in redux;
        dispatch(updateClaimCache(assetId, rewardsData[assetId]));

        // mutate claim data
        delete rewardsData[assetId];
        queryClient.setQueryData(
          [QUERIES.WALLET.UNCLAIMED_GET, currentAccount.username],
          rewardsData,
        );
      }

      // invalidate wallet data;
      queryClient.invalidateQueries([QUERIES.WALLET.GET, currentAccount.username]);

      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.claim_reward_balance_ok',
          }),
        ),
      );
    },
    onError: (error, { assetId }) => {
      setIsClaimingColl({ ...isClaimingColl, [assetId]: false });
      toastNotification(
        intl.formatMessage({ id: 'alert.claim_failed' }, { message: error.message }),
      );
    },
  });

  const checkIsClaiming = (assetId?: string) => {
    if (assetId) {
      return isClaimingColl[assetId] || false;
    }

    for (const key in isClaimingColl) {
      if (isClaimingColl[key] === true) {
        return true;
      }
    }

    return false;
  };

  return {
    ...mutation,
    checkIsClaiming,
  };
};




export const useActivitiesQuery = (assetId: string) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const globalProps = useAppSelector((state) => state.account.globalProps);
  const selectedCoins = useAppSelector((state) => state.wallet.selectedCoins);

  const assetData = useMemo(() => selectedCoins.find((item) => item.id === assetId), [assetId]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [noMoreData, setNoMoreData] = useState(false);
  const [pageParams, setPageParams] = useState(assetData.isEngine ? [0] : [-1]);

  const _fetchActivities = async (pageParam: number) => {
    console.log('fetching page since:', pageParam);

    const _activites = await fetchCoinActivities({
      username: currentAccount.name,
      assetId,
      assetSymbol: assetData.symbol,
      globalProps,
      startIndex: pageParam,
      limit: ACTIVITIES_FETCH_LIMIT,
      isEngine: assetData.isEngine
    });

    console.log('new page fetched', _activites);
    return _activites || [];
  };

  const _getNextPageParam = (lastPage: any[]) => {
    const lastId = lastPage && lastPage.length ? lastPage.lastItem.trxIndex : undefined;
    console.log('extracting next page parameter', lastId);
    return lastId;
  };

  // query initialization
  const queries = useQueries({
    queries: pageParams.map((pageParam) => ({
      queryKey: [QUERIES.WALLET.GET_ACTIVITIES, currentAccount.username, assetId, pageParam],
      queryFn: () => _fetchActivities(pageParam),
      initialData: [],
    })),
  });

  const _refresh = async () => {
    setIsRefreshing(true);
    setNoMoreData(false);
    setPageParams(assetData.isEngine ? [0] : [-1]);
    await queries[0].refetch();
    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {
    const lastPage = queries.lastItem;

    if (!lastPage || lastPage.isFetching || lastPage.isLoading || noMoreData) {
      return;
    }

    if (!lastPage.data?.length) {
      setNoMoreData(true);
      return;
    }

    if (assetData.isEngine) { 
      pageParams.push(pageParams.length);
      setPageParams([...pageParams]);
    } else {
      const lastId = _getNextPageParam(lastPage.data);
      if (!pageParams.includes(lastId)) {
        pageParams.push(lastId);
        setPageParams([...pageParams]);
      }
    }

  };

  const _data = useMemo(() => {
    const _dataArrs = queries.map((query) => query.data);
    return unionBy(..._dataArrs, 'trxIndex');
  }, [queries.lastItem?.data]);

  return {
    data: _data,
    isRefreshing,
    isLoading: queries.lastItem.isLoading || queries.lastItem.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};




export const usePendingRequestsQuery = (assetId: string) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const selectedCoins = useAppSelector((state) => state.wallet.selectedCoins);
  const symbol = useMemo(() => selectedCoins.find((item) => item.id === assetId).symbol, []);

  return useQuery(
    [QUERIES.WALLET.GET_PENDING_REQUESTS, currentAccount.username, assetId],
    async () => {
      const pendingRequests = await fetchPendingRequests(currentAccount.username, symbol);
      return pendingRequests;
    },
  );
};
