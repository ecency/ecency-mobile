import moment from 'moment';

const TODAY = new Date(); //moment().startOf('day');
const ONE_DAY = new Date(TODAY.getTime() - 24 * 60 * 60 * 1000);
const SEVEN_DAY = new Date(TODAY.getTime() - 7 * 24 * 60 * 60 * 1000);

export const getTimeFromNow = (value, isWithoutUtc) => {
  if (!value) {
    return null;
  }

  if (isWithoutUtc) {
    return moment(value).fromNow();
  }

  return moment.utc(value).fromNow();
};

export const getFormatedCreatedDate = value => {
  if (!value) {
    return null;
  }

  return moment(value).format('DD MMM, YYYY');
};

export const isBefore = (a, b) => new Date(b) - new Date(a);

export const isToday = value => {
  const day = new Date(value);
  return TODAY.getDate() === day.getDate() &&
    TODAY.getMonth() === day.getMonth() &&
    TODAY.getFullYear() === day.getFullYear()
    ? 1
    : 0;
};

export const isYesterday = value => {
  const day = new Date(value).getTime();
  return day < TODAY.getTime() && day > ONE_DAY.getTime();
};

export const isThisWeek = value => {
  const day = new Date(value).getTime();
  return day < TODAY.getTime() && day > SEVEN_DAY.getTime();
};

export const isThisMonth = value => {
  const day = new Date(value);
  return TODAY.getMonth() === day.getMonth() && TODAY.getFullYear() === day.getFullYear() ? 1 : 0;
};

export const isEmptyContentDate = value => {
  if (!value) {
    return false;
  }

  return parseInt(value.split('-')[0], 10) < 1980;
};

export const isEmptyDate = s => parseInt(s.split('-')[0], 10) < 1980;
