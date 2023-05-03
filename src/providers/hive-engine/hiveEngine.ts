

import {
  EngineContracts,
  EngineIds,
  EngineTables,
  JSON_RPC,
  Methods,
  EngineRequestPayload,
  Token,
  TokenBalance,
  TokenStatus,
  HiveEngineToken,
  EngineMetric,
  MarketData,
} from './hiveEngine.types';
import { convertEngineToken, convertRewardsStatus, convertMarketData } from './converters';
import bugsnapInstance from '../../config/bugsnag';
import ecencyApi from '../../config/ecencyApi';


/**
 * hive engine docs reference:
 * https://hive-engine.github.io/engine-docs/
 * proxied path for https://api.hive-engine.com/rpc/contracts
 */
const PATH_ENGINE_CONTRACTS = '/private-api/engine-api';

//proxied path for 'https://scot-api.hive-engine.com/';
const PATH_ENGINE_REWARDS = '/private-api/engine-reward-api';

//proxied path for 'https://info-api.tribaldex.com/market/ohlcv';
const PATH_ENGINE_CHART = '/private-api/engine-chart-api';

//sample hive history endpoint call
//https://history.hive-engine.com/accountHistory?account=demo.com&limit=10&offset=10


export const fetchTokenBalances = (account: string): Promise<TokenBalance[]> => {
  const data: EngineRequestPayload = {
    jsonrpc: JSON_RPC.RPC_2,
    method: Methods.FIND,
    params: {
      contract: EngineContracts.TOKENS,
      table: EngineTables.BALANCES,
      query: {
        account: account,
      },
    },
    id: EngineIds.ONE,
  };

  return ecencyApi.post(PATH_ENGINE_CONTRACTS, data)
    .then((r) => r.data.result)
    .catch((e) => {
      return [];
    });
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

  return ecencyApi
    .post(PATH_ENGINE_CONTRACTS, data)
    .then((r) => r.data.result)
    .catch((e) => {
      return [];
    });
};

export const fetchHiveEngineTokenBalances = async (
  account: string,
): Promise<Array<HiveEngineToken | null>> => {
  try {

    const balances = await fetchTokenBalances(account);
    const symbols = balances.map((t) => t.symbol);

    const tokens = await fetchTokens(symbols);
    const metrices = await fetchMetics(symbols);
    const unclaimed = await fetchUnclaimedRewards(account)


    return balances.map((balance) => {

      const token = tokens.find((t) => t.symbol == balance.symbol);
      const metrics = metrices.find((t) => t.symbol == balance.symbol);
      const pendingRewards = unclaimed.find((t) => t.symbol == balance.symbol);
      return convertEngineToken(balance, token, metrics, pendingRewards);
    });
  } catch (err) {
    console.warn('Failed to get engine token balances', err);
    bugsnapInstance.notify(err);
    throw err;
  }
};



export const fetchMetics = async (tokens?: string[]) => {
  try {

    const data = {
      jsonrpc: JSON_RPC.RPC_2,
      method: Methods.FIND,
      params: {
        contract: EngineContracts.MARKET,
        table: EngineTables.METRICS,
        query: {
          symbol: { $in: tokens },
        }
      },
      id: EngineIds.ONE
    };

    const response = await ecencyApi.post(PATH_ENGINE_CONTRACTS, data)
    if (!response.data.result) {
      throw new Error("No metric data returned")
    }

    return response.data.result as EngineMetric[]

  } catch (err) {
    console.warn('Failed to get engine metrices', err);
    bugsnapInstance.notify(err);
    throw err;
  }
}


export const fetchUnclaimedRewards = async (account: string): Promise<TokenStatus[]> => {
  try {
    const response = await ecencyApi.get(`${PATH_ENGINE_REWARDS}/${account}`, {
      params:{hive:1}
    })
    const rawData = Object.values(response.data)
    if (!rawData || rawData.length === 0) {
      throw new Error("No rewards data returned");
    }

    const data = rawData.map(convertRewardsStatus);
    const filteredData = data.filter(item => item && item.pendingToken > 0)

    console.log('unclaimed engine rewards data', filteredData);
    return filteredData;

  } catch (err) {
    console.warn("failed ot get unclaimed engine rewards", err)
    bugsnapInstance.notify(err);
    return [];
  }
};

export const fetchEngineMarketData = async (symbol: any, vsCurrency:string = 'usd', days:number = 0, interval = 'daily') => {
  try {
    const response = await ecencyApi.get(PATH_ENGINE_CHART, {
      params: { symbol, interval }
    });

    const rawData = response?.data;

    if(!rawData){
      throw new Error("No data returned");
    }

    const data:MarketData[] = rawData.map(convertMarketData);

    return days > 1 && data.length > days ? data.slice(data.length - days) : data;
  } catch (err) {
    bugsnapInstance.notify(err);
    console.warn("failed to get chart data", err.message);
    return []
  }
};
