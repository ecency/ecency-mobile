import { getEngineActionOpArray } from '../providers/hive-engine/hiveEngineActions';
import { EngineActions } from '../providers/hive-engine/hiveEngine.types';
import { buildActiveCustomJsonOpArr } from '../providers/hive/dhive';
import { getSpkActionJSON } from '../providers/hive-spk/hiveSpk';
import { countDecimals } from './number';
import TransferTypes from '../constants/transferTypes';
import { OrderIdPrefix, SwapOptions } from '../providers/hive-trade/hiveTrade.types';
import { convertSwapOptionsToLimitOrder } from '../providers/hive-trade/converters';
import { getLimitOrderCreateOpData } from '../providers/hive-trade/hiveTrade';
import parseToken from './parseToken';
import TokenLayers from '../constants/tokenLayers';

interface TansferData {
  from: string;
  to: string;
  amount: string;
  fundType: string;
  memo?: string;
  tokenLayer?: string;
  recurrence?: number;
  executions?: number;
}

export const buildTradeOpsArray = (username: string, data: SwapOptions) => {
  const { amountToSell, minToRecieve, transactionType } = convertSwapOptionsToLimitOrder(data);
  const opData = getLimitOrderCreateOpData(
    username,
    amountToSell,
    minToRecieve,
    transactionType,
    OrderIdPrefix.SWAP,
  );

  return [['limit_order_create', opData]];
};

export const buildTransferOpsArray = (
  transferType: string,
  { from, to, amount, memo, fundType, recurrence, executions, tokenLayer }: TansferData,
) => {
  if (countDecimals(Number(amount)) < 3) {
    amount = Number(amount).toFixed(3);
  }

  amount = `${amount} ${fundType}`;

  // check layer and build appropriate operation
  if (tokenLayer === TokenLayers.ENGINE ) {
    return getEngineActionOpArray(transferType as EngineActions, from, to, amount, fundType, memo);
  } else if (tokenLayer === TokenLayers.SPK) {
    return buildActiveCustomJsonOpArr(from, transferType, getSpkActionJSON(parseToken(amount), to, memo));
  } else if (tokenLayer === TokenLayers.POINTS && transferType === TransferTypes.ECENCY_POINT_TRANSFER) {

    return buildActiveCustomJsonOpArr(from, transferType, {
      sender: from,
      receiver: to,
      amount,
      memo,
    });

  }

  switch (transferType) {
    case TransferTypes.CONVERT:
      return [
        transferType,
        {
          owner: from,
          amount,
          requestid: new Date().getTime() >>> 0,
        },
      ];

    case TransferTypes.DELEGATE_VESTING_SHARES:
      return [
        transferType,
        {
          delegator: from,
          delegatee: to,
          vesting_shares: amount,
        },
      ];

    case TransferTypes.TRANSFER:
      return [
        [
          transferType,
          {
            from,
            to,
            amount,
            memo,
          },
        ],
      ];

    case TransferTypes.RECURRENT_TRANSFER:
      return [
        [
          transferType,
          {
            from,
            to,
            amount,
            memo,
            recurrence,
            executions,
            extensions: [],
          },
        ],
      ];

    case TransferTypes.TRANSFER_TO_SAVINGS:
      return [
        [
          transferType,
          {
            from,
            to,
            amount,
            memo,
          },
        ],
      ];
    case TransferTypes.TRANSFER_TO_VESTING:
      return [
        [
          transferType,
          {
            from,
            to,
            amount,
          },
        ],
      ];
    case TransferTypes.TRANSFER_FROM_SAVINGS:
      return [
        [
          transferType,
          {
            from,
            to,
            amount,
            memo,
            request_id: new Date().getTime() >>> 0,
          },
        ],
      ];

    case TransferTypes.WITHDRAW_VESTING:
      return [
        [
          transferType,
          {
            account: from,
            vesting_shares: amount,
          },
        ],
      ];
    case TransferTypes.DELEGATE_VESTING_SHARES:
      return [
        [
          transferType,
          {
            delegator: from,
            delegatee: to,
            vesting_shares: amount,
          },
        ],
      ];

    default:
      throw new Error(`Unsupported transaction type: ${transferType}`);
  }
};
