import parseToken from './parseToken';

// 432000 sec = 5 days
const PERIOD = 432000;

export const getVotingPower = account => {
  const totalShares =
    parseToken(account.vesting_shares) +
    (parseToken(account.received_vesting_shares) -
      parseToken(account.delegated_vesting_shares) -
      parseToken(account.vesting_withdraw_rate));

  const { voting_manabar: manabar } = account;

  const elapsed = Math.floor(Date.now() / 1000) - manabar.last_update_time;

  const maxMana = totalShares * 1e6;

  let currentMana = Number(manabar.current_mana) + (elapsed * maxMana) / PERIOD;

  if (currentMana > maxMana) currentMana = maxMana;

  return (currentMana * 100) / maxMana;
};

export const getRcPower = account => {
  const totalShares =
    parseToken(account.vesting_shares) +
    (parseToken(account.received_vesting_shares) -
      parseToken(account.delegated_vesting_shares) -
      parseToken(account.vesting_withdraw_rate));

  const { rc_manabar: manabar } = account;

  const elapsed = Math.floor(Date.now() / 1000) - manabar.last_update_time;

  const maxMana = totalShares * 1e6;

  let currentMana = Number(manabar.current_mana) + (elapsed * maxMana) / PERIOD;

  if (currentMana > maxMana) currentMana = maxMana;

  return (currentMana * 100) / maxMana;
};
