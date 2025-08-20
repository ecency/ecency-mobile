import moment from 'moment';

const TODAY = new Date();
const ONE_DAY = new Date(TODAY.getTime() - 24 * 60 * 60 * 1000);
const SEVEN_DAY = new Date(TODAY.getTime() - 7 * 24 * 60 * 60 * 1000);
const FOURTEEN_DAY = new Date(TODAY.getTime() - 14 * 24 * 60 * 60 * 1000);

const MINUTE = 60;
const HOUR = 60 * 60;
const DAY = 60 * 60 * 24;
const WEEK = 60 * 60 * 24 * 7;
const MONTH = 60 * 60 * 24 * 30;
const YEAR = 60 * 60 * 24 * 365;

// TODO: once hermes has Intl support, enable native version
export const getTimeFromNowNative = (d?: string): { unit: string; value: number } | null => {
  if (!d) {
    return null;
  }
  const dateIn = new Date(`${d}.000Z`);
  const dateNow = new Date();
  let future = false;

  if (dateIn > dateNow) {
    future = true;
  }

  const diff = Math.abs((Number(dateNow) - Number(dateIn)) / 1000);

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

export const setMomentLocale = (): void => {
  moment.updateLocale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s',
      s: '1s',
      ss: '%ss',
      m: '1m',
      mm: '%dm',
      h: '1h',
      hh: '%dh',
      d: '1d',
      dd: '%dd',
      M: '1M',
      MM: '%dM',
      y: '1Y',
      yy: '%dY',
    },
  });
};

export const getTimeFromNow = (value?: string | Date, isWithoutUtc?: boolean): string | null => {
  if (!value) {
    return null;
  }

  if (isWithoutUtc) {
    return moment(value).fromNow();
  }

  return moment.utc(value).fromNow();
};

export const getDaysPassedSince = (value?: string | Date): number => {
  if (!value) {
    return 0;
  }

  const created = moment(value);
  return moment().diff(created, 'days');
};

export const getFormatedCreatedDate = (value?: string | Date): string | null => {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString();
};

export const isBefore = (a: string | Date, b: string | Date): number =>
  Number(new Date(b)) - Number(new Date(a));

export const isToday = (value: string | Date): number => {
  const day = new Date(value);
  return TODAY.getDate() === day.getDate() &&
    TODAY.getMonth() === day.getMonth() &&
    TODAY.getFullYear() === day.getFullYear()
    ? 1
    : 0;
};

export const isYesterday = (value: string | Date): boolean => {
  const day = new Date(value).getTime();
  return day < TODAY.getTime() && day > ONE_DAY.getTime();
};

export const isThisWeek = (value: string | Date): boolean => {
  const day = new Date(value).getTime();
  return day < TODAY.getTime() && day >= SEVEN_DAY.getTime();
};

export const isLastWeek = (value: string | Date): boolean => {
  const day = new Date(value).getTime();
  return day < SEVEN_DAY.getTime() && day >= FOURTEEN_DAY.getTime();
};

export const isThisMonth = (value: string | Date): boolean => {
  const day = new Date(value);
  return TODAY.getMonth() === day.getMonth() && TODAY.getFullYear() === day.getFullYear();
};

export const isEmptyContentDate = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  return parseInt(value.split('-')[0], 10) < 1980;
};

export const isEmptyDate = (s: string): boolean => parseInt(s.split('-')[0], 10) < 1980;

/**
 * Accepts javascript date , returns number of days between given date and todays date.
 *
 */
export const daysTillDate = (dateObj: Date): number => {
  const given = moment(dateObj);
  const current = moment();
  return Math.round(moment.duration(given.diff(current)).asDays());
};

/**
 * Accepts javascript date and moment format, returns date formatted with given format.
 * For example d = '2022-04-13T18:16:42+00:00' , format = 'LL' will return 'April 13, 2022'
 *
 */
export const dateToFormatted = (d: string, format = 'LLLL'): string => {
  const isTimeZoned = d?.indexOf('.') !== -1 || d?.indexOf('+') !== -1 ? d : `${d}.000Z`;
  const dm = moment(new Date(isTimeZoned));
  return dm.format(format);
};

/**
 * calculates hours difference between two dates, negative value will mean first date
 * is from past time
 * @param date1 Base date from which date2 will be subtracted
 * @param date2 Date to be subtracted
 * @returns number of hours difference between two dates
 */
export const getHoursDifferntial = (date1: Date, date2: Date): number => {
  if (date1 instanceof Date && date2 instanceof Date) {
    return (Number(date1) - Number(date2)) / (60 * 60 * 1000);
  }

  return 0;
};
