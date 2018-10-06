import moment from 'moment';

export const getTimeFromNow = (value) => {
  if (!value) return null;

  return moment
    .utc(value)
    .local()
    .fromNow();
};

export const getFormatedCreatedDate = value => {
  if (!value) return null;

  return moment(value).format("DD MMM, YYYY");
};
