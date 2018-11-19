export default (url, width = 0, height = 0) => {
  if (!url) {
    return '';
  }

  const prefix = `https://steemitimages.com/${width}x${height}/`;

  if (url.startsWith(prefix)) return url;

  return `${prefix}${url}`;
};
