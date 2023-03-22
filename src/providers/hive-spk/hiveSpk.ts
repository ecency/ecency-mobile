import axios from "axios";
// import { PrivateKey, TransactionConfirmation } from "@hiveio/dhive";
// import { client as hiveClient } from "./hive";
// import * as keychain from "../helper/keychain";
// import { broadcastPostingJSON } from "./operations";
// import { hotSign } from "../helper/hive-signer";
import { HivePrice, Markets, SpkApiWallet, SpkMarkets } from "./hiveSpk.types";

const spkNodes = [
  "https://spk.good-karma.xyz",
  "https://spkinstant.hivehoneycomb.com",
  "https://spknode.blocktrades.us",
  "https://spk.tcmd-spkcc.com",
  "https://spktoken.dlux.io"
];

const spkNode = "https://spk.good-karma.xyz/"; //spkNodes[Math.floor(Math.random()*spkNodes.length)];

const spkApi = axios.create({
    baseURL: spkNode
  });

export function rewardSpk(data: SpkApiWallet, sstats: any) {
  let r = 0,
    a = 0,
    b = 0,
    c = 0,
    t = 0,
    diff = data.head_block - data.spk_block;
  if (!data.spk_block) {
    return 0;
  } else if (diff < 28800) {
    return 0;
  } else {
    t = diff / 28800;
    a = data.gov ? simpleInterest(data.gov, t, sstats.spk_rate_lgov) : 0;
    b = data.pow ? simpleInterest(data.pow, t, sstats.spk_rate_lpow) : 0;
    c = simpleInterest(
      (data.granted.t > 0 ? data.granted.t : 0) +
        (data.granting.t && data.granting.t > 0 ? data.granting.t : 0),
      t,
      sstats.spk_rate_ldel
    );
    const i = a + b + c;
    if (i) {
      return i;
    } else {
      return 0;
    }
  }
  function simpleInterest(p: number, t: number, r: number) {
    const amount = p * (1 + r / 365);
    const interest = amount - p;
    return interest * t;
  }
}

export const fetchSpkWallet = async (username: string): Promise<SpkApiWallet> => {
  const resp = await spkApi.get<SpkApiWallet>(`@${username}`);
  return resp.data;
};

export const fetchSpkMarkets = async (): Promise<Markets> => {
  const resp = await spkApi.get<SpkMarkets>(`markets`);
  return {
    list: Object.entries(resp.data.markets.node).map(([name, node]) => ({
      name,
      status:
        node.lastGood >= resp.data.head_block - 1200
          ? "🟩"
          : node.lastGood > resp.data.head_block - 28800
          ? "🟨"
          : "🟥"
    })),
    raw: resp.data
  };
};

// export const getHivePrice = async (): Promise<HivePrice> => {
//   try {
//     const resp = await axios.get<HivePrice>("https://api.coingecko.com/api/v3/simple/price", {
//       params: {
//         ids: "hive",
//         vs_currencies: "usd"
//       }
//     });
//     return resp.data;
//   } catch (e) {
//     return { hive: { usd: 0 } };
//   }
// };

// const sendSpkGeneralByHs = (
//   id: string,
//   from: string,
//   to: string,
//   amount: string | number,
//   memo?: string
// ) => {
//   const params = {
//     authority: "active",
//     required_auths: `["${from}"]`,
//     required_posting_auths: "[]",
//     id,
//     json: JSON.stringify({
//       to,
//       amount: +amount * 1000,
//       ...(typeof memo === "string" ? { memo } : {})
//     })
//   };
//   hotSign("custom-json", params, `@${from}/spk`);
// };

// const transferSpkGeneralByKey = async (
//   id: string,
//   from: string,
//   key: PrivateKey,
//   to: string,
//   amount: string | number,
//   memo?: string
// ): Promise<TransactionConfirmation> => {
//   const json = JSON.stringify({
//     to,
//     amount: +amount * 1000,
//     ...(typeof memo === "string" ? { memo } : {})
//   });

//   const op = {
//     id,
//     json,
//     required_auths: [from],
//     required_posting_auths: []
//   };

//   return await hiveClient.broadcast.json(op, key);
// };

// const transferSpkGeneralByKc = (
//   id: string,
//   from: string,
//   to: string,
//   amount: string | number,
//   memo?: string
// ) => {
//   const json = JSON.stringify({
//     to,
//     amount: +amount * 1000,
//     ...(typeof memo === "string" ? { memo } : {})
//   });
//   return keychain.customJson(
//     from,
//     id,
//     "Active",
//     json,
//     `${
//       id === "spkcc_spk_send"
//         ? "Transfer SPK"
//         : id === "spkcc_power_grant"
//         ? "Delegate LARYNX"
//         : "Transfer LARYNX"
//     }`
//   );
// };

// export const sendSpkByHs = (from: string, to: string, amount: string, memo?: string) => {
//   return sendSpkGeneralByHs("spkcc_spk_send", from, to, amount, memo || "");
// };

// export const sendLarynxByHs = (from: string, to: string, amount: string, memo?: string) => {
//   return sendSpkGeneralByHs("spkcc_send", from, to, amount, memo || "");
// };

// export const transferSpkByKey = async (
//   from: string,
//   key: PrivateKey,
//   to: string,
//   amount: string,
//   memo: string
// ): Promise<TransactionConfirmation> => {
//   return transferSpkGeneralByKey("spkcc_spk_send", from, key, to, amount, memo || "");
// };

// export const transferLarynxByKey = async (
//   from: string,
//   key: PrivateKey,
//   to: string,
//   amount: string,
//   memo: string
// ): Promise<TransactionConfirmation> => {
//   return transferSpkGeneralByKey("spkcc_send", from, key, to, amount, memo || "");
// };

// export const transferSpkByKc = (from: string, to: string, amount: string, memo: string) => {
//   return transferSpkGeneralByKc("spkcc_spk_send", from, to, amount, memo || "");
// };

// export const transferLarynxByKc = async (
//   from: string,
//   to: string,
//   amount: string,
//   memo: string
// ) => {
//   return transferSpkGeneralByKc("spkcc_send", from, to, amount, memo || "");
// };

// export const delegateLarynxByKey = async (
//   from: string,
//   key: PrivateKey,
//   to: string,
//   amount: string
// ) => {
//   return transferSpkGeneralByKey("spkcc_power_grant", from, key, to, +amount);
// };

// export const delegateLarynxByHs = async (from: string, to: string, amount: string) => {
//   return sendSpkGeneralByHs("spkcc_power_grant", from, to, +amount);
// };

// export const delegateLarynxByKc = async (from: string, to: string, amount: string) => {
//   return transferSpkGeneralByKc("spkcc_power_grant", from, to, +amount);
// };

// export const claimLarynxRewards = async (from: string): Promise<TransactionConfirmation> => {
//   const json = { gov: false };

//   return broadcastPostingJSON(from, "spkcc_shares_claim", json);
// };

// export const claimAirdropLarynxRewards = async (from: string): Promise<TransactionConfirmation> => {
//   const json = { claim: true };

//   return broadcastPostingJSON(from, "spkcc_claim", json);
// };

// export const powerLarynxByKey = async (
//   mode: "up" | "down",
//   from: string,
//   key: PrivateKey,
//   amount: string
// ) => {
//   const json = JSON.stringify({ amount: +amount * 1000 });

//   const op = {
//     id: `spkcc_power_${mode}`,
//     json,
//     required_auths: [from],
//     required_posting_auths: []
//   };

//   return await hiveClient.broadcast.json(op, key);
// };

// export const powerLarynxByHs = (mode: "up" | "down", from: string, amount: string) => {
//   const params = {
//     authority: "active",
//     required_auths: `["${from}"]`,
//     required_posting_auths: "[]",
//     id: `spkcc_power_${mode}`,
//     json: JSON.stringify({ amount: +amount * 1000 })
//   };
//   hotSign("custom-json", params, `@${from}/spk`);
// };

// export const powerLarynxByKc = async (mode: "up" | "down", from: string, amount: string) => {
//   const json = JSON.stringify({ amount: +amount * 1000 });
//   return keychain.customJson(from, `spkcc_power_${mode}`, "Active", json, `Power ${mode} LARYNX`);
// };

// export const lockLarynxByKey = async (
//   mode: "lock" | "unlock",
//   key: PrivateKey,
//   from: string,
//   amount: string
// ) => {
//   const json = JSON.stringify({ amount: +amount * 1000 });

//   const op = {
//     id: mode === "lock" ? "spkcc_gov_up" : "spkcc_gov_down",
//     json,
//     required_auths: [from],
//     required_posting_auths: []
//   };

//   return await hiveClient.broadcast.json(op, key);
// };

// export const lockLarynxByHs = async (mode: "lock" | "unlock", from: string, amount: string) => {
//   const params = {
//     authority: "active",
//     required_auths: `["${from}"]`,
//     required_posting_auths: "[]",
//     id: mode === "lock" ? "spkcc_gov_up" : "spkcc_gov_down",
//     json: JSON.stringify({ amount: +amount * 1000 })
//   };
//   hotSign("custom-json", params, `@${from}/spk`);
// };

// export const lockLarynxByKc = async (mode: "lock" | "unlock", from: string, amount: string) => {
//   const json = JSON.stringify({ amount: +amount * 1000 });
//   return keychain.customJson(
//     from,
//     mode === "lock" ? "spkcc_gov_up" : "spkcc_gov_down",
//     "Active",
//     json,
//     `${mode.toUpperCase()} LARYNX`
//   );
// };
