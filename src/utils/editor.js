export const getWordsCount = text => (text && typeof text === 'string' ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0);

export const generatePermlink = (text) => {
  if (text) {
    const re = /[^a-z0-9]+/gi;
    const re2 = /^-*|-*$/g;
    let permlink = text.replace(re, '-');

    permlink = `${permlink.replace(re2, '').toLowerCase()}-id-${Math.random()
      .toString(36)
      .substr(2, 16)}`;
    return permlink;
  }
  return null;
};
