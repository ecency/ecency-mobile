import { isNumber } from 'lodash';

export const isCommunity = (text: string): boolean => {
  if (/hive-[1-3]\d{4,6}$/.test(text) && isNumber(Number(text.split('-')[1]))) {
    return true;
  }

  return false;
};
