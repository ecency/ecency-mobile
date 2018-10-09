import sc2 from 'steemconnect';

const api = sc2.Initialize({
  app: 'esteem-app',
  callbackURL: 'http://localhost:3415',
});

export default api;
