import { countDecimals } from '../../utils/number';
import TransferTypes from '../../constants/transferTypes';

interface TansferData {
  from: string,
  to: string,
  amount: string,
  fundType: string,
  memo?: string,
  recurrence?: number,
  executions?: number,
}


export const buildTransferOpsArray = (transferType: string, { from, to, amount, memo, fundType, recurrence, executions }: TansferData) => {

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
          amount: amount,
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
      return [['transfer', {
        from,
        to,
        amount,
        memo,
      }]];

    case TransferTypes.RECURRENT_TRANSFER:


      return [['recurrent_transfer', {
        from,
        to,
        amount,
        memo,
        recurrence,
        executions,
        extensions: []
      }]];

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
    case TransferTypes.POINTS:
      const json = JSON.stringify({
        sender: from,
        receiver: to,
        amount: amount,
        memo: memo,
      });

      const op = {
        id: 'ecency_point_transfer',
        json,
        required_auths: [from],
        required_posting_auths: [],
      };
      return [['custom_json', op]];
      
    // case 'power_down':
    //   data.amount = `${amount.toFixed(6)} VESTS`;
    //   func = withdrawVesting;
    //   currentAccount = selectedAccount;
    //   break;
    // case 'delegate':
    //   func = delegateVestingShares;
    //   currentAccount = selectedAccount;
    //   data.amount = `${amount.toFixed(6)} VESTS`;
    //   break;
    // case 'transfer_engine':
    //   func = transferHiveEngine;
    //   break;
    // case 'stake_engine':
    //   func = stakeHiveEngine;
    //   break;
    // case 'delegate_engine':
    //   func = delegateHiveEngine;
    //   break;
    // case 'unstake_engine':
    //   func = unstakeHiveEngine;
    //   break;
    // case 'undelegate_engine':
    //   func = undelegateHiveEngine;
    //   break;
    // case TransferTypes.TRANSFER_SPK:
    //   func = transferSpk;
    //   break;
    // case TransferTypes.TRANSFER_LARYNX:
    //   func = transferLarynx;
    // case TransferTypes.POWER_UP_SPK:
    //   func = powerLarynx;
    //   data.mode = SpkPowerMode.UP;
    //   break;
    // case TransferTypes.POWER_DOWN_SPK:
    //   func = powerLarynx;
    //   data.mode = SpkPowerMode.DOWN;
    //   break;
    // case TransferTypes.LOCK_LIQUIDITY_SPK:
    //   func = lockLarynx;
    //   data.mode = SpkLockMode.LOCK;
    //   break;
    // case TransferTypes.DELEGATE_SPK:
    //   func = delegateLarynx;
    //   break;
    // default:
    //   break;

    default:
      throw new Error(`Unsupported transaction type: ${transferType}`);
  }
}
