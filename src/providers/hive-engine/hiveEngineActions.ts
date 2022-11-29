
import { PrivateKey } from '@hiveio/dhive';
import { get } from 'lodash';
import parseToken from '../../utils/parseToken';
import { broadcastPostingJSON, getActiveKey, getDigitPinCode, sendHiveOperations } from "../hive/dhive";
import { TransferDataType } from '../hive/hive.types';
import { EngineActionJSON, EngineActions, EngineContracts } from './hiveEngine.types';


const executeEngineAction = (json: EngineActionJSON, currentAccount: any, pinHash: string) => {
  const pin = getDigitPinCode(pinHash);
  const key = getActiveKey(get(currentAccount, 'local'), pin);
  const username = get(currentAccount, 'name');


  if (key) {
    const privateKey = PrivateKey.fromString(key);

    const op = {
      id: 'ssc-mainnet-hive',
      json: JSON.stringify(json),
      required_auths: [username],
      required_posting_auths: [],
    };
    const opArray = [['custom_json', op]];
    return sendHiveOperations(opArray, privateKey);
  }

  return Promise.reject(
    new Error('Check private key permission! Required private active key or above.'),
  );
}


export const getEngineActionJSON = (
  action: EngineActions,
  to: string,
  amount: string,
  symbol: string,
  memo?: string
): EngineActionJSON => {
  return {
    contractName: EngineContracts.TOKENS,
    contractAction: action,
    contractPayload: {
      symbol,
      to,
      quantity: parseToken(amount).toString(),
      memo: action === EngineActions.TRANSFER ? memo : undefined
    }
  }
}



export const claimRewards = async (
  tokenSymbols: string[],
  currentAccount: any,
  pinHash: string,
) => {
  const json = tokenSymbols.map((r) => {
    return { symbol: r };
  });

  return broadcastPostingJSON("scot_claim_token", json, currentAccount, pinHash);
};



//HE Key Operations
//documentation reference: https://hive-engine.github.io/engine-docs/actions#actions-tokens
export const transferHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType
) => {

  const json = getEngineActionJSON(
    EngineActions.TRANSFER, 
    data.destination, 
    data.amount,
    data.fundType,
    data.memo
  )

  return executeEngineAction(json, currentAccount, pinHash);

};

export const delegateHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType
) => {
  const json = getEngineActionJSON(
    EngineActions.DELEGATE, 
    data.destination, 
    data.amount,
    data.fundType
  )

  return executeEngineAction(json, currentAccount, pinHash);
};

export const undelegateHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType
) => {
  const json = getEngineActionJSON(
    EngineActions.UNDELEGATE, 
    data.destination, 
    data.amount,
    data.fundType
  )

  return executeEngineAction(json, currentAccount, pinHash);
};


export const stakeHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType
) => {
  const json = getEngineActionJSON(
    EngineActions.STAKE, 
    data.destination, 
    data.amount,
    data.fundType
  )

  return executeEngineAction(json, currentAccount, pinHash);
};



export const unstakeHiveEngine = async (
  currentAccount: any,
  pinHash: string,
  data: TransferDataType
) => {
  const json = getEngineActionJSON(
    EngineActions.UNSTAKE, 
    data.destination, 
    data.amount,
    data.fundType
  )

  return executeEngineAction(json, currentAccount, pinHash);
};


