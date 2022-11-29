
import { PrivateKey } from '@hiveio/dhive';
import { get } from 'lodash';
import { broadcastPostingJSON, getActiveKey, getDigitPinCode, sendHiveOperations } from "../hive/dhive";
import { EngineActionJSON, EngineActions, EngineContracts } from './hiveEngine.types';


const executeEngineAction = (json:EngineActionJSON, currentAccount:any, pinHash:string) => {
    const pin = getDigitPinCode(pinHash);
    const key = getActiveKey(get(currentAccount, 'local'), pin);
    const username = get(currentAccount, 'name');
  
  
    if (key) {
      const privateKey = PrivateKey.fromString(key);
  
      const op = {
        id:'ssc-mainnet-hive',
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


export const claimRewards = async (
    tokenSymbols:string[],
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
    symbol: string,
    to: string,
    amount: string,
    memo: string,
    currentAccount: any,
    pinHash: string
  ) => {
    const json:EngineActionJSON = {
      contractName: EngineContracts.TOKENS,
      contractAction: EngineActions.TRANSFER,
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString(),
        memo
      }
    };
  
    return executeEngineAction(json, currentAccount, pinHash);
  
  };
  
  export const delegateHiveEngine = async (
    symbol: string,
    to: string,
    amount: string,
    currentAccount: any,
    pinHash: string
  ) => {
    const json:EngineActionJSON = {
      contractName: EngineContracts.TOKENS,
      contractAction: EngineActions.DELEGATE,
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString(),
      }
    };
  
    return executeEngineAction(json, currentAccount, pinHash);
  };
  
  export const undelegateHiveEngine = async (
    symbol: string,
    to: string,
    amount: string,
    currentAccount: any,
    pinHash: string
  ) => {
    const json:EngineActionJSON = {
      contractName: EngineContracts.TOKENS,
      contractAction: EngineActions.UNDELEGATE,
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString(),
      }
    };
  
    return executeEngineAction(json, currentAccount, pinHash);
  };


  export const stakeHiveEngine = async (
    symbol: string,
    to: string,
    amount: string,
    currentAccount: any,
    pinHash: string
  ) => {
    const json:EngineActionJSON = {
      contractName: EngineContracts.TOKENS,
      contractAction: EngineActions.STAKE,
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString(),
      }
    };
  
    return executeEngineAction(json, currentAccount, pinHash);
  };
  
  export const unstakeHiveEngine = async (
    symbol: string,
    to: string,
    amount: string,
    currentAccount: any,
    pinHash: string
  ) => {
    const json:EngineActionJSON = {
      contractName: EngineContracts.TOKENS,
      contractAction: EngineActions.UNSTAKE,
      contractPayload: {
        symbol,
        to,
        quantity: amount.toString(),
      }
    };
  
    return executeEngineAction(json, currentAccount, pinHash);
  };
  