import {
  useBroadcastMutation,
  buildRecurrentTransferOp,
  buildPointTransferOp,
  buildTransferOp,
  QueryKeys,
} from '@ecency/sdk';
import { useSelector } from 'react-redux';
import {
  useConvertMutation,
  useTransferToSavingsMutation,
  useTransferFromSavingsMutation,
  useTransferToVestingMutation,
  useWithdrawVestingMutation,
  useDelegateVestingSharesMutation,
  useSetWithdrawVestingRouteMutation,
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
  const requireUsername = () => {
    if (!username) {
      throw new Error('Username is required for transfer operations.');
    }
    return username;
  };
  const getWalletInvalidationKeys = (account: string) => [
    QueryKeys.accounts.full(account),
    ['ecency-wallets', 'asset-info', account],
    ['wallet', 'portfolio', 'v2', account],
  ];
  const runPostBroadcastInvalidation = async (recipients: string[], logContext: string) => {
    if (!username || !authContext?.adapter?.invalidateQueries) {
      return;
    }

    try {
      const uniqueRecipients = [...new Set((recipients || []).filter(Boolean))];
      await authContext.adapter.invalidateQueries([
        ...getWalletInvalidationKeys(username),
        ...uniqueRecipients.flatMap((recipient) => getWalletInvalidationKeys(recipient)),
      ]);
    } catch (error) {
      console.warn(
        `[useTransferMutations][${logContext}] Post-broadcast side-effect failed:`,
        error,
      );
    }
  };

  // HIVE layer
  const transfer = useBroadcastMutation(
    ['wallet', 'transfer-safe'],
    username || '',
    ({ to, amount, memo }: { to: string; amount: string; memo: string }) => [
      buildTransferOp(requireUsername(), to, amount, memo),
    ],
    (_data, { to }) => {
      runPostBroadcastInvalidation([to], 'transfer');
    },
    authContext,
    'active',
    { broadcastMode: 'async' },
  );
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
    username || '',
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
    { broadcastMode: 'async' },
  );

  // POINTS layer
  const transferPoint = useBroadcastMutation(
    ['wallet', 'transfer-point-safe'],
    username || '',
    ({ to, amount, memo }: { to: string; amount: string; memo: string }) => [
      buildPointTransferOp(requireUsername(), to, amount, memo),
    ],
    (_data, { to }) => {
      runPostBroadcastInvalidation([to], 'transferPoint');
    },
    authContext,
    'active',
    { broadcastMode: 'async' },
  );

  // Multi-recipient Points transfer — single broadcast for all destinations
  const multiPointTransfer = useBroadcastMutation(
    ['wallet', 'multi-transfer-point'],
    username || '',
    ({ destinations, amount, memo }: { destinations: string[]; amount: string; memo: string }) =>
      destinations.map((dest) => buildPointTransferOp(requireUsername(), dest, amount, memo)),
    (_data, { destinations }) => {
      runPostBroadcastInvalidation(destinations, 'multiPointTransfer');
    },
    authContext,
    'active',
    { broadcastMode: 'async' },
  );

  // Multi-recipient HIVE transfer — single broadcast for all destinations
  const multiTransfer = useBroadcastMutation(
    ['wallet', 'multi-transfer'],
    username || '',
    ({ destinations, amount, memo }: { destinations: string[]; amount: string; memo: string }) =>
      destinations.map((dest) => buildTransferOp(requireUsername(), dest, amount, memo)),
    (_data, { destinations }) => {
      runPostBroadcastInvalidation(destinations, 'multiTransfer');
    },
    authContext,
    'active',
    { broadcastMode: 'async' },
  );

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
    username || '',
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
    { broadcastMode: 'async' },
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
    multiPointTransfer,
    multiTransfer,
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
