export const getWordsCount = text => (text ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0);
