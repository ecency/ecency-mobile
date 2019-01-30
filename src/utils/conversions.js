export const vestsToSp = (vests, steemPerMVests) => (vests / 1e6) * steemPerMVests;

export const vestsToRshares = (vests, votingPower, votePerc) => {
  const vestingShares = parseInt(vests * 1e6, 10);
  const power = (votingPower * votePerc) / 1e4 / 50 + 1;
  return (power * vestingShares) / 1e4;
};
