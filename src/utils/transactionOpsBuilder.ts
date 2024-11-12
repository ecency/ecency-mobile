import { getEngineActionOpArray } from '../providers/hive-engine/hiveEngineActions';
import { EngineActions } from '../providers/hive-engine/hiveEngine.types';
import { buildActiveCustomJsonOpArr } from '../providers/hive/dhive';
import { getSpkActionJSON, getSpkTransactionId } from '../providers/hive-spk/hiveSpk';
import { countDecimals } from './number';
import TransferTypes from '../constants/transferTypes';
import { OrderIdPrefix, SwapOptions } from '../providers/hive-trade/hiveTrade.types';
import { convertSwapOptionsToLimitOrder } from '../providers/hive-trade/converters';
import { getLimitOrderCreateOpData } from '../providers/hive-trade/hiveTrade';
import parseToken from './parseToken';

interface TansferData {
  from: string;
  to: string;
  amount: string;
  fundType: string;
  memo?: string;
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
  { from, to, amount, memo, fundType, recurrence, executions }: TansferData,
) => {
  if (countDecimals(Number(amount)) < 3) {
    amount = Number(amount).toFixed(3);
  }

  amount = `${amount} ${fundType}`;

  switch (transferType) {
    case TransferTypes.CONVERT:
      return [
        'convert',
        {
          owner: from,
          amount,
          requestid: new Date().getTime() >>> 0,
        },
      ];

    case TransferTypes.DELEGATE_VESTING_SHARES:
      return [
        'delegate_vesting_shares',
        {
          delegator: from,
          delegatee: to,
          vesting_shares: amount,
        },
      ];

    case TransferTypes.PURCHASE_ESTM:
    case TransferTypes.TRANSFER_TOKEN:
      return [
        [
          'transfer',
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
          'recurrent_transfer',
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
          'transfer_to_savings',
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
          'transfer_to_vesting',
          {
            from,
            to,
            amount,
          },
        ],
      ];
    case TransferTypes.WITHDRAW_HIVE:
    case TransferTypes.WITHDRAW_HBD:
      return [
        [
          'transfer_from_savings',
          {
            from,
            to,
            amount,
            memo,
            request_id: new Date().getTime() >>> 0,
          },
        ],
      ];

    case TransferTypes.POWER_DOWN:
      return [
        [
          'withdraw_vesting',
          {
            account: from,
            vesting_shares: amount,
          },
        ],
      ];
    case TransferTypes.DELEGATE:
      return [
        [
          'delegate_vesting_shares',
          {
            delegator: from,
            delegatee: to,
            vesting_shares: amount,
          },
        ],
      ];

    case TransferTypes.TRANSFER_ENGINE:
      return getEngineActionOpArray(EngineActions.TRANSFER, from, to, amount, fundType, memo);
    case TransferTypes.STAKE_ENGINE:
      return getEngineActionOpArray(EngineActions.STAKE, from, to, amount, fundType, memo);
    case TransferTypes.DELEGATE_ENGINE:
      return getEngineActionOpArray(EngineActions.DELEGATE, from, to, amount, fundType, memo);
    case TransferTypes.UNSTAKE_ENGINE:
      return getEngineActionOpArray(EngineActions.UNDELEGATE, from, to, amount, fundType, memo);
    case TransferTypes.UNDELEGATE_ENGINE:
      return getEngineActionOpArray(EngineActions.UNDELEGATE, from, to, amount, fundType, memo);

    case TransferTypes.POINTS:
      return buildActiveCustomJsonOpArr(from, 'ecency_point_transfer', {
        sender: from,
        receiver: to,
        amount,
        memo,
      });

    case TransferTypes.TRANSFER_SPK:
    case TransferTypes.TRANSFER_LARYNX:
    case TransferTypes.POWER_UP_SPK:
    case TransferTypes.POWER_DOWN_SPK:
    case TransferTypes.LOCK_LIQUIDITY_SPK:
    case TransferTypes.DELEGATE_SPK:
      return buildActiveCustomJsonOpArr(
        from,
        getSpkTransactionId(transferType),
        getSpkActionJSON(parseToken(amount), to, memo),
      );

    default:
      throw new Error(`Unsupported transaction type: ${transferType}`);
  }
};
