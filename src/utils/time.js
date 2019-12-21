const TODAY = new Date();
const ONE_DAY = new Date(TODAY.getTime() - 24 * 60 * 60 * 1000);
const SEVEN_DAY = new Date(TODAY.getTime() - 7 * 24 * 60 * 60 * 1000);

const MINUTE = 60;
const HOUR = 60 * 60;
const DAY = 60 * 60 * 24;
const WEEK = 60 * 60 * 24 * 7;
const MONTH = 60 * 60 * 24 * 30;
const YEAR = 60 * 60 * 24 * 365;

export const getTimeFromNow = d => {
  if (!d) {
    return null;
  }
  const dateIn = new Date(`${d}.000Z`);
  const dateNow = new Date();
  let future = false;

  if (dateIn > dateNow) {
    future = true;
  }

  const diff = Math.abs((dateNow - dateIn) / 1000);

  if (diff < MINUTE) {
    return { unit: 'second', value: future ? Math.round(diff) : -Math.round(diff) };
  }
  if (diff < HOUR) {
    return {
      unit: 'minute',
      value: future ? Math.round(diff / MINUTE) : -Math.round(diff / MINUTE),
    };
  }
  if (diff < DAY) {
    return { unit: 'hour', value: future ? Math.round(diff / HOUR) : -Math.round(diff / HOUR) };
  }
  if (diff < WEEK) {
    return { unit: 'day', value: future ? Math.round(diff / DAY) : -Math.round(diff / DAY) };
  }
  if (diff < MONTH) {
    return { unit: 'week', value: future ? Math.round(diff / WEEK) : -Math.round(diff / WEEK) };
  }
  if (diff < YEAR) {
    return { unit: 'month', value: future ? Math.round(diff / MONTH) : -Math.round(diff / MONTH) };
  }
  if (diff > YEAR) {
    return { unit: 'year', value: future ? Math.round(diff / YEAR) : -Math.round(diff / YEAR) };
  }
  return { unit: 'day', value: future ? Math.round(diff / DAY) : -Math.round(diff / DAY) };
};

export const getFormatedCreatedDate = value => {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString();
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
