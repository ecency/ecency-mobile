import axios from 'axios';

const DEFAULT_SERVER = [
  'https://rpc.esteem.app',
  'https://anyx.io',
  'https://api.pharesim.me',
  'https://api.hive.blog',
  'https://api.hivekings.com',
];

const pickAServer = () => DEFAULT_SERVER.sort(() => 0.5 - Math.random())[0];

const bridgeApiCall = (endpoint, params) =>
  axios
    .post(pickAServer(), {
      jsonrpc: '2.0',
      method: endpoint,
      params: params,
      id: 1,
    })
    .then((resp) => {
      return resp.data.result || null;
    });

export const getCommunity = (name, observer = '') =>
  bridgeApiCall('bridge.get_community', { name, observer });

export const getCommunities = (last = '', limit = 100, query = '', sort = 'rank', observer = '') =>
  bridgeApiCall('bridge.list_communities', {
    last,
    limit,
    query,
    sort,
    observer,
  });

export const getSubscriptions = (account = '') =>
  bridgeApiCall('bridge.list_all_subscriptions', { account });
