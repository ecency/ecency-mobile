import hivesigner from 'hivesigner';

const api = new hivesigner.Client({
  app: 'esteemapp',
  callbackURL: 'http://127.0.0.1:3415',
});

export default api;
