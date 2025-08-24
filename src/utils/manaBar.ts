interface Manabar {
  percentage?: number;
}

interface ManabarAccount {
  vp_manabar?: Manabar;
  rc_manabar?: Manabar;
  voting_manabar?: { current_mana: string };
  downvote_manabar?: { current_mana: string; last_update_time: number };
  voting_power?: number;
}

export const getVotingPower = (account: ManabarAccount): number => {
  const { vp_manabar } = account;
  const { percentage } = vp_manabar || {};
  return (percentage ?? 0) / 100;
};

export const getRcPower = (account: ManabarAccount): number => {
  const { rc_manabar } = account;
  const { percentage } = rc_manabar || {};
  return (percentage ?? 0) / 100;
};

export const getDownVotingPower = (account: ManabarAccount): number => {
  const curMana = Number(account.voting_manabar?.current_mana);
  const curDownMana = Number(account.downvote_manabar?.current_mana);
  const downManaLastUpdate = account.downvote_manabar?.last_update_time || 0;

  const downVotePerc = curDownMana / (curMana / ((account.voting_power || 0) / 100) / 4);

  const secondsDiff = (Date.now() - downManaLastUpdate * 1000) / 1000;

  const pow = downVotePerc * 100 + (10000 * secondsDiff) / 432000;

  return Math.min(pow / 100, 100);
};
