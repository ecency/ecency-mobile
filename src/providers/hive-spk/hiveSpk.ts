import { PrivateKey } from '@esteemapp/dhive';
import { Operation } from '@hiveio/dhive';
import axios from 'axios';
import parseToken from '../../utils/parseToken';
// import TransferTypes from '../../constants/transferTypes';
import { getActiveKey, getDigitPinCode, sendHiveOperations } from '../hive/dhive';
// import { PrivateKey, TransactionConfirmation } from "@hiveio/dhive";
// import { client as hiveClient } from "./hive";
// import * as keychain from "../helper/keychain";
// import { broadcastPostingJSON } from "./operations";
// import { hotSign } from "../helper/hive-signer";
import {
  Markets,
  SpkApiWallet,
  SpkLockMode,
  SpkMarkets,
  SpkPowerMode,
  // SpkTransactionIds,
} from './hiveSpk.types';

export const SPK_NODE_ECENCY = 'good-karma.spk';

// const spkNodes = [
//   'https://spk.good-karma.xyz',
//   'https://spkinstant.hivehoneycomb.com',
//   'https://spknode.blocktrades.us',
//   'https://spk.tcmd-spkcc.com',
//   'https://spktoken.dlux.io',
// ];

const spkNode = 'https://spk.good-karma.xyz/'; // spkNodes[Math.floor(Math.random()*spkNodes.length)];

const spkApi = axios.create({
  baseURL: spkNode,
});

export function rewardSpk(data: SpkApiWallet, sstats: any) {
  let a = 0,
    b = 0,
    c = 0,
    t = 0;

  const diff = data.head_block - data.spk_block;
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

export const getSpkActionJSON = (amount: number, to?: string, memo?: string) => {
  return {
    amount: amount * 1000,
    ...(to ? { to } : {}),
    ...(memo ? { memo } : {}),
  };
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
  data: {
    destination: string;
    amount: string;
  },
) => {
  const json = {
    to: data.destination,
    amount: parseToken(data.amount) * 1000,
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
  data: {
    mode: SpkLockMode;
    amount: string;
  },
) => {
  const json = {
    amount: parseToken(data.amount) * 1000,
  };
  return executeSpkAction(
    `spkcc_gov_${data.mode === 'lock' ? 'up' : 'down'}`,
    json,
    currentAccount,
    pinHash,
  );
};