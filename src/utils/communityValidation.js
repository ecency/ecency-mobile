export const isCommunity = (text) => {
  if (/^hive-\d+/.test(text) && text.length === 11) {
    return true;
  }

  return false;
};
