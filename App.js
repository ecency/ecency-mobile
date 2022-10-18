// eslint-disable-next-line
import { Alert } from 'react-native';
import App from './src/index';

if (__DEV__) {
  import('./reactotron-config').then(() => { Alert.alert("reatotron working"); console.log('Reactotron Configured')}).catch((err)=>Alert.alert(err.message));
}

export default App;