import { Client } from 'bugsnag-react-native';
import Config from 'react-native-config';

const client = new Client(Config.BUGSNAG_API_KEY);
export default client;
