import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { unionBy } from 'lodash';
import { RecurrentTransfer } from 'providers/hive/hive.types';
import { Alert } from 'react-native';
import { PortfolioItem, PortfolioLayer } from 'providers/ecency/ecency.types';
import {
  getSavingsWithdrawFromQueryOptions,
  getConversionRequestsQueryOptions,
  getCollateralizedConversionRequestsQueryOptions,
  getRecurrentTransfersQueryOptions,
  getOpenOrdersQueryOptions,
} from '@ecency/sdk';
import { ASSET_IDS } from '../../../constants/defaultAssets';
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
import { fetchCoinActivities } from '../../../utils/wallet';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { getPortfolio } from '../../ecency/ecency';
import { ProfileToken } from '../../../redux/reducers/walletReducer';

interface ClaimRewardsMutationVars {
  symbol: string;
}

const ACTIVITIES_FETCH_LIMIT = 50;

/** hook used to return user drafts */
export const useAssetsQuery = () => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const selectedAssets: ProfileToken[] = useAppSelector((state) => state.wallet.selectedAssets);
  const claimsCollection: ClaimsCollection = useAppSelector(
    (state) => state.cache.claimsCollection,
  );
  const currency = useAppSelector((state) => state.application.currency);

  // TODO: test assets update with currency and quote change

  const assetsQuery = useQuery({
    queryKey: [QUERIES.WALLET.GET, currentAccount?.name || '', currency.currency],
    queryFn: async () => {
      if (!currentAccount?.name) {
        console.warn('[Wallet] No username available for portfolio fetch');
        return [];
      }
      if (__DEV__) {
        console.log('[Wallet] Fetching portfolio for:', currentAccount.name, currency.currency);
      }
      try {
        const response = await getPortfolio(currentAccount.name, currency.currency, true);
        if (__DEV__) {
          console.log('[Wallet] Portfolio API response:', response?.length || 0, 'items');
          if (response && response.length > 0) {
            console.log(
              '[Wallet] Portfolio symbols:',
              response.map((r) => r.symbol),
            );
          }
        }

        if (!response || response.length === 0) {
          console.warn('Empty portfolio response');
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

        if (__DEV__) {
          console.log('Processed portfolio data:', updatedResponse.length, 'items');
        }
        return updatedResponse;
      } catch (err) {
        console.error('Failed to get portfolio data:', err);
        throw err; // Re-throw to set error state instead of returning empty array
      }
    },
    initialData: [],
    enabled: !!currentAccount?.name, // Only fetch when logged in
    retry: 2,
  });

  const selectedData = useMemo(() => {
    if (__DEV__) {
      console.log('[Wallet] Computing selectedData...');
      console.log('[Wallet] - assetsQuery.data:', assetsQuery.data?.length || 0, 'items');
      console.log('[Wallet] - selectedAssets:', selectedAssets.length, 'items');
      console.log(
        '[Wallet] - selectedAssets symbols:',
        selectedAssets.map((a) => a.symbol),
      );
    }

    if (!assetsQuery.data || !assetsQuery.data.length) {
      console.warn('[Wallet] No portfolio data available from API');
      return [];
    }

    if (selectedAssets.length === 0) {
      console.warn('[Wallet] No assets selected in Redux - this is the problem!');
      return [];
    }

    // filter only selected tokens from portfolio data
    const dataMap = new Map(assetsQuery.data.map((item) => [item.symbol, item]));
    if (__DEV__) {
      console.log('[Wallet] - Portfolio symbols:', Array.from(dataMap.keys()));
    }

    const filtered = selectedAssets.map((token) => dataMap.get(token.symbol)).filter(Boolean);
    if (__DEV__) {
      console.log('[Wallet] - Filtered result:', filtered.length, 'items');
    }

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
        currentAccount.name,
        currency.currency,
      ]);

      if (portfolioData) {
        let claimedValue;
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
          [QUERIES.WALLET.GET, currentAccount.name, currency.currency],
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
          currentAccount.name,
          currency.currency,
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
  const currentAccount = useAppSelector(selectCurrentAccount);
  const globalProps = useAppSelector(selectGlobalProps);

  const username = currentAccount?.name;
  const isEngine = layer === 'engine';

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [noMoreData, setNoMoreData] = useState(false);
  const [pageParams, setPageParams] = useState(isEngine ? [0] : [-1]);

  const _fetchActivities = async (pageParam: number) => {
    console.log('fetching page since:', pageParam);

    if (!username) {
      console.warn('[Activities] No username available for activities fetch');
      return [];
    }

    const _activites = await fetchCoinActivities({
      username,
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
      queryKey: [QUERIES.WALLET.GET_ACTIVITIES, username, symbol, pageParam],
      queryFn: () => _fetchActivities(pageParam),
      initialData: [],
      enabled: !!username, // Only fetch when username exists
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
  const combinedData = useMemo(() => {
    const allRequests = [
      ...(savingsQuery.data || []),
      ...(conversionQuery.data || []),
      ...(collateralizedConversionQuery.data || []),
      ...(openOrdersQuery.data || []),
    ];

    // Sort by expiration or creation date
    allRequests.sort((a, b) => {
      const timeA = new Date(a.expires || a.created).getTime();
      const timeB = new Date(b.expires || b.created).getTime();

      // Handle invalid dates by treating NaN as Infinity (sort to end)
      const validTimeA = Number.isNaN(timeA) ? Infinity : timeA;
      const validTimeB = Number.isNaN(timeB) ? Infinity : timeB;

      // Return proper comparator result: -1, 0, or 1
      if (validTimeA < validTimeB) return -1;
      if (validTimeA > validTimeB) return 1;
      return 0;
    });

    return allRequests;
  }, [
    savingsQuery.data,
    conversionQuery.data,
    collateralizedConversionQuery.data,
    openOrdersQuery.data,
  ]);

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
    refetch: () => {
      savingsQuery.refetch();
      conversionQuery.refetch();
      collateralizedConversionQuery.refetch();
      openOrdersQuery.refetch();
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
