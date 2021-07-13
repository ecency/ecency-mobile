// eslint-disable-next-line
import bugsnag from './src/config/bugsnag';
import App from './src/index';

if (__DEV__) {
  import('./reactotron-config').then(() => console.log('Reactotron Configured'));
}

export default App;
