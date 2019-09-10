import steemconnect from 'steemconnect';

const api = new steemconnect.Client({
  app: 'esteem-app',
  callbackURL: 'http://127.0.0.1:3415',
});

export default api;
