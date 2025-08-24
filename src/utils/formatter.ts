export const makeCountFriendly = (value?: number | null): string | number | undefined | null => {
  if (!value) {
    return value;
  }
  if (value >= 1_000_000) {
    return `${intlFormat(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${intlFormat(value / 1_000)}K`;
  }

  return intlFormat(value);
};

const intlFormat = (num: number): number => Math.round(num * 10) / 10;
