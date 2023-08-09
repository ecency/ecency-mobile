import DEFAULT_ASSETS, { ASSET_IDS } from '../../constants/defaultAssets';
import {
  SET_PRICE_HISTORY,
  SET_SELECTED_COINS,
  SET_COINS_DATA,
  SET_COIN_QUOTES,
  RESET_WALLET_DATA,
  UPDATE_UNCLAIMED_BALANCE,
} from '../constants/constants';

export interface DataPair {
  value: string | number;
  dataKey: string;
  isClickable?: boolean;
}

export interface CoinBase {
  id: string;
  symbol: string;
  notCrypto: boolean;
  isEngine: boolean;
  isSpk?: boolean;
}

export interface CoinData {
  name: string;
  symbol: string;
  iconUrl: string;
  currentPrice: number;
  balance: number;
  savings?: number;
  unclaimedBalance: string;
  estimateValue?: number;
  vsCurrency: string;
  actions: string[];
  extraDataPairs?: DataPair[];
  isEngine?: boolean;
  isSpk?: boolean;
  percentChange?: number;
  volume24h?: number;
  precision?: number;
}

export interface PriceHistory {
  expiresAt: number;
  vsCurrency: string;
  data: number[];
}

export interface CoinActivity {
  trxIndex: number;
  iconType: string;
  textKey: string;
  created: string;
  expires: string;
  icon: string;
  value: string;
  details: string | null;
  memo: string;
  cancelable: boolean;
}

export interface QuoteItem {
  lastUpdated: string;
  percentChange: number;
  price: number;
}

interface State {
  selectedCoins: CoinBase[];
  coinsData: {
    [key: string]: CoinData;
  };
  priceHistories: {
    [key: string]: PriceHistory;
  };
  quotes: {
    [key: string]: QuoteItem;
  };
  vsCurrency: string;
  username: string;
  updateTimestamp: number;
}

const initialState: State = {
  selectedCoins: DEFAULT_ASSETS,
  coinsData: {},
  priceHistories: {},
  quotes: null,
  vsCurrency: '',
  username: '',
  updateTimestamp: 0,
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case RESET_WALLET_DATA: {
      return {
        ...initialState,
        selectedCoins: state.selectedCoins,
      };
    }
    case SET_SELECTED_COINS: {
      return {
        ...state,
        selectedCoins: payload,
      };
    }
    case SET_COINS_DATA: {
      return {
        ...state,
        coinsData: payload.data,
        vsCurrency: payload.vsCurrency,
        username: payload.username,
        updateTimestamp: new Date().getTime(),
      };
    }
    case SET_PRICE_HISTORY: {
      const expiresAt =
        new Date().getTime() +
        (payload.id === ASSET_IDS.HBD || payload.id === ASSET_IDS.HIVE ? ONE_HOUR_MS : TEN_MIN_MS);

      state.priceHistories[payload.id] = {
        expiresAt,
        vsCurrency: payload.vsCurrency,
        data: payload.data,
      };
      return {
        ...state,
      };
    }
    case SET_COIN_QUOTES: {
      return {
        ...state,
        quotes: payload,
      };
    }
    case UPDATE_UNCLAIMED_BALANCE: {
      state.coinsData[payload.id].unclaimedBalance = payload.unclaimedBalance;
      return {
        ...state,
      };
    }
    default:
      return state;
  }
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const TEN_MIN_MS = 60 * 10 * 1000;
