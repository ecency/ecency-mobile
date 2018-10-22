export const getWordsCount = text => (text && typeof text === 'string' ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0);

export const generatePermlink = (text) => {
  let permlink = null;

  if (text) {
    permlink = text
      .replace(/[^\w\s]/gi, '')
      .replace(/\s\s+/g, '-')
      .replace(/\s/g, '-')
      .toLowerCase();

    permlink = `${text}-id-${Math.random()
      .toString(36)
      .substr(2, 16)}`;
  }

  return permlink;
};
