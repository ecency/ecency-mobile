import { PostStats, StatsResponse, StatsResponseResult } from './plausible.types';

export const convertStatsData = (rawData: any) => {
  if (!rawData || !rawData.results) {
    throw new Error('Invalid stats raw data');
  }

  const { results } = rawData;

  if (!results?.length) {
    throw new Error('Invalid response format: Missing metrics.');
  }

  return {
    results: rawData.results.map((result: any) => ({
      metrics: result.metrics || [],
      dimensions: result.dimensions || [],
    })),
    query: {
      site_id: rawData.query?.site_id || '',
      metrics: rawData.query?.metrics || [],
      date_range: rawData.query?.date_range || [],
      filters: rawData.query?.filters || [],
    },
  } as StatsResponse;
};

// NOTE: update default stats here along with accompanying interface
// this will also update thre returned response object
export function getDefaultPostStats(): PostStats {
  // `visits` (sessions) is the displayed "Views" number, matching the web app:
  // it is reload-proof (a single user refreshing inflates pageviews but not
  // visits), so app and web report the same count. `pageviews` is still fetched
  // for the per-device breakdown. parsePostStatsResponse maps by metric NAME,
  // so adding a key here just requests + parses that extra metric.
  return {
    visitors: 0,
    visits: 0,
    pageviews: 0,
    visit_duration: 0,
  } as PostStats;
}

export function getMetricsListForPostStats(): string[] {
  return Object.keys(getDefaultPostStats());
}

export function parsePostStatsResponse(
  response: StatsResponse,
  targetResult?: StatsResponseResult,
): PostStats {
  const result = targetResult || response.results[0];
  // const [result] = response.results;

  if (
    !result ||
    !result.metrics ||
    result.metrics.length < Object.keys(getDefaultPostStats()).length
  ) {
    throw new Error('Invalid response format: Missing required metrics.');
  }

  const { metrics } = result;
  const metricIndexMap = response.query.metrics.reduce((acc, metric, index) => {
    acc[metric] = index;
    return acc;
  }, {} as Record<string, number>);

  const defaultStats = getDefaultPostStats();
  const parsedStats = Object.keys(defaultStats).reduce(
    (acc, key) => {
      acc[key as keyof PostStats] = metrics[metricIndexMap[key]] || 0;
      return acc;
    },
    { ...defaultStats },
  );

  return parsedStats as PostStats;
}

export function parsePostStatsByDimension<T>(response: StatsResponse, dimensionKey: string) {
  const reData = response.results.map(
    (result) =>
      ({
        [dimensionKey]: result.dimensions[0],
        stats: parsePostStatsResponse(response, result),
      } as T),
  );

  reData.sort((a: any, b: any) => (a.stats.pageviews > b.stats.pageviews ? -1 : 1));

  return reData;
}
