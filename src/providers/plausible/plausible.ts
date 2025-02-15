import { Platform } from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import bugsnagInstance from '../../config/bugsnag';
import {
  convertStatsData,
  getMetricsListForPostStats as getMetricsForPostStats,
  parsePostStatsByDimension,
  parsePostStatsResponse,
} from './converters';

import DeviceInfo from 'react-native-device-info';

const PATH_EVENT_API = '/api/event';
const PATH_STATS_API = '/api/v2/query';
const SITE_ID = 'ecency.com';

const plausibleApi = axios.create({
  baseURL: "https://pl.ecency.com/",
  headers: {
    Authorization: `Bearer ${Config.PLAUSIBLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const recordPlausibleEvent = async (urlPath: string, eventName?: string): Promise<void> => {
  try {
    // form plausible recordable url
    const normalizedPath = urlPath.replace(/^\//, '');
    const url = `app://${Platform.OS}.${SITE_ID}/${normalizedPath}`;

    const payload = {
      name: eventName || 'pageview',
      url,
      domain: SITE_ID,
      force: true,
    };

    const userAgent = await DeviceInfo.getUserAgent();
    const res = await plausibleApi.post(PATH_EVENT_API, payload, {
      headers: { "User-Agent": userAgent }
    });

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

const fetchStats = async (
  urlPath: string,
  metrics: string[],
  dimensions: string[],
  dateRange = 'all',
) => {
  try {
    const payload = {
      site_id: SITE_ID,
      metrics,
      filters: [['contains', 'event:page', [urlPath]]],
      dimensions,
      date_range: dateRange,
    };

    const res = await plausibleApi.post(PATH_STATS_API, payload);

    if (res.status !== 200) {
      throw new Error(`Plausible API responded with status ${res.status}`);
    }

    const rawData = res.data;

    const data = convertStatsData(rawData);

    if (!data) {
      throw new Error(`Failed to parse stats response data`);
    }

    return data;
  } catch (error) {
    bugsnagInstance.notify(error);
    console.error(`Failed to fetch stats:`, error);
    throw error;
  }
};


export const fetchPostStats = async (urlPath: string, dateRange = 'all') => {
  const metrics = getMetricsForPostStats();
  const stats = await fetchStats(urlPath, metrics, [], dateRange);
  const postStats = parsePostStatsResponse(stats);

  if (!postStats) {
    throw new Error('Failed to fetch post posts');
  }

  return postStats;
};



export const fetchPostStatsByDimension = async <T>(urlPath: string, dateRange = 'all', dimensionKey: string) => {
  const metrics = getMetricsForPostStats();
  const stats = await fetchStats(urlPath, metrics, [`visit:${dimensionKey}`], dateRange);
  const postStats = parsePostStatsByDimension<T>(stats, dimensionKey);

  if (!postStats) {
    throw new Error('Failed to fetch post stats');
  }

  return postStats;
};
