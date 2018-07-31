export const postSummary = (postBody, length) => {
  if (!postBody) {
    return '';
  }

  postBody = postBody
    .replace(/(<([^>]+)>)/ig, '') // Remove html tags
    .replace(/\r?\n|\r/g, ' ') // Remove new lines
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove urls
    .trim()
    .replace(/ +(?= )/g, ''); // Remove all multiple spaces

  if (length) {
    // Truncate
    postBody = postBody.substring(0, length);
  }
  
  return postBody;
};