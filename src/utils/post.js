import parseToken from './parseToken';
import { isEmptyContentDate } from './time';

export const postSumTotal = content => {
  if (content.pending_payout_value && isEmptyContentDate(content.last_payout)) {
    return content.total_payout_value
      ? parseToken(content.total_payout_value) + parseToken(content.pending_payout_value)
      : 0;
  }

  return content.total_payout_value
    ? parseToken(content.total_payout_value) + parseToken(content.curator_payout_value)
    : 0;
};

export const getPostUrl = url => {
  const BASE_URL = 'https://steemit.com';

  return BASE_URL + url;
};
