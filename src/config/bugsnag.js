import Bugsnag from '@bugsnag/react-native';
import Config from 'react-native-config';

const configuration = {
  apiKey: Config.BUGSNAG_API_KEY,
  consoleBreadcrumbsEnabled: true,
  notifyReleaseStages: ['beta', 'production'],
};

Bugsnag.start(configuration);

export default Bugsnag;
