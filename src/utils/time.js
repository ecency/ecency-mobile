import moment from 'moment';

const TODAY = moment().startOf('day');
const YESTERDAY = moment()
  .subtract(1, 'days')
  .startOf('day');
const THIS_WEEK = moment()
  .subtract(7, 'days')
  .startOf('day');
const THIS_MONTH = moment()
  .subtract(1, 'M')
  .startOf('day');

export const getTimeFromNow = (value, isWithoutUtc) => {
  if (!value) return null;

  if (isWithoutUtc) return moment(value).fromNow();

  return moment.utc(value).fromNow();
};

export const getFormatedCreatedDate = value => {
  if (!value) return null;

  return moment(value).format('DD MMM, YYYY');
};

export const isBefore = (a, b) => moment(a).isBefore(b);

export const isToday = value => moment(value).isSame(TODAY, 'd');

export const isYesterday = value => moment(value).isSame(YESTERDAY, 'd');

export const isThisWeek = value => moment(value).isSameOrAfter(THIS_WEEK);

export const isThisMonth = value => moment(value).isSameOrAfter(THIS_MONTH);

export const isEmptyContentDate = value => {
  if (!value) return false;

  return parseInt(value.split('-')[0], 10) < 1980;
};
