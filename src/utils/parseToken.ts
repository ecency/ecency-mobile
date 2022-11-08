export default (strVal: string) => {
  // checks if first part of string is float
  const regex = /^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)? .*$/;
  if (!regex.test(strVal)) {
    return 0;
  }

  return Number(parseFloat(strVal.split(' ')[0]));
};
