import { Platform } from 'react-native';
import bugsnagInstance from '../../config/bugsnag';
import axios from 'axios';
import Config from 'react-native-config';


const PATH_EVENT_API = '/api/event';
const PATH_STATS_API = '/api/api/v2/query';
const SITE_ID = 'ecency.com';

const plausibleApi = axios.create({
    baseURL: Config.PLAUSIBLE_HOST_URL,
    headers: {
        Authorization: `Bearer ${Config.PLAUSIBLE_API_KEY}`,
        'Content-Type': 'application/json',
    },
});


export const recordEvent = async (
    urlPath: string,
    eventName?: string,
): Promise<void> => {

    try {
        // form plausible recordable url
        const normalizedPath = urlPath.replace(/^\//, "");
        const url = `app://${Platform.OS}.${SITE_ID}/${normalizedPath}`;

        const payload = {
            name: eventName || 'pageview',
            url: url,
            domain: SITE_ID,
        }

        const res = await plausibleApi.post(PATH_EVENT_API, payload);

        if (res.status !== 202) {
            throw new Error(`Plausible API responded with status ${res.status}`);
        }

        console.log(`Event "${eventName}" recorded successfully.`);
    } catch (error) {
        bugsnagInstance.notify(error);
        console.error(`Failed to record event "${eventName}":`, error);
        throw error;
    }
};