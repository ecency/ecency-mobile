import { Operation } from '@hiveio/dhive';
import { PrivateKey } from '@esteemapp/dhive';
import { get } from 'lodash';
import parseToken from '../../utils/parseToken';
import {
  broadcastPostingJSON,
  getActiveKey,
  getDigitPinCode,
  sendHiveOperations,
} from '../hive/dhive';
import { TransferDataType } from '../hive/hive.types';
import { EngineActionJSON, EngineActions, EngineContracts } from './hiveEngine.types';

const executeEngineAction = (opArray: Operation[], currentAccount: any, pinHash: string) => {
  const pin = getDigitPinCode(pinHash);
  const key = getActiveKey(get(currentAccount, 'local'), pin);

  if (key) {
    const privateKey = PrivateKey.fromString(key);

    return sendHiveOperations(opArray, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
};

export const getEngineActionJSON = (
  action: EngineActions,
  to: string,
  amount: string,
  symbol: string,
  memo?: string,
): EngineActionJSON => {
  return {
    contractName: EngineContracts.TOKENS,
    contractAction: action,
    contractPayload: {
      symbol,
      to,
      quantity: parseToken(amount).toString(),
      memo: action === EngineActions.TRANSFER ? memo : undefined,
    },
  };
};

export const getEngineActionOpArray = (
  action: EngineActions,
  username: string,
  to: string,
  amount: string,
  symbol: string,
  memo?: string,
): Operation[] => {
  const json = getEngineActionJSON(action, to, amount, symbol, memo);

  const op = {
    id: 'ssc-mainnet-hive',
    json: JSON.stringify(json),
    required_auths: [username],
    required_posting_auths: [],
  };
  return [['custom_json', op]];
};

export const claimRewards = async (
  tokenSymbols: string[],
  currentAccount: any,
  pinHash: string,
) => {
  const json = tokenSymbols.map((r) => {
    return { symbol: r };
  });

  return broadcastPostingJSON('scot_claim_token', json, currentAccount, pinHash);
};

// HE Key Operations
// documentation reference: https://hive-engine.github.io/engine-docs/actions#actions-tokens
export const transferHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType,
) => {
  const opArray = getEngineActionOpArray(
    EngineActions.TRANSFER,
    currentAccount.username,
    data.destination,
    data.amount,
    data.fundType,
    data.memo,
  );

  return executeEngineAction(opArray, currentAccount, pinHash);
};

export const delegateHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType,
) => {
  const opArray = getEngineActionOpArray(
    EngineActions.DELEGATE,
    currentAccount.username,
    data.destination,
    data.amount,
    data.fundType,
  );

  return executeEngineAction(opArray, currentAccount, pinHash);
};

export const undelegateHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType,
) => {
  const opArray = getEngineActionOpArray(
    EngineActions.UNDELEGATE,
    currentAccount.username,
    data.destination,
    data.amount,
    data.fundType,
  );

  return executeEngineAction(opArray, currentAccount, pinHash);
};

export const stakeHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType,
) => {
  const opArray = getEngineActionOpArray(
    EngineActions.STAKE,
    currentAccount.username,
    data.destination,
    data.amount,
    data.fundType,
  );

  return executeEngineAction(opArray, currentAccount, pinHash);
};

export const unstakeHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType,
) => {
  const opArray = getEngineActionOpArray(
    EngineActions.UNSTAKE,
    currentAccount.username,
    data.destination,
    data.amount,
    data.fundType,
  );

  return executeEngineAction(opArray, currentAccount, pinHash);
};
