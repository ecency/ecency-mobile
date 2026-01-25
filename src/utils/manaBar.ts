import { Client } from '@hiveio/dhive';
import { SERVER_LIST } from '../constants/options/api';

const HIVE_VOTING_MANA_REGENERATION_SECONDS = 5 * 60 * 60 * 24; // 5 days

// Create dhive client for mana calculations
const client = new Client([...SERVER_LIST], {
  timeout: 4000,
  failoverThreshold: 10,
});

interface Manabar {
  current_mana: string | number;
  last_update_time: number;
}

interface ManabarAccount {
  name?: string;
  voting_manabar?: Manabar;
  voting_power?: number;
  downvote_manabar?: Manabar;
  vesting_shares?: string;
  received_vesting_shares?: string;
  delegated_vesting_shares?: string;
  last_vote_time?: string;
  [key: string]: any; // Allow other account properties
}

/**
 * Calculate voting power percentage from account data (0-100)
 * Uses dhive client's calculateVPMana to get accurate percentage
 */
export const getVotingPower = (account: ManabarAccount): number => {
  if (!account || !account.voting_manabar) {
    return 0;
  }

  try {
    // Use dhive client to calculate VP mana percentage
    const calc = client.rc.calculateVPMana(account as any);
    // dhive returns percentage in basis points (0..10000); normalize to 0..100
    return (calc.percentage ?? 0) / 100;
  } catch (error) {
    console.warn('Failed to calculate voting power:', error);
    return 0;
  }
};

/**
 * Calculate RC power percentage from RC account data (0-100)
 */
export const getRcPower = (rcAccount: any): number => {
  if (!rcAccount) {
    return 0;
  }

  if (
    !rcAccount.rc_manabar ||
    rcAccount.rc_manabar.current_mana == null ||
    rcAccount.rc_manabar.last_update_time == null ||
    rcAccount.max_rc == null
  ) {
    return 0;
  }

  try {
    const calc = client.rc.calculateRCMana(rcAccount);
    // dhive returns percentage in basis points (0..10000); normalize to 0..100
    return (calc.percentage ?? 0) / 100;
  } catch (error) {
    console.warn('Failed to calculate RC power:', error);
    return 0;
  }
};

/**
 * Calculate downvote power percentage (0-100)
 * This matches the SDK's downVotingPower output expectations
 */
export const getDownVotingPower = (account: ManabarAccount): number => {
  if (!account || !account.downvote_manabar || !account.vesting_shares) {
    return 0;
  }

  try {
    const totalShares =
      parseFloat(account.vesting_shares) +
      parseFloat(account.received_vesting_shares || '0') -
      parseFloat(account.delegated_vesting_shares || '0');

    const elapsed = Math.max(
      Math.floor(Date.now() / 1000) - account.downvote_manabar.last_update_time,
      0,
    );
    const maxMana = (totalShares * 1000000) / 4;

    if (maxMana <= 0) {
      return 0;
    }

    let currentMana =
      parseFloat(account.downvote_manabar.current_mana.toString()) +
      (elapsed * maxMana) / HIVE_VOTING_MANA_REGENERATION_SECONDS;

    if (currentMana < 0) {
      currentMana = 0;
    }

    if (currentMana > maxMana) {
      currentMana = maxMana;
    }

    const currentManaPerc = (currentMana * 100) / maxMana;

    if (Number.isNaN(currentManaPerc)) {
      return 0;
    }

    if (currentManaPerc > 100) {
      return 100;
    }

    if (currentManaPerc < 0) {
      return 0;
    }

    return currentManaPerc;
  } catch (error) {
    console.warn('Failed to calculate downvote power:', error);
    return 0;
  }
};
