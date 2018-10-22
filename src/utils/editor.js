export const getWordsCount = text => (text && typeof text === 'string' ? text.replace(/^\s+|\s+$/g, '').split(/\s+/).length : 0);
