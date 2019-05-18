export default (strVal) => {
  if (!strVal) return 0;

  return Number(parseFloat(strVal.split(' ')[0]));
};
