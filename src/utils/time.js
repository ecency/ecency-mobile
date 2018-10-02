import moment from "moment";

export const getTimeFromNow = value => {
  if (!value) return null;

  return moment
    .utc(value)
    .local()
    .fromNow();
};
