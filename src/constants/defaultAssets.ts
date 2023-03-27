import { CoinBase } from '../redux/reducers/walletReducer';

const DEFAULT_ASSETS = [
  {
    id: 'ecency',
    symbol: 'Points',
    notCrypto: true,
    isEngine: false,
  },
  {
    id: 'hive_power',
    symbol: 'HP',
    notCrypto: true,
    isEngine: false,
  },
  {
    id: 'hive',
    symbol: 'HIVE',
    notCrypto: false,
    isEngine: false,
  },
  {
    id: 'hive_dollar',
    symbol: 'HBD',
    notCrypto: false,
    isEngine: false,
  }
] as CoinBase[];


export enum ASSET_IDS {
  ECENCY= 'ecency',
  HIVE = 'hive',
  HBD = 'hive_dollar',
  HP = 'hive_power',
  SPK = 'SPK',
  LARYNX = 'LARYNX'
};

export default DEFAULT_ASSETS;
