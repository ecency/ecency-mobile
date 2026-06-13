import * as Sentry from '@sentry/react-native';
import {
  EngineContracts,
  EngineIds,
  EngineTables,
  JSON_RPC,
  Methods,
  EngineRequestPayload,
  Token,
  TokenBalance,
  MarketData,
} from './hiveEngine.types';
import { convertMarketData } from './converters';
import ecencyApi from '../../config/ecencyApi';

/**
 * hive engine docs reference:
 * https://hive-engine.github.io/engine-docs/
 * proxied path for https://api.hive-engine.com/rpc/contracts
 */
const PATH_ENGINE_CONTRACTS = '/private-api/engine-api';

// proxied path for 'https://info-api.tribaldex.com/market/ohlcv';
const PATH_ENGINE_CHART = '/private-api/engine-chart-api';

// All Hive-Engine reads ride a single Ecency proxy. Unlike hive-engine.com — which
// the web app queries directly and which fails over across nodes — this proxy has no
// built-in retry or request timeout, so a transient timeout/5xx surfaces as an empty
// wallet or a permanently-disabled transfer (NEXT stays greyed because token
// precision never loads). Bound each request with a timeout and retry it a couple of
// times with exponential backoff so a transient blip self-heals instead.
const ENGINE_TIMEOUT_MS = 15000;
const ENGINE_MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const postEngineContract = async <T>(data: EngineRequestPayload): Promise<T | undefined> => {
  let lastError: unknown;
  // Attempts are intentionally sequential — each retry waits for the previous one to
  // fail before backing off, so the await-in-loop is by design here.
  for (let attempt = 0; attempt <= ENGINE_MAX_RETRIES; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await ecencyApi.post(PATH_ENGINE_CONTRACTS, data, {
        timeout: ENGINE_TIMEOUT_MS,
      });
      return response.data.result as T;
    } catch (err) {
      lastError = err;
      if (attempt < ENGINE_MAX_RETRIES) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(500 * 2 ** attempt);
      }
    }
  }
  throw lastError;
};

export const fetchTokenBalances = (account: string): Promise<TokenBalance[]> => {
  const data: EngineRequestPayload = {
    jsonrpc: JSON_RPC.RPC_2,
    method: Methods.FIND,
    params: {
      contract: EngineContracts.TOKENS,
      table: EngineTables.BALANCES,
      query: {
        account,
      },
    },
    id: EngineIds.ONE,
  };

  // Resolve [] only for a genuine empty result; a transport failure (after retries)
  // rejects so callers — the wallet list query and the transfer balance fetch — can
  // surface an error/retry instead of mistaking a proxy outage for an empty wallet.
  return postEngineContract<TokenBalance[]>(data).then((result) => result ?? []);
};

export const fetchTokens = (tokens: string[]): Promise<Token[]> => {
  const data: EngineRequestPayload = {
    jsonrpc: JSON_RPC.RPC_2,
    method: Methods.FIND,
    params: {
      contract: EngineContracts.TOKENS,
      table: EngineTables.TOKENS,
      query: {
        symbol: { $in: tokens },
      },
    },
    id: EngineIds.ONE,
  };

  // Resolve [] only for a genuine empty result; a transport failure (after retries)
  // rejects so the transfer precision lookup can fall back / retry instead of
  // silently leaving precision unset.
  return postEngineContract<Token[]>(data).then((result) => result ?? []);
};

export const fetchEngineMarketData = async (
  symbol: any,
  vsCurrency = 'usd',
  days = 0,
  interval = 'daily',
) => {
  try {
    const response = await ecencyApi.get(PATH_ENGINE_CHART, {
      params: { symbol, interval },
    });

    const rawData = response?.data;

    if (!rawData) {
      throw new Error('No data returned');
    }

    const data: MarketData[] = rawData.map(convertMarketData);
    console.log('TODO: later use vsCurrency as well', vsCurrency);

    return days > 1 && data.length > days ? data.slice(data.length - days) : data;
  } catch (err) {
    Sentry.captureException(err);
    console.warn('failed to get chart data', err.message);
    return [];
  }
};
