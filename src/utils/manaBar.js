import parseToken from './parseToken';

// 432000 sec = 5 days
const PERIOD = 432000;

export const getVotingPower = (account) => {
  const { vp_manabar } = account;
  const { percentage } = vp_manabar;
  return percentage / 100;
};

export const getRcPower = (account) => {
  const { rc_manabar } = account;
  const { percentage } = rc_manabar;
  return percentage / 100;
};
