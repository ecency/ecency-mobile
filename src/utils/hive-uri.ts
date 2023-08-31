export const isHiveUri = (uri: string) => {
  let trimUri = uri.trim();
  return trimUri.startsWith('hive://');
};
