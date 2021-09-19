import Bugsnag from '@bugsnag/react-native';
import Config from 'react-native-config';

const bugsnapInstance = Bugsnag.start({
  apiKey: Config.BUGSNAG_API_KEY,
});

export default bugsnapInstance;
