import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useState, useMemo, useEffect, useRef } from 'react';
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
  getHiveAssetTransactionsQueryOptions,
  getHbdAssetTransactionsQueryOptions,
  getHivePowerAssetTransactionsQueryOptions,
  getPointsQueryOptions,
  getPortfolioQueryOptions,
  getHiveEngineTokenTransactions,
  useBroadcastMutation,
  buildRecurrentTransferOp,
} from '@ecency/sdk';
import { getHistoryOpsForSymbol, matchesAssetTicker } from '../../../utils/walletHistory';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { resolvePointType } from '../../../constants/options/points';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { claimPoints } from '../../ecency/ePoint';
import { getAccount } from '../../hive/hive';
import {
  useClaimRewardsMutation as useSdkClaimRewardsMutation,
  useAccountUpdateMutation,
} from '../../sdk/mutations';
import { useAuthContext } from '../../sdk';
import QUERIES from '../queryKeys';
import { toastNotification } from '../../../redux/actions/uiAction';
import { updateClaimCache } from '../../../redux/actions/cacheActions';
import { selectCurrentAccount, selectGlobalProps } from '../../../redux/selectors';
import { ClaimsCollection } from '../../../redux/reducers/cacheReducer';
import {
  groomingEngineHistory,
  groomingTransactionData,
  groomingPointsTransactionData,
  transferTypes,
} from '../../../utils/wallet';
import { convertEngineHistory } from '../../hive-engine/converters';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { ProfileToken } from '../../../redux/reducers/walletReducer';

interface ClaimRewardsMutationVars {
  symbol: string;
}

interface RecurrentTransferPayload {
  from: string;
  to: string;
  amount: string;
  memo: string;
  recurrence: number;
  executions: number;
}

const ACTIVITIES_FETCH_LIMIT = 50;

// A page whose rows are all filtered out client-side leaves the list empty, and an
// empty list is never scrolled, so `onEndReached` never fires to pull the next page.
// Auto-advance at most this many pages while nothing renders.
const MAX_AUTO_ADVANCE_PAGES = 5;

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
    select: (data) => {
      // Defensive check: ensure data and wallets exist and wallets is an array
      if (!data || !data.wallets || !Array.isArray(data.wallets) || data.wallets.length === 0) {
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
    // Cache the portfolio for 30s so quick tab re-visits paint instantly from
    // cache instead of showing the "Updating…" skeleton on every mount.
    // Background refresh still happens on focus/foreground when data is stale.
    staleTime: 30 * 1000,
    enabled: !!currentAccount?.name, // Only fetch when logged in
    retry: 2,
    // Cap the backoff so a flaky proxy can't leave the wallet on the skeleton for
    // the default ~exponential delay (which climbs toward 30s) before surfacing the
    // error/retry state.
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
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
    return assetsQuery.data?.find((asset) => asset.symbol === symbol);
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
  const currency = useAppSelector((state) => state.application.currency);
  const [isClaimingColl, setIsClaimingColl] = useState<{ [key: string]: boolean }>({});
  const portfolioBaseKey = ['wallet', 'portfolio', 'v2', currentAccount?.name || ''] as const;
  const portfolioKeyEnabled = [...portfolioBaseKey, 'only-enabled', currency.currency] as const;
  const portfolioKeyAll = [...portfolioBaseKey, 'all', currency.currency] as const;

  const sdkClaimRewards = useSdkClaimRewardsMutation();
  const authContext = useAuthContext();
  const username = currentAccount?.name;

  const engineClaimMutation = useBroadcastMutation(
    ['hive', 'scot-claim-token'],
    username || '',
    ({ symbols }: { symbols: string[] }) => [
      [
        'custom_json',
        {
          id: 'scot_claim_token',
          required_auths: [],
          required_posting_auths: [username || ''],
          json: JSON.stringify(symbols.map((r) => ({ symbol: r }))),
        },
      ],
    ],
    undefined,
    authContext,
    'posting',
    { broadcastMode: 'async' },
  );

  const _mutationFn = async ({ symbol }: ClaimRewardsMutationVars) => {
    if (!currentAccount?.name) {
      throw new Error('No current account');
    }
    const account = await getAccount(currentAccount.name);
    if (!account) {
      throw new Error('Account not found');
    }

    if (symbol === 'POINTS') {
      await claimPoints();
    } else if (['HP', 'HBD', 'HIVE'].includes(symbol)) {
      await sdkClaimRewards.mutateAsync({
        rewardHive: symbol === 'HIVE' ? account.reward_hive_balance : '0.000 HIVE',
        rewardHbd: symbol === 'HBD' ? account.reward_hbd_balance : '0.000 HBD',
        rewardVests: symbol === 'HP' ? account.reward_vesting_balance : '0.000000 VESTS',
      });
    } else {
      await engineClaimMutation.mutateAsync({ symbols: [symbol] });
    }
    return true;
  };

  const mutation = useMutation<boolean, Error, ClaimRewardsMutationVars>({
    mutationFn: _mutationFn,
    retry: 0,
    onMutate({ symbol }) {
      setIsClaimingColl((prev) => ({ ...prev, [symbol]: true }));
    },
    onSuccess: async (data, { symbol }) => {
      setIsClaimingColl((prev) => ({ ...prev, [symbol]: false }));

      // Update claim cache and set claimed asset to zero in portfolio data (loop only once)
      let claimedValue: number | undefined;
      const updatePortfolio = (data?: PortfolioItem[]) => {
        if (!data || !Array.isArray(data)) return data;
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

      // Wait 2 seconds before invalidating to allow backend to process the claim
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Invalidate portfolio to fetch fresh balances (prefix match, no predicate scan)
      await queryClient.invalidateQueries({
        queryKey: portfolioBaseKey,
      });

      if (symbol === 'POINTS') {
        queryClient.invalidateQueries({
          queryKey: ['points', currentAccount.name],
        });
      }

      // Invalidate activities/transactions so activity list updates (lazy refetch on next view)
      queryClient.invalidateQueries({
        queryKey: [QUERIES.WALLET.GET_ACTIVITIES, currentAccount.name],
      });
      queryClient.invalidateQueries({
        queryKey: ['accounts', 'transactions', currentAccount.name],
      });
    },
    onError: async (error, { symbol }) => {
      setIsClaimingColl((prev) => ({ ...prev, [symbol]: false }));

      if (symbol === 'POINTS') {
        // In some cases claim request may succeed on backend but fail locally due to
        // long-running response or connectivity hiccups. Re-fetch the portfolio to
        // verify whether pending rewards were actually claimed before surfacing an error.
        // Always fetch fresh data to verify whether the claim actually succeeded.
        // fetchQuery returns the raw SDK response { wallets: PortfolioItem[] },
        // not the select-transformed array that useQuery provides.
        let portfolio: PortfolioItem[] | undefined;
        try {
          const raw = await queryClient.fetchQuery<any>(
            getPortfolioQueryOptions(
              currentAccount?.name || '',
              (currency as any).currency,
              true,
            ) as any,
          );
          portfolio = Array.isArray(raw) ? raw : (raw as any)?.wallets;
        } catch {
          // Fetch failed — fall back to whatever is in the cache.
          // Cache may hold the raw SDK shape { wallets: [...] } or the
          // select-transformed PortfolioItem[], so normalise here.
          const cached: any =
            queryClient.getQueryData(portfolioKeyEnabled) ||
            queryClient.getQueryData(portfolioKeyAll);
          portfolio = Array.isArray(cached) ? cached : cached?.wallets;
        }

        const pointsAsset = portfolio?.find((item) => item.symbol === symbol);
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
  const isChain = layer === 'chain';
  const isHive = !isEngine && !isPoints && !isChain;

  const [isRefreshing, setIsRefreshing] = useState(false);

  // For POINTS, use SDK points query to get activities from Ecency API
  const pointsQuery = useQuery({
    ...getPointsQueryOptions(username, 0),
    enabled: !!username && isPoints,
  });

  // Only fetch Hive transactions for native Hive tokens (HIVE, HBD, HP)
  // External chain tokens (BNB, ETH, etc.) have no transaction history API.
  //
  // History comes from `condenser_api.get_account_history` with a server-side
  // operation bitmask. The previous `getTransactionsInfiniteQueryOptions` path called
  // hafah's REST `/accounts/{name}/operations` with a 30-op-type filter, which on an
  // account with a large history takes 2-28s server-side (and answers HTTP 500
  // "canceling statement due to statement timeout" on some nodes) against the 10s
  // client ceiling set in `sdk-config.ts`, so the list simply never loaded. The same
  // filter over RPC answers in well under a second.
  //
  // Pagination is the SDK's: 2.3.80 fixed the cursor to walk back from the oldest row
  // on the page (a page arrives in ascending `num`), so no local override is needed.
  const chainQueryOptions = useMemo(() => {
    const historyOps = getHistoryOpsForSymbol(symbol);
    const name = username ?? '';

    switch (symbol) {
      case 'HBD':
        return getHbdAssetTransactionsQueryOptions(name, ACTIVITIES_FETCH_LIMIT, historyOps);
      case 'HP':
        return getHivePowerAssetTransactionsQueryOptions(name, ACTIVITIES_FETCH_LIMIT, historyOps);
      default:
        return getHiveAssetTransactionsQueryOptions(name, ACTIVITIES_FETCH_LIMIT, historyOps);
    }
  }, [symbol, username]);

  const chainQuery = useInfiniteQuery({
    ...chainQueryOptions,
    // Guard, not a workaround. These options used to seed
    // `initialData: { pages: [], pageParams: [] }` for the web's server-prefetched
    // pages; against this client's staleTime of 60s that empty seed reads as fresh
    // data and suppresses the very first fetch, so the history renders empty and
    // nothing reports an error. @ecency/sdk 2.3.80 dropped it, and no SDK test pins
    // its absence, so keep this until one does.
    initialData: undefined,
    enabled: !!username && isHive,
  });

  const engineQuery = useInfiniteQuery({
    queryKey: [QUERIES.WALLET.GET_ACTIVITIES, username, symbol, 'engine'],
    enabled: !!username && isEngine,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      if (!username) return [];
      const offset = ACTIVITIES_FETCH_LIMIT * pageParam;
      const engineHistory = await getHiveEngineTokenTransactions(
        username,
        symbol,
        ACTIVITIES_FETCH_LIMIT,
        offset,
      );
      return engineHistory.map(convertEngineHistory).map(groomingEngineHistory);
    },
    getNextPageParam: (lastPage, pages) => (lastPage?.length ? pages.length : undefined),
  });

  // Bounded auto-advance counter, declared here so `_refresh` can clear it.
  const autoAdvancedRef = useRef(0);

  const _refresh = async () => {
    setIsRefreshing(true);
    autoAdvancedRef.current = 0;
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
        const pointType = resolvePointType(item);
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
      const merged = (unionBy as any)(...pages, 'engineTrxId');
      return merged.sort(
        (a: any, b: any) => new Date(b.created ?? 0).getTime() - new Date(a.created ?? 0).getTime(),
      );
    }

    // Each SDK page is a Transaction[] whose items are flat operation objects
    // ({ num, type, timestamp, ...opValue }) that groomingTransactionData understands.
    // Older cached pages may still hold the { entries } wrapper or the legacy
    // [trxIndex, { op }] tuple form, so tolerate all three.
    const _chainPages = (chainQuery.data as any)?.pages as
      | Array<unknown[] | { entries?: unknown[] }>
      | undefined;
    const history: any[] =
      _chainPages?.flatMap((p) =>
        Array.isArray(p) ? p : (p as { entries?: unknown[] })?.entries ?? [],
      ) || [];
    const transfers = history.filter((tx) => {
      const opType = Array.isArray(tx) ? get(tx[1], 'op[0]', false) : get(tx, 'type', false);
      return transferTypes.includes(opType);
    });

    const activities = transfers.map((item) =>
      groomingTransactionData(item, globalProps.hivePerMVests),
    );

    return activities.filter((item) => matchesAssetTicker(item, symbol));
  }, [
    pointsQuery.data?.transactions,
    (chainQuery.data as any)?.pages,
    engineQuery.data?.pages,
    isPoints,
    isEngine,
    globalProps.hivePerMVests,
    symbol,
  ]);

  // A page can be filtered down to nothing (an HBD-only page on the HIVE tab, a run of
  // curation rewards on HBD), leaving an empty list that is never scrolled and so never
  // fires `onEndReached` to pull the next page. Walk forward a bounded number of pages
  // while nothing renders instead of showing the user an empty history.
  useEffect(() => {
    autoAdvancedRef.current = 0;
  }, [symbol, username]);

  useEffect(() => {
    if (!isHive || _data.length > 0) {
      return;
    }
    if (!chainQuery.hasNextPage || chainQuery.isFetching) {
      return;
    }
    if (autoAdvancedRef.current >= MAX_AUTO_ADVANCE_PAGES) {
      return;
    }

    autoAdvancedRef.current += 1;
    chainQuery.fetchNextPage();
  }, [isHive, _data.length, chainQuery.hasNextPage, chainQuery.isFetching]);

  const activeQuery = isPoints ? pointsQuery : isEngine ? engineQuery : chainQuery;

  return {
    data: _data,
    isRefreshing,
    isLoading:
      isPoints || isEngine || isHive ? activeQuery.isLoading || activeQuery.isFetching : false,
    isError: isPoints || isEngine || isHive ? activeQuery.isError : false,
    error: isPoints || isEngine || isHive ? activeQuery.error : null,
    fetchNextPage: _fetchNextPage,
    refresh: _refresh,
  };
};

// added query to tracker recurring transfers using SDK
export const useRecurringActivitesQuery = (coinId: string) => {
  const currentAccount = useAppSelector(selectCurrentAccount);
  const username = currentAccount?.name;

  // Every caller now passes the portfolio symbol ('HIVE'), not the legacy asset id
  // ('hive'), so gating on ASSET_IDS.HIVE alone left this query permanently disabled
  // and the coin summary stuck on "0" recurrent transfers. Accept both spellings.
  const isHiveAsset = coinId === ASSET_IDS.HIVE || coinId === 'HIVE';

  // Always call useQuery (Rules of Hooks) - use enabled to control execution
  const query = useQuery({
    ...getRecurrentTransfersQueryOptions(username || ''),
    enabled: isHiveAsset && !!username, // Only fetch for HIVE and when username exists
    // The SDK query is scoped to the account, not to an asset, so it returns every
    // schedule the account has. The total below sums bare `parseFloat` values and the
    // summary labels them HIVE, so an account with 1 HIVE and 10 HBD scheduled read as
    // "11 HIVE" and the modal listed the HBD schedules under HIVE. Latent until the
    // gate above started matching.
    select: (data) =>
      data.filter(
        (item) =>
          String(item.amount || '')
            .trim()
            .split(/\s+/)[1] === 'HIVE',
      ),
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
  const authContext = useAuthContext();

  const recurrentTransferBroadcast = useBroadcastMutation(
    ['hive', 'delete-recurrent-transfer'],
    currentAccount?.name || '',
    ({ from, to, amount, memo, recurrence, executions }: RecurrentTransferPayload) => [
      buildRecurrentTransferOp(from, to, amount, memo, recurrence, executions),
    ],
    undefined,
    authContext,
    'active',
    { broadcastMode: 'async' },
  );

  const mutation = useMutation<boolean, Error, { recurrentTransfer: RecurrentTransfer }>({
    mutationFn: async ({ recurrentTransfer }) => {
      if (!currentAccount?.name) {
        throw new Error('No current account');
      }
      const amountParts = String(recurrentTransfer.amount || '')
        .trim()
        .split(/\s+/);
      const amountSymbol = amountParts[1] || 'HIVE';
      // A recurrent transfer is cancelled by broadcasting it again with a zero
      // amount. Hive's recurrent_transfer_operation::validate() still runs and
      // requires recurrence >= 24 and executions >= 2 *unconditionally* (even
      // when amount is 0), so sending executions: 0 made the node reject the op
      // — the cancellation never landed and the schedule kept showing in the
      // wallet. Once amount is 0 the evaluator just deletes the schedule, so
      // these counts only need to pass validation; their values are otherwise
      // ignored.
      await recurrentTransferBroadcast.mutateAsync({
        from: recurrentTransfer.from,
        to: recurrentTransfer.to,
        amount: `0.000 ${amountSymbol}`,
        memo: recurrentTransfer.memo || '',
        recurrence: Math.max(24, recurrentTransfer.recurrence || 0),
        executions: 2,
      });
      return true;
    },
    retry: 0,
    onSuccess: (_, { recurrentTransfer }) => {
      if (!currentAccount?.name) {
        return;
      }

      // manually update previous query data
      const recurrentKey = getRecurrentTransfersQueryOptions(currentAccount.name).queryKey;
      const prevData = queryClient.getQueryData<RecurrentTransfer[]>(recurrentKey);

      if (prevData) {
        const updatedData = prevData.filter((item) => item.id !== recurrentTransfer.id);
        queryClient.setQueryData(recurrentKey, updatedData);
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
  const accountUpdateMutation = useAccountUpdateMutation();

  const mutation = useMutation<any, Error, ProfileToken[]>({
    mutationFn: async (tokens) => {
      if (!currentAccount?.name) {
        throw new Error('No active account');
      }

      const baseProfile = currentAccount.profile || {};
      const newProfileMeta = {
        ...baseProfile,
        tokens: [...tokens],
      };

      await accountUpdateMutation.mutateAsync({
        profile: newProfileMeta,
      });

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
        intl.formatMessage({ id: 'alert.update_tokens_failed' }),
        error instanceof Error ? error.message : String(error),
      );
    },
  });

  return mutation;
};
