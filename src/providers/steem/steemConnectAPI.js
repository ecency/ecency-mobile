import hivesigner from 'hivesigner';

const api = new hivesigner.Client({
  app: 'ecency.app',
  callbackURL: 'http://127.0.0.1:3000/auth',
});

export default api;
