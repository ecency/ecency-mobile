export const vestsToSp = (vests, steemPerMVests) => {
  if (!vests || !steemPerMVests) return 0;

  return ((vests / 1e6) * steemPerMVests);
};

export const vestsToRshares = (vests, votingPower, votePerc) => {
  if (!vests || !votingPower || !votePerc) return 0;

  const vestingShares = parseInt(vests * 1e6, 10);
  const power = (votingPower * votePerc) / 1e4 / 50 + 1;

  return (power * vestingShares) / 1e4;
};
