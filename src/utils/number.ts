export const countDecimals = (value) => {
  if (!value) {
    return 0;
  }

  if (Math.floor(value) === value) {
    return 0;
  }

  return value.toString().split('.')[1].length || 0;
};


export const stripDecimalPlaces = (value:number, precision:number = 3) => {
  if (!Number(value)) {
    return 0;
  }

  const power = Math.pow(10, precision)

  return Math.floor(value * power) / power;
}