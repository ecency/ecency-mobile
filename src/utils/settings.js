export const groomingServerName = (serverName) => {
  const PREFIX1 = 'https://';
  const PREFIX2 = 'https://';

  if (!serverName) return null;

  if (serverName.indexOf(PREFIX1) === 0) {
    return serverName.substr(PREFIX1.length);
  }
  if (serverName.indexOf(PREFIX2) === 0) {
    return serverName.substr(PREFIX2.length);
  }
  return serverName;
};
