export const vestsToHp = (vests, hivePerMVests) => {
  if (!vests || !hivePerMVests) {
    return 0;
  }

  return (parseFloat(vests) / 1e6) * hivePerMVests;
};

export const hpToVests = (hp, hivePerMVests) => {
  if (!hp || !hivePerMVests) {
    return 0;
  }
  return (parseFloat(hp) * 1e6) / hivePerMVests;
};

export const vestsToRshares = (vests: number, votingPower: number, weight: number) => {
  if (!vests || !votingPower || !weight) {
    return 0;
  }

  const finalVest = vests * 1e6;
  const power = (votingPower * weight) / 10000 / 50;
  return (power * finalVest) / 1000;
};

export const rcFormatter = (num: number) => {
  const result: any =
    Math.abs(num) > 999 && Math.abs(num) < 1000000
      ? `${Math.sign(num) * parseFloat((Math.abs(num) / 1000).toFixed(2))}K`
      : Math.abs(num) > 999999 && Math.abs(num) < 1000000000
      ? `${Math.sign(num) * parseFloat((Math.abs(num) / 1000000).toFixed(2))}M`
      : Math.abs(num) > 999999999 && Math.abs(num) < 1000000000000000
      ? `${Math.sign(num) * parseFloat((Math.abs(num) / 1000000000).toFixed(2))}B`
      : Math.sign(num) * Math.abs(num);
  return result;
};
