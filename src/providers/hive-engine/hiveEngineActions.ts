import { Operation } from '@hiveio/dhive';
import parseToken from '../../utils/parseToken';
import { EngineActionJSON, EngineActions, EngineContracts } from './hiveEngine.types';

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
