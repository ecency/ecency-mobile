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
  const getWalletInvalidationKeys = (account: string) => [
    QueryKeys.accounts.full(account),
    ['ecency-wallets', 'asset-info', account],
    ['wallet', 'portfolio', 'v2', account],
  ];

  // HIVE layer
  const transfer = useBroadcastMutation(
    ['wallet', 'transfer-safe'],
    username || '',
    ({ to, amount, memo }: { to: string; amount: string; memo: string }) => [
      buildTransferOp(username!, to, amount, memo),
    ],
    async (_data, { to }) => {
      try {
        if (authContext?.adapter?.invalidateQueries) {
          await authContext.adapter.invalidateQueries([
            ...getWalletInvalidationKeys(username || ''),
            ...getWalletInvalidationKeys(to),
          ]);
        }
      } catch (error) {
        console.warn('[useTransferMutations][transfer] Post-broadcast side-effect failed:', error);
      }
    },
    authContext,
    'active',
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
  );

  // POINTS layer
  const transferPoint = useBroadcastMutation(
    ['wallet', 'transfer-point-safe'],
    username || '',
    ({ to, amount, memo }: { to: string; amount: string; memo: string }) => [
      buildPointTransferOp(username!, to, amount, memo),
    ],
    async (_data, { to }) => {
      try {
        if (authContext?.adapter?.invalidateQueries) {
          await authContext.adapter.invalidateQueries([
            ...getWalletInvalidationKeys(username || ''),
            ...getWalletInvalidationKeys(to),
          ]);
        }
      } catch (error) {
        console.warn(
          '[useTransferMutations][transferPoint] Post-broadcast side-effect failed:',
          error,
        );
      }
    },
    authContext,
    'active',
  );

  // Multi-recipient Points transfer — single broadcast for all destinations
  const multiPointTransfer = useBroadcastMutation(
    ['wallet', 'multi-transfer-point'],
    username || '',
    ({ destinations, amount, memo }: { destinations: string[]; amount: string; memo: string }) =>
      destinations.map((dest) => buildPointTransferOp(username!, dest, amount, memo)),
    async (_data, { destinations }) => {
      try {
        if (authContext?.adapter?.invalidateQueries) {
          const recipients = [...new Set((destinations || []).filter(Boolean))];
          await authContext.adapter.invalidateQueries([
            ...getWalletInvalidationKeys(username || ''),
            ...recipients.flatMap((recipient) => getWalletInvalidationKeys(recipient)),
          ]);
        }
      } catch (error) {
        console.warn(
          '[useTransferMutations][multiPointTransfer] Post-broadcast side-effect failed:',
          error,
        );
      }
    },
    authContext,
    'active',
  );

  // Multi-recipient HIVE transfer — single broadcast for all destinations
  const multiTransfer = useBroadcastMutation(
    ['wallet', 'multi-transfer'],
    username || '',
    ({ destinations, amount, memo }: { destinations: string[]; amount: string; memo: string }) =>
      destinations.map((dest) => buildTransferOp(username!, dest, amount, memo)),
    async (_data, { destinations }) => {
      try {
        if (authContext?.adapter?.invalidateQueries) {
          const recipients = [...new Set((destinations || []).filter(Boolean))];
          await authContext.adapter.invalidateQueries([
            ...getWalletInvalidationKeys(username || ''),
            ...recipients.flatMap((recipient) => getWalletInvalidationKeys(recipient)),
          ]);
        }
      } catch (error) {
        console.warn(
          '[useTransferMutations][multiTransfer] Post-broadcast side-effect failed:',
          error,
        );
      }
    },
    authContext,
    'active',
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
