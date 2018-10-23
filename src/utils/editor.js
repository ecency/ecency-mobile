export const getWordsCount = text => (text && typeof text === 'string' ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0);

export const generatePermlink = (text) => {
  // let permlink = null;

  // if (text) {
  //   permlink = text
  //     .replace(/[^\w\s]/gi, '')
  //     .replace(/\s\s+/g, '-')
  //     .replace(/\s/g, '-')
  //     .toLowerCase();

  //   permlink = `${text}-id-${Math.random()
  //     .toString(36)
  //     .substr(2, 16)}`;
  //   }
  //   return permlink;
  // let permlink;

  const re = /[^a-z0-9]+/gi; // global and case insensitive matching of non-char/non-numeric
  const re2 = /^-*|-*$/g; // get rid of any leading/trailing dashes
  let permlink = text.replace(re, '-'); // perform the 1st regexp

  permlink = `${permlink.replace(re2, '').toLowerCase()}-id-${Math.random()
    .toString(36)
    .substr(2, 16)}`;
  return permlink;
};
