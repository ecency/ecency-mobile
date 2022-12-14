import hiveEngineApi, { engineChartApi, engineRewardsApi, PATH_CONTRACTS } from '../../config/hiveEngineApi';
// import HiveEngineToken from "../helper/hive-engine-wallet";
// import { TransactionConfirmation } from "@hiveio/dhive";
// import { broadcastPostingJSON } from "./operations";
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
} from './hiveEngine.types';
import { convertEngineToken, convertRewardsStatus } from './converters';
import bugsnapInstance from '../../config/bugsnag';


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

  return hiveEngineApi
    .post(PATH_CONTRACTS, data)
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

  return hiveEngineApi
    .post(PATH_CONTRACTS, data)
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



export const fetchUnclaimedRewards = async (account: string): Promise<TokenStatus[]> => {
  try {
    const response = await engineRewardsApi.get(`@${account}?hive=1`)
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

    const response = await hiveEngineApi.post(PATH_CONTRACTS, data)
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

export const fetchMarketData = async (symbol: any, interval = 'daily') => {
  try {
    const { data: history } = await engineChartApi.get('', {
      params: { symbol, interval }
    });
    return history;
  } catch (err) {
    bugsnapInstance.notify(err);
    console.warn("failed to get chart data", err.message);
    return []
  }
};
