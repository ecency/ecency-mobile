export const getCurrentHpApr = (gprops) => {
  // The inflation was set to 9.5% at block 7m
  const initialInflationRate = 9.5;
  const initialBlock = 7000000;

  // It decreases by 0.01% every 250k blocks
  const decreaseRate = 250000;
  const decreasePercentPerIncrement = 0.01;

  // How many increments have happened since block 7m?
  const { headBlock } = gprops;
  const deltaBlocks = headBlock - initialBlock;
  const decreaseIncrements = deltaBlocks / decreaseRate;

  // Current inflation rate
  let currentInflationRate =
    initialInflationRate - decreaseIncrements * decreasePercentPerIncrement;

  // Cannot go lower than 0.95%
  if (currentInflationRate < 0.95) {
    currentInflationRate = 0.95;
  }

  // Now lets calculate the "APR"
  const vestingRewardPercent = gprops.vestingRewardPercent / 10000;
  const { virtualSupply } = gprops;
  const totalVestingFunds = gprops.totalVestingFund;
  return (virtualSupply * currentInflationRate * vestingRewardPercent) / totalVestingFunds;
};
