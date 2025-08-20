export const jsonStringify = (jsonMetadata: any): string => {
  if (!jsonMetadata) {
    return '';
  }

  try {
    return JSON.stringify(jsonMetadata);
  } catch (err) {
    return '';
  }
};
