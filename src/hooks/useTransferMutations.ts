import { useBroadcastMutation, buildRecurrentTransferOp } from '@ecency/sdk';
import { useSelector } from 'react-redux';
import {
  useTransferMutation,
  useConvertMutation,
  useTransferToSavingsMutation,
  useTransferFromSavingsMutation,
  useTransferToVestingMutation,
  useWithdrawVestingMutation,
  useDelegateVestingSharesMutation,
  useSetWithdrawVestingRouteMutation,
  useTransferPointMutation,
  useTransferEngineTokenMutation,
  useStakeEngineTokenMutation,
  useDelegateEngineTokenMutation,
  useUnstakeEngineTokenMutation,
  useUndelegateEngineTokenMutation,
  useTransferSpkMutation,
  useTransferLarynxMutation,
  usePowerLarynxMutation,
} from '../providers/sdk/mutations';
import { useAuthContext } from '../providers/sdk';
import { selectCurrentAccount } from '../redux/selectors';
import type { RootState } from '../redux/store/store';

/**
 * Bundles all transfer-related SDK mutation hooks into a single object.
 * Designed to be injected into class components via mapHooksToProps.
 */
export function useTransferMutations() {
  const currentAccount = useSelector((state: RootState) => selectCurrentAccount(state));
  const authContext = useAuthContext();
  const username = currentAccount?.name;

  // HIVE layer
  const transfer = useTransferMutation();
  const convert = useConvertMutation();
  const transferToSavings = useTransferToSavingsMutation();
  const transferFromSavings = useTransferFromSavingsMutation();
  const transferToVesting = useTransferToVestingMutation();
  const withdrawVesting = useWithdrawVestingMutation();
  const delegateVestingShares = useDelegateVestingSharesMutation();
  const setWithdrawVestingRoute = useSetWithdrawVestingRouteMutation();

  // Recurrent transfer — no dedicated SDK hook, use generic broadcast
  const recurrentTransfer = useBroadcastMutation(
    ['hive', 'recurrent-transfer'],
    username,
    ({
      from,
      to,
      amount,
      memo,
      recurrence,
      executions,
    }: {
      from: string;
      to: string;
      amount: string;
      memo: string;
      recurrence: number;
      executions: number;
    }) => [buildRecurrentTransferOp(from, to, amount, memo, recurrence, executions)],
    undefined,
    authContext,
    'active',
  );

  // POINTS layer
  const transferPoint = useTransferPointMutation();

  // ENGINE layer
  const transferEngine = useTransferEngineTokenMutation();
  const stakeEngine = useStakeEngineTokenMutation();
  const delegateEngine = useDelegateEngineTokenMutation();
  const unstakeEngine = useUnstakeEngineTokenMutation();
  const undelegateEngine = useUndelegateEngineTokenMutation();

  // SPK layer
  const transferSpk = useTransferSpkMutation();
  const transferLarynx = useTransferLarynxMutation();
  const powerLarynx = usePowerLarynxMutation();

  // SPK delegate — no dedicated SDK hook, use generic broadcast
  const delegateLarynx = useBroadcastMutation(
    ['spk', 'delegate-larynx'],
    username,
    ({ destination, amount }: { destination: string; amount: number }) => {
      const json = {
        to: destination,
        amount: amount * 1000,
      };
      return [
        [
          'custom_json',
          {
            id: 'spkcc_power_grant',
            json: JSON.stringify(json),
            required_auths: [username || ''],
            required_posting_auths: [],
          },
        ],
      ];
    },
    undefined,
    authContext,
    'active',
  );

  return {
    // HIVE
    transfer,
    recurrentTransfer,
    convert,
    transferToSavings,
    transferFromSavings,
    transferToVesting,
    withdrawVesting,
    delegateVestingShares,
    setWithdrawVestingRoute,
    // POINTS
    transferPoint,
    // ENGINE
    transferEngine,
    stakeEngine,
    delegateEngine,
    unstakeEngine,
    undelegateEngine,
    // SPK
    transferSpk,
    transferLarynx,
    powerLarynx,
    delegateLarynx,
  };
}

export type TransferMutations = ReturnType<typeof useTransferMutations>;
