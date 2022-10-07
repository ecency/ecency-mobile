import { CoinBase } from '../redux/reducers/walletReducer';

const DEFAULT_COINS = [
  {
    id: 'ecency',
    symbol: 'Points',
    notCrypto: true,
  },
  {
    id: 'hive_power',
    symbol: 'HP',
    notCrypto: true,
  },
  {
    id: 'hive',
    symbol: 'HIVE',
    notCrypto: false,
  },
  {
    id: 'hive_dollar',
    symbol: 'HBD',
    notCrypto: false,
  },
  {
    id: 'POB',
    symbol: 'POB',
    notCrypto: true,
  },
  {
    id: 'ARCHON',
    symbol: 'ARCHON',
    notCrypto: true,
  },
  {
    id: 'WAIV',
    symbol: 'WAIV',
    notCrypto: true,
  },
  {
    id: 'CCC',
    symbol: 'CCC',
    notCrypto: true,
  },
] as CoinBase[];

export const COIN_IDS = {
  ECENCY: 'ecency',
  HIVE: 'hive',
  HBD: 'hive_dollar',
  HP: 'hive_power',
};

export default DEFAULT_COINS;
