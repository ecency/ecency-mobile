import sc2 from 'steemconnect';

const api = sc2.Initialize({
  app: 'esteem-app',
  callbackURL: 'http://127.0.0.1:3415',
});

export default api;
