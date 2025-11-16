import { AssetBase } from '../redux/reducers/walletReducer';

// TODO: remove id from assets
const DEFAULT_ASSETS = [
  {
    id: 'ecency',
    symbol: 'POINTS',
    notCrypto: true,
    isEngine: false,
    isChain: false,
  },
  {
    id: 'hive_power',
    symbol: 'HP',
    notCrypto: true,
    isEngine: false,
    isChain: false,
  },
  {
    id: 'hive',
    symbol: 'HIVE',
    notCrypto: false,
    isEngine: false,
    isChain: false,
  },
  {
    id: 'hive_dollar',
    symbol: 'HBD',
    notCrypto: false,
    isEngine: false,
    isChain: false,
  },
] as AssetBase[];

// TODO: assess if this is no longer needed
export enum ASSET_IDS {
  ECENCY = 'ecency',
  HIVE = 'hive',
  HBD = 'hive_dollar',
  HP = 'hive_power',
  SPK = 'SPK',
  LARYNX = 'LARYNX',
  LARYNX_POWER = 'LP',
}

export default DEFAULT_ASSETS;
