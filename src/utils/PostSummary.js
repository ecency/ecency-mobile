
import Remarkable from 'remarkable';

const md = new Remarkable({html: true, breaks: true, linkify: false});

export const postSummary = (postBody, length) => {
  if (!postBody) {
    return '';
  }

  // Convert markdown to html
  let text = md.render(postBody);

  text = text
    .replace(/(<([^>]+)>)/ig, '') // Remove html tags
    .replace(/\r?\n|\r/g, ' ') // Remove new lines
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove urls
    .trim()
    .replace(/ +(?= )/g, ''); // Remove all multiple spaces

  if (length) {
    // Truncate
    text = text.substring(0, length);
  }


  return text;
};