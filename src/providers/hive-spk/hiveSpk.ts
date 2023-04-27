import { PrivateKey } from '@esteemapp/dhive';
import { Operation } from '@hiveio/dhive';
import axios from 'axios';
import parseAsset from '../../utils/parseAsset';
import parseToken from '../../utils/parseToken';
import { getActiveKey, getDigitPinCode, sendHiveOperations } from '../hive/dhive';
// import { PrivateKey, TransactionConfirmation } from "@hiveio/dhive";
// import { client as hiveClient } from "./hive";
// import * as keychain from "../helper/keychain";
// import { broadcastPostingJSON } from "./operations";
// import { hotSign } from "../helper/hive-signer";
import { Markets, SpkApiWallet, SpkMarkets, SpkPowerMode } from './hiveSpk.types';

const spkNodes = [
  'https://spk.good-karma.xyz',
  'https://spkinstant.hivehoneycomb.com',
  'https://spknode.blocktrades.us',
  'https://spk.tcmd-spkcc.com',
  'https://spktoken.dlux.io',
];

const spkNode = 'https://spk.good-karma.xyz/'; // spkNodes[Math.floor(Math.random()*spkNodes.length)];

const spkApi = axios.create({
  baseURL: spkNode,
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
      sstats.spk_rate_ldel,
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
  const resp = await spkApi.get<SpkMarkets>('markets');
  return {
    list: Object.entries(resp.data.markets.node).map(([name, node]) => ({
      name,
      status:
        node.lastGood >= resp.data.head_block - 1200
          ? '🟩'
          : node.lastGood > resp.data.head_block - 28800
          ? '🟨'
          : '🟥',
    })),
    raw: resp.data,
  };
};

const executeSpkAction = (id: string, json: any, currentAccount: any, pinHash: string) => {
  const pin = getDigitPinCode(pinHash);
  const key = getActiveKey(currentAccount.local, pin);
  const username = currentAccount.name;

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const op = {
      id,
      json: JSON.stringify(json),
      required_auths: [username],
      required_posting_auths: [],
    };
    const opArray: Operation[] = [['custom_json', op]];
    return sendHiveOperations(opArray, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

/**
 * SPK operations
 */

export const transferSpk = async (
  currentAccount: any,
  pinHash: string,
  data: {
    destination: string;
    amount: string;
    memo?: string;
  },
) => {
  const json = {
    to: data.destination,
    amount: parseToken(data.amount) * 1000,
    ...(data.memo ? { memo: data.memo } : {}),
  };

  return executeSpkAction('spkcc_spk_send', json, currentAccount, pinHash);
};

export const transferLarynx = async (
  currentAccount: any,
  pinHash: string,
  data: {
    destination: string;
    amount: string;
    memo?: string;
  },
) => {
  const json = {
    to: data.destination,
    amount: parseToken(data.amount) * 1000,
    ...(data.memo ? { memo: data.memo } : {}),
  };
  return executeSpkAction('spkcc_send', json, currentAccount, pinHash);
};

export const delegateLarynx = async (
  currentAccount: any,
  pinHash: string,
  to: string,
  amount: string,
) => {
  const json = {
    to,
    amount: +amount * 1000,
  };
  return executeSpkAction('spkcc_power_grant', json, currentAccount, pinHash);
};

export const powerLarynx = async (
  currentAccount: any,
  pinHash: string,
  data: {
    mode: SpkPowerMode;
    amount: string;
  },
) => {
  const json = {
    amount: parseToken(data.amount) * 1000,
  };
  return executeSpkAction(`spkcc_power_${data.mode}`, json, currentAccount, pinHash);
};

export const lockLarynx = async (
  currentAccount: any,
  pinHash: string,
  mode: 'lock' | 'unlock',
  amount: string,
) => {
  const json = {
    amount: +amount * 1000,
  };
  return executeSpkAction(
    `spkcc_gov_${mode === 'lock' ? 'up' : 'down'}`,
    json,
    currentAccount,
    pinHash,
  );
};

/**
 * Claim operations
 */

// export const claimLarynxRewards = async (from: string): Promise<TransactionConfirmation> => {
//   const json = { gov: false };

//   return broadcastPostingJSON(from, "spkcc_shares_claim", json);
// };

// export const claimAirdropLarynxRewards = async (from: string): Promise<TransactionConfirmation> => {
//   const json = { claim: true };

//   return broadcastPostingJSON(from, "spkcc_claim", json);
// };

/** Hive signer operations */

// export const lockLarynxByKey = async (

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

// export const delegateLarynxByHs = async (from: string, to: string, amount: string) => {
//   return sendSpkGeneralByHs("spkcc_power_grant", from, to, +amount);
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

// export const sendSpkByHs = (from: string, to: string, amount: string, memo?: string) => {
//   return sendSpkGeneralByHs("spkcc_spk_send", from, to, amount, memo || "");
// };

// export const sendLarynxByHs = (from: string, to: string, amount: string, memo?: string) => {
//   return sendSpkGeneralByHs("spkcc_send", from, to, amount, memo || "");
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
