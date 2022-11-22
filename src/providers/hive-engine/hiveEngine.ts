import hiveEngineApi, { PATH_CONTRACTS } from '../../config/hiveEngineApi';
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
} from './hiveEngine.types';
import { convertEngineToken } from './converters';
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
    const tokens = await fetchTokens(balances.map((t) => t.symbol));

    return balances.map((balance) => {
      const token = tokens.find((t) => t.symbol == balance.symbol);
      return convertEngineToken(balance, token);
    });
  } catch (err) {
    console.warn('Failed to get engine token balances', err);
    bugsnapInstance.notify(err);
    throw err; 
  }
};

export const getUnclaimedRewards = async (account: string): Promise<TokenStatus[]> => {
  return (hiveEngineApi
    .get(`https://scot-api.hive-engine.com/@${account}?hive=1`)
    .then((r) => r.data)
    .then((r) => Object.values(r))
    .then((r) => r.filter((t) => (t as TokenStatus).pending_token > 0)) as any).catch(() => {
    return [];
  });
};

// export const claimRewards = async (
//   account: string,
//   tokens: string[]
// ): Promise<TransactionConfirmation> => {
//   const json = JSON.stringify(
//     tokens.map((r) => {
//       return { symbol: r };
//     })
//   );

//   return broadcastPostingJSON(account, "scot_claim_token", json);
// };

// export const stakeTokens = async (
//   account: string,
//   token: string,
//   amount: string
// ): Promise<TransactionConfirmation> => {
//   const json = JSON.stringify({
//     contractName: "tokens",
//     contractAction: "stake",
//     contractPayload: {
//       symbol: token,
//       to: account,
//       quantity: amount
//     }
//   });

//   return broadcastPostingJSON(account, "ssc-mainnet-hive", json);
// };
