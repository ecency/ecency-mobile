import { isNumber } from 'lodash';

export const isCommunity = (text) => {
  if (/^hive-\d+/.test(text) && text.length === 11 && isNumber(Number(text.split('-')[1]))) {
    return true;
  }

  return false;
};
