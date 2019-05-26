import { Client } from 'bugsnag-react-native';
import App from './src/index';

const bugsnag = new Client('209f4246554ad209c903a45106669b9f');
bugsnag.notify(new Error('test notify1112222'));

export default App;
