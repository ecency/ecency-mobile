export const getPostSummary = (postBody, length, isQuote) => {
  if (!postBody) {
    return '';
  }

  postBody = postBody
    .replace(/(<([^>]+)>)/gi, '') // Remove html tags
    .replace(/\r?\n|\r/g, ' ') // Remove new lines
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove urls
    .trim()
    .replace(/ +(?= )/g, ''); // Remove all multiple spaces

  if (length) {
    // Truncate
    postBody = postBody.substring(0, length);
  }
  return isQuote ? `"${postBody}..."` : `${postBody}...`;
};

export const makeCountFriendly = value => {
  if (!value) return value;
  if (value >= 1000000) return `${intlFormat(value / 1000000)}M`;
  if (value >= 1000) return `${intlFormat(value / 1000)}K`;

  return intlFormat(value);
};

const intlFormat = num => Math.round(num * 10) / 10;
