import regexValidator from './webLinkValidator';

export const replaceBetween = (text, selection, what) =>
  text.substring(0, selection.start) + what + text.substring(selection.end);

export const isStringWebLink = (text) => {
  const pattern = regexValidator;
  return pattern.test(text);
};
