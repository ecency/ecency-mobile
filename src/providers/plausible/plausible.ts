import { Platform } from 'react-native';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import * as Sentry from '@sentry/react-native';

import { isAxiosTransportError } from '../../config/axiosTimeout';
import { DEFAULT_TIMEOUT_MS } from '../../utils/networkTimeout';

// Pageview recording only. Post-stats *reads* now go through `@ecency/sdk`
// (`getStatsQueryOptions` -> the server-side `/api/stats` proxy), so the stats
// API key is no longer shipped in the app — see providers/queries/statsQueries.
// Plausible's event-ingestion endpoint requires no auth.
const PATH_EVENT_API = '/api/event';
const SITE_ID = 'ecency.com';

const plausibleApi = axios.create({
  baseURL: 'https://pl.ecency.com/',
  headers: {
    'Content-Type': 'application/json',
  },
  // Fire-and-forget analytics, which is exactly why it must not hold one of the
  // five concurrent slots the platform HTTP client allows per host when the path
  // is broken: nothing is waiting on it to notice. Axios sets no deadline of its
  // own and does not go through the global fetch wrapper.
  timeout: DEFAULT_TIMEOUT_MS,
});

export const recordPlausibleEvent = async (urlPath: string, eventName?: string): Promise<void> => {
  try {
    // Guard against undefined/empty paths reaching .replace (top Sentry crash:
    // "Cannot read property 'replace' of undefined").
    if (!urlPath) {
      return;
    }
    // form plausible recordable url
    const normalizedPath = urlPath.replace(/^\//, '');
    const url = `app://${Platform.OS}.${SITE_ID}/${normalizedPath}`;

    const payload = {
      name: eventName || 'pageview',
      url,
      domain: SITE_ID,
      force: true,
    };

    const userAgent = getEcencyUserAgent();
    const res = await plausibleApi.post(PATH_EVENT_API, payload, {
      headers: { 'User-Agent': userAgent },
    });

    if (res.status !== 202) {
      throw new Error(`Plausible API responded with status ${res.status}`);
    }

    console.log(`Event "${eventName}" recorded successfully.`);
  } catch (error) {
    // Analytics is fire-and-forget: report but do not rethrow, otherwise the
    // failure surfaces as an unhandled rejection from callers.
    //
    // Transport failures are NOT reported. This runs once per screen view, and
    // now that the request has a deadline every pageview on a broken path
    // produces an error instead of a silent hang; across the user base that is
    // thousands of identical events a day for a call nothing waits on. Anything
    // that is not a transport failure is still reported.
    if (!isAxiosTransportError(error)) {
      Sentry.captureException(error);
    }
    console.error(`Failed to record event "${eventName}":`, error);
  }
};

const getEcencyUserAgent = () => {
  const appName = DeviceInfo.getApplicationName();
  const appVersion = DeviceInfo.getVersion();
  const systemName = Platform.OS === 'ios' ? 'iOS' : 'Android';
  const systemVersion = DeviceInfo.getSystemVersion();
  const deviceModel = DeviceInfo.getModel();

  // This combination ensures event appear as Mobile App with specific version installed
  // The last part starting from Version/4.0 is essential for plausoible to record event as Mobile App, no other combination works
  const userAgent = `${appName}/${appVersion} (${systemName} ${systemVersion}; ${deviceModel}) Version/4.0 Chrome/${appVersion} Mobile`;

  console.log('Plausible User Agent', userAgent);

  return userAgent;
};
