import { Client } from 'bugsnag-react-native';
import Config from 'react-native-config';
import App from './src/index';

const bugsnag = new Client(Config.BUGSNAG_API_KEY);

export default App;
