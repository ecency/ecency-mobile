export default (strVal) => {
  if (typeof strVal !== 'string') {
    // console.log(strVal);
  }
  const sp = strVal.split(' ');
  return {
    amount: parseFloat(sp[0]),
    symbol: Symbol[sp[1]],
  };
};
