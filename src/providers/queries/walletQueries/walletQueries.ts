import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { unionBy, get } from 'lodash';
import { RecurrentTransfer } from 'providers/hive/hive.types';
import { Alert } from 'react-native';
import { PortfolioItem, PortfolioLayer } from 'providers/ecency/ecency.types';
import {
  getSavingsWithdrawFromQueryOptions,
  getConversionRequestsQueryOptions,
  getCollateralizedConversionRequestsQueryOptions,
  getRecurrentTransfersQueryOptions,
  getOpenOrdersQueryOptions,
  getTransactionsInfiniteQueryOptions,
  getPointsQueryOptions,
  getPortfolioQueryOptions,
} from '@ecency/sdk';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import POINTS from '../../../constants/options/points';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { claimPoints } from '../../ecency/ePoint';
import {
  claimRewardBalance,
  getAccount,
  profileUpdate,
  recurrentTransferToken,
} from '../../hive/dhive';
import QUERIES from '../queryKeys';
import { claimRewards } from '../../hive-engine/hiveEngineActions';
import { toastNotification } from '../../../redux/actions/uiAction';
import { updateClaimCache } from '../../../redux/actions/cacheActions';
import { selectCurrentAccount, selectPin, selectGlobalProps } from '../../../redux/selectors';
import { ClaimsCollection } from '../../../redux/reducers/cacheReducer';
import { fetchEngineAccountHistory } from '../../hive-engine/hiveEngine';
import {
  groomingEngineHistory,
  groomingTransactionData,
  groomingPointsTransactionData,
  transferTypes,
} from '../../../utils/wallet';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { ProfileToken } from '../../../redux/reducers/walletReducer';

interface ClaimRewardsMutationVars {
  symbol: string;
}

const ACTIVITIES_FETCH_LIMIT = 50;

/** hook used to return user drafts */
export const useAssetsQuery = ({ onlyEnabled = true }: { onlyEnabled?: boolean } = {}) => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const selectedAssets: ProfileToken[] = useAppSelector((state) => state.wallet.selectedAssets);
  const claimsCollection: ClaimsCollection = useAppSelector(
    (state) => state.cache.claimsCollection,
  );
  const currency = useAppSelector((state) => state.application.currency);

  // TODO: test assets update with currency and quote change

  const assetsQuery = useQuery({
    ...getPortfolioQueryOptions(currentAccount?.name || '', currency.currency, onlyEnabled),
    // Override queryKey to match legacy format for cache compatibility
    queryKey: [
      QUERIES.WALLET.GET,
      currentAccount?.name || '',
      currency.currency,
      onlyEnabled ? 'enabled' : 'all',
    ],
    // Transform SDK response to match mobile app format
    select: (data) => {
      if (!data?.wallets || data.wallets.length === 0) {
        return [];
      }

      // Update response with redux claim cache if pendingRewards value and cache value is equal and cache is not expired
      const updatedResponse = data.wallets.map((item) => {
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
    },
    initialData: [],
    enabled: !!currentAccount?.name, // Only fetch when logged in
    retry: 2,
  });

  const selectedData = useMemo(() => {
    if (!assetsQuery.data || !assetsQuery.data.length) {
      return [];
    }

    if (selectedAssets.length === 0) {
      return [];
    }

    // filter only selected tokens from portfolio data
    const dataMap = new Map(assetsQuery.data.map((item) => [item.symbol, item]));
    const filtered = selectedAssets.map((token) => dataMap.get(token.symbol)).filter(Boolean);

    return filtered;
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

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);
  const currency = useAppSelector((state) => state.application.currency);
  const [isClaimingColl, setIsClaimingColl] = useState<{ [key: string]: boolean }>({});
  const portfolioBaseKey = [
    QUERIES.WALLET.GET,
    currentAccount?.name || '',
    currency.currency,
  ] as const;
  const portfolioKeyEnabled = [...portfolioBaseKey, 'enabled'] as const;
  const portfolioKeyAll = [...portfolioBaseKey, 'all'] as const;

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
      setIsClaimingColl((prev) => ({ ...prev, [symbol]: false }));

      // Update claim cache and set claimed asset to zero in portfolio data (loop only once)
      let claimedValue: number | undefined;
      const updatePortfolio = (data?: PortfolioItem[]) => {
        if (!data) return data;
        return data.map((item) => {
          if (item.symbol === symbol) {
            if (claimedValue === undefined) {
              claimedValue = item.pendingRewards;
            }
            return { ...item, pendingRewards: 0 };
          }
          return item;
        });
      };

      const enabledData = queryClient.getQueryData<PortfolioItem[]>(portfolioKeyEnabled);
      const allData = queryClient.getQueryData<PortfolioItem[]>(portfolioKeyAll);
      const updatedEnabledData = updatePortfolio(enabledData);
      const updatedAllData = updatePortfolio(allData);

      if (updatedEnabledData) {
        queryClient.setQueryData(portfolioKeyEnabled, updatedEnabledData);
      }
      if (updatedAllData) {
        queryClient.setQueryData(portfolioKeyAll, updatedAllData);
      }

      // update redux claim cache
      if (claimedValue) {
        dispatch(updateClaimCache(symbol, claimedValue));
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
        const cachedPortfolio =
          queryClient.getQueryData<PortfolioItem[]>(portfolioKeyEnabled) ||
          queryClient.getQueryData<PortfolioItem[]>(portfolioKeyAll);
        const refreshedPortfolio =
          cachedPortfolio || (await queryClient.fetchQuery<PortfolioItem[]>(portfolioKeyEnabled));

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

    return Object.values(isClaimingColl).some((isClaiming) => isClaiming === true);
  };

  return {
    ...mutation,
    checkIsClaiming,
  };
};

export const useActivitiesQuery = (symbol: string, layer: PortfolioLayer) => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const globalProps = useAppSelector(selectGlobalProps);

  const username = currentAccount?.name;
  const isEngine = layer === 'engine';
  const isPoints = layer === 'points';

  const [isRefreshing, setIsRefreshing] = useState(false);

  // For POINTS, use SDK points query to get activities from Ecency API
  const pointsQuery = useQuery({
    ...getPointsQueryOptions(username, 0),
    enabled: !!username && isPoints,
    staleTime: 0, // Always consider stale so pull-to-refresh works immediately
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const chainQuery = useInfiniteQuery({
    ...getTransactionsInfiniteQueryOptions(username ?? '', ACTIVITIES_FETCH_LIMIT),
    enabled: !!username && !isEngine && !isPoints,
    staleTime: 0, // Always consider stale so pull-to-refresh works immediately
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const engineQuery = useInfiniteQuery({
    queryKey: [QUERIES.WALLET.GET_ACTIVITIES, username, symbol, 'engine'],
    enabled: !!username && isEngine,
    initialPageParam: 0,
    staleTime: 0, // Always consider stale so pull-to-refresh works immediately
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    queryFn: async ({ pageParam }) => {
      if (!username) return [];
      const engineHistory = await fetchEngineAccountHistory(
        username,
        symbol,
        pageParam,
        ACTIVITIES_FETCH_LIMIT,
      );
      return engineHistory.map(groomingEngineHistory);
    },
    getNextPageParam: (lastPage, pages) => (lastPage?.length ? pages.length : undefined),
  });

  const _refresh = async () => {
    setIsRefreshing(true);
    if (isPoints) {
      await pointsQuery.refetch();
    } else if (isEngine) {
      await engineQuery.refetch();
    } else {
      await chainQuery.refetch();
    }
    setIsRefreshing(false);
  };

  const _fetchNextPage = () => {
    // Points query doesn't support pagination (all transactions returned at once)
    if (isPoints) {
      return;
    }

    if (isEngine) {
      if (engineQuery.hasNextPage && !engineQuery.isFetchingNextPage) {
        engineQuery.fetchNextPage();
      }
    } else if (chainQuery.hasNextPage && !chainQuery.isFetchingNextPage) {
      chainQuery.fetchNextPage();
    }
  };

  const _data = useMemo(() => {
    if (isPoints) {
      // For POINTS, use transactions from SDK points query
      const transactions = pointsQuery.data?.transactions || [];
      return transactions.map((item) => {
        const pointType = POINTS[get(item, 'type')] || POINTS.default;
        return groomingPointsTransactionData({
          ...item,
          icon: get(pointType, 'icon'),
          iconType: get(pointType, 'iconType'),
          textKey: get(pointType, 'textKey'),
        });
      });
    }

    if (isEngine) {
      const pages = engineQuery.data?.pages || [];
      const merged = unionBy(...pages, 'engineTrxId');
      return merged.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    }

    const history = chainQuery.data?.pages?.flat() || [];
    const transfers = history.filter((tx) => {
      const opType = Array.isArray(tx) ? get(tx[1], 'op[0]', false) : get(tx, 'type', false);
      return transferTypes.includes(opType);
    });

    const activities = transfers.map((item) =>
      groomingTransactionData(item, globalProps.hivePerMVests),
    );

    return activities.filter((item) => item && item.value && item.value.includes(symbol));
  }, [
    pointsQuery.data?.transactions,
    chainQuery.data?.pages,
    engineQuery.data?.pages,
    isPoints,
    isEngine,
    globalProps.hivePerMVests,
    symbol,
  ]);

  return {
    data: _data,
    isRefreshing,
    isLoading: isPoints
      ? pointsQuery.isLoading || pointsQuery.isFetching
      : isEngine
      ? engineQuery.isLoading || engineQuery.isFetching
      : chainQuery.isLoading || chainQuery.isFetching,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};

// added query to tracker recurring transfers using SDK
export const useRecurringActivitesQuery = (coinId: string) => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const username = currentAccount?.name;

  // Always call useQuery (Rules of Hooks) - use enabled to control execution
  const query = useQuery({
    ...getRecurrentTransfersQueryOptions(username || ''),
    queryKey: [QUERIES.WALLET.GET_RECURRING_TRANSFERS, coinId, username],
    enabled: coinId === ASSET_IDS.HIVE && !!username, // Only fetch for HIVE and when username exists
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

/**
 * Query hook that fetches pending wallet requests by combining multiple SDK queries:
 * - Savings withdrawals (via getSavingsWithdrawFromQueryOptions)
 * - HBD conversion requests (via getConversionRequestsQueryOptions)
 * - Collateralized conversion requests (via getCollateralizedConversionRequestsQueryOptions)
 * - Open orders (via getOpenOrdersQueryOptions)
 *
 * Returns combined list of pending requests sorted by expiration/creation date
 */
export const usePendingRequestsQuery = (symbol: string) => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const username = currentAccount?.name;
  const buildCombinedRequests = (
    savings: any[],
    conversions: any[],
    collateralized: any[],
    openOrders: any[],
  ) => {
    const allRequests = [
      ...(savings || []),
      ...(conversions || []),
      ...(collateralized || []),
      ...(openOrders || []),
    ];

    allRequests.sort((a, b) => {
      const timeA = new Date(a.expires || a.created).getTime();
      const timeB = new Date(b.expires || b.created).getTime();

      const validTimeA = Number.isNaN(timeA) ? Infinity : timeA;
      const validTimeB = Number.isNaN(timeB) ? Infinity : timeB;

      if (validTimeA < validTimeB) return -1;
      if (validTimeA > validTimeB) return 1;
      return 0;
    });

    return allRequests;
  };

  // Use SDK query options for pending requests
  const savingsQuery = useQuery({
    ...getSavingsWithdrawFromQueryOptions(username || ''),
    enabled: !!username,
    select: (data) => {
      // Filter by symbol and transform to CoinActivity format
      return data
        .filter((request) => request.amount.includes(symbol))
        .map((request) => ({
          trxIndex: request.request_id,
          iconType: 'MaterialIcons' as const,
          textKey: 'withdraw_savings',
          created: request.complete,
          icon: 'compare-arrows',
          value: request.amount,
          details: request.from && request.to ? `@${request.from} to @${request.to}` : null,
          memo: request.memo || null,
        }));
    },
  });

  const conversionQuery = useQuery({
    ...getConversionRequestsQueryOptions(username || ''),
    enabled: !!username,
    select: (data) => {
      return data
        .filter((request) => request.amount.includes(symbol))
        .map((request) => ({
          trxIndex: request.requestid,
          iconType: 'MaterialIcons' as const,
          textKey: 'convert_request',
          created: request.conversion_date,
          icon: 'hourglass-full',
          value: request.amount,
        }));
    },
  });

  const collateralizedConversionQuery = useQuery({
    ...getCollateralizedConversionRequestsQueryOptions(username || ''),
    enabled: !!username,
    select: (data) => {
      return data
        .filter((request) => request.collateral_amount.includes(symbol))
        .map((request) => ({
          trxIndex: request.requestid,
          iconType: 'MaterialIcons' as const,
          textKey: 'collateralized_convert_request',
          created: request.conversion_date,
          icon: 'hourglass-full',
          value: request.collateral_amount,
        }));
    },
  });

  // Use SDK query options for open orders
  const openOrdersQuery = useQuery({
    ...getOpenOrdersQueryOptions(username || ''),
    enabled: !!username,
    select: (data) => {
      return data
        .filter(
          (request) =>
            request.sell_price &&
            (request.sell_price.base?.includes(symbol) ||
              request.sell_price.quote?.includes(symbol)),
        )
        .map((request) => {
          const { base, quote } = request?.sell_price || {};
          const { orderid } = request;

          // Determine which side matches the symbol and show that amount as value
          let value = '-- --';
          let details = '';

          if (base?.includes(symbol)) {
            // Symbol matches base, show base amount as value
            value = base;
            details = quote ? `@ ${base} = ${quote}` : '';
          } else if (quote?.includes(symbol)) {
            // Symbol matches quote, show quote amount as value
            value = quote;
            details = base ? `@ ${base} = ${quote}` : '';
          } else {
            // Fallback (shouldn't happen due to filter)
            value = base || quote || '-- --';
            details = base && quote ? `@ ${base} = ${quote}` : '';
          }

          return {
            trxIndex: orderid,
            iconType: 'MaterialIcons' as const,
            textKey: 'open_order',
            expires: request.expiration,
            created: request.created,
            icon: 'reorder',
            value,
            details,
            cancelable: true,
          };
        });
    },
  });

  // Combine all pending requests and sort by date
  const combinedData = useMemo(
    () =>
      buildCombinedRequests(
        savingsQuery.data || [],
        conversionQuery.data || [],
        collateralizedConversionQuery.data || [],
        openOrdersQuery.data || [],
      ),
    [
      savingsQuery.data,
      conversionQuery.data,
      collateralizedConversionQuery.data,
      openOrdersQuery.data,
    ],
  );

  const isLoading =
    savingsQuery.isLoading ||
    conversionQuery.isLoading ||
    collateralizedConversionQuery.isLoading ||
    openOrdersQuery.isLoading;
  const isError =
    savingsQuery.isError ||
    conversionQuery.isError ||
    collateralizedConversionQuery.isError ||
    openOrdersQuery.isError;
  const error =
    savingsQuery.error ||
    conversionQuery.error ||
    collateralizedConversionQuery.error ||
    openOrdersQuery.error;

  return {
    data: combinedData,
    isLoading,
    isError,
    error,
    refetch: async () => {
      const results = await Promise.all([
        savingsQuery.refetch(),
        conversionQuery.refetch(),
        collateralizedConversionQuery.refetch(),
        openOrdersQuery.refetch(),
      ]);
      return buildCombinedRequests(
        results[0].data || [],
        results[1].data || [],
        results[2].data || [],
        results[3].data || [],
      );
    },
  };
};

export const useDeleteRecurrentTransferMutation = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const queryClient = useQueryClient();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);

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
        currentAccount.name,
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
          [QUERIES.WALLET.GET_RECURRING_TRANSFERS, ASSET_IDS.HIVE, currentAccount.name],
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

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);
  console.log(currentAccount);
  const mutation = useMutation<any, Error, ProfileToken[]>({
    mutationFn: async (tokens) => {
      if (!currentAccount?.profile) {
        throw new Error('Profile metadata not available');
      }

      const newProfileMeta = {
        ...(currentAccount.profile || {}),
        tokens: [...tokens],
      };

      await profileUpdate(newProfileMeta, pinHash, currentAccount);

      return newProfileMeta;
    },

    onSuccess: (newProfileMeta) => {
      // update current account in redux
      const _currentAccount = {
        ...currentAccount,
        profile: newProfileMeta,
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
