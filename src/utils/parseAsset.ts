interface Asset {
  amount: number;
  symbol: symbol | string;
}

const parseAsset = (strVal: string): Asset => {
  if (typeof strVal !== 'string') {
    return {
      amount: 0,
      symbol: '',
    };
  }
  const sp = strVal.split(' ');
  return {
    amount: parseFloat(sp[0]),
    symbol: (Symbol as any)[sp[1]],
  };
};

export default parseAsset;
