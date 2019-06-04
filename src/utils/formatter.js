export const makeCountFriendly = value => {
  if (!value) return value;
  if (value >= 1000000) return `${intlFormat(value / 1000000)}M`;
  if (value >= 1000) return `${intlFormat(value / 1000)}K`;

  return intlFormat(value);
};

const intlFormat = num => Math.round(num * 10) / 10;
