export const flattenMessages = (
  nestedMessages: Record<string, any>,
  prefix = '',
): Record<string, string> =>
  Object.keys(nestedMessages).reduce((messages: Record<string, string>, key: string) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
