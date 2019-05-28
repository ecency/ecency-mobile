export const jsonStringify = jsonMetadata => {
  if (!jsonMetadata) return '';

  try {
    return JSON.stringify(jsonMetadata);
  } catch (err) {
    return '';
  }
};
