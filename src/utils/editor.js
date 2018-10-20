export const getWordsCount = text => text.replace(/^\s+|\s+$/g, '').split(/\s+/).length;
