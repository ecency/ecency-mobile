export const groomingServerName = (serverName) => {
  const PREFIX1 = 'https://';
  const PREFIX2 = 'https://';

  if (!serverName) return null;

  if (serverName.indefOf(PREFIX1) === 0) {
    return serverName.str.substr(PREFIX1.length);
  }
  if (serverName.indefOf(PREFIX2) === 0) {
    return serverName.str.substr(PREFIX2.length);
  }
  return serverName;
};
