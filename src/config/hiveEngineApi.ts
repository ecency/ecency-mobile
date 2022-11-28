/**
 * hive engine docs reference:
 * https://hive-engine.github.io/engine-docs/
 */

import axios from 'axios';

const BASE_URL = 'https://api.hive-engine.com';
const ENGINE_REWARDS_URL = 'https://scot-api.hive-engine.com/';
const PATH_RPC = 'rpc';
export const PATH_CONTRACTS = 'contracts';

const hiveEngineApi = axios.create({
  baseURL: `${BASE_URL}/${PATH_RPC}`,
  headers: { 'Content-type': 'application/json' },
});

export const engineRewardsApi = axios.create({
  baseURL: ENGINE_REWARDS_URL,
  headers: { 'Content-type': 'application/json' },
})

export default hiveEngineApi;
