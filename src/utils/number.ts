export const countDecimals = (value) => {
  if (!value) {
    return 0;
  }

  if (Math.floor(value) === value) {
    return 0;
  }

  return value.toString().split('.')[1].length || 0;
};


export const formatNumber = (value:number, precision:number):string => {
  if(!value){
    return '0.000'
  }

  if(countDecimals(value) < precision){
    return value.toFixed(precision)
  }

  return value.toString();
}
