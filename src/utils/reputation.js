export const getReputation = reputation => {
  if (reputation === null) return reputation;

  let _reputation = String(parseInt(reputation));

  const neg = _reputation.charAt(0) === '-';
  _reputation = neg ? _reputation.substring(1) : _reputation;

  const str = _reputation;
  const leadingDigits = parseInt(str.substring(0, 4));
  const log = Math.log(leadingDigits) / Math.log(10);
  const n = str.length - 1;
  let out = n + (log - parseInt(log));

  if (isNaN(out)) out = 0;

  out = Math.max(out - 9, 0);
  out = (neg ? -1 : 1) * out;
  out = out * 9 + 25;
  out = parseInt(out);

  return out;
};
