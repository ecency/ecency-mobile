import { Client, Configuration } from 'bugsnag-react-native';
import Config from 'react-native-config';

const configuration = new Configuration();
configuration.apiKey = Config.BUGSNAG_API_KEY;
configuration.consoleBreadcrumbsEnabled = true;
configuration.notifyReleaseStages = ['beta', 'production'];

const client = new Client(configuration);
export default client;
