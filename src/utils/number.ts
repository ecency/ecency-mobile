export const countDecimals = (value) => {
  if (!value) {
    return 0;
  }

  if (Math.floor(value) === value) {
    return 0;
  }

  return value.toString().split('.')[1].length || 0;
};

export const stripDecimalPlaces = (value: number, precision = 3) => {
  if (!Number(value)) {
    return 0;
  }

  const power = 10 ** precision;

  return Math.floor(value * power) / power;
};

export const getDecimalPlaces = (value: number) => {
  const regex = /(?<=\.)\d+/;
  const match = value.toString().match(regex);
  return match ? match[0].length : 0;
};



export const formatNumberInputStr = (text: string, precision = 10) => {
  if (text.includes(',')) {
    text = text.replace(',', '.');
  }

  const _num = parseFloat(text);

  if (_num) {
    let _retVal = text;
    if ((text.startsWith('0') && _num >= 1) || text.startsWith('.')) {
      _retVal = `${_num}`;
    }

    if (getDecimalPlaces(_num) > precision) {
      _retVal = `${stripDecimalPlaces(_num, precision)}`;
    }
    return _retVal;
  } else if (text === '') {
    return '0';
  } else {
    return text;
  }
};




export const getAbbreviatedNumber = (input: string | number) => {
  const num = parseFloat(input); // Convert the string to a number

  // Check if the input is not a valid number
  if (Number.isNaN(num)) {
    return input; // Return the original string if it's not a number
  }

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`; // Format in millions
  } else if (num >= 100_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`; // Convert 100K to 0.1M
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`; // Format in thousands
  } else {
    return num.toString(); // Return smaller numbers as-is
  }
};
