import { getLatestQuotes } from '../../providers/ecency/ecency';
import {
  SET_SELECTED_ASSETS,
  SET_PRICE_HISTORY,
  SET_COINS_DATA,
  SET_COIN_QUOTES,
  RESET_WALLET_DATA,
  UPDATE_UNCLAIMED_BALANCE,
} from '../constants/constants';
import { AssetBase, CoinData } from '../reducers/walletReducer';

export const setSelectedAssets = (coins: AssetBase[]) => ({
  payload: coins,
  type: SET_SELECTED_ASSETS,
});

export const setCoinsData = (
  data: { [key: string]: CoinData },
  vsCurrency: string,
  username: string,
) => ({
  payload: {
    data,
    vsCurrency,
    username,
  },
  type: SET_COINS_DATA,
});

export const setPriceHistory = (coinId: string, vsCurrency: string, data: number[]) => ({
  payload: {
    id: coinId,
    vsCurrency,
    data,
  },
  type: SET_PRICE_HISTORY,
});

export const updateUnclaimedBalance = (coinId: string, balanceStr: string) => ({
  payload: {
    id: coinId,
    unclaimedBalance: balanceStr,
  },
  type: UPDATE_UNCLAIMED_BALANCE,
});

export const resetWalletData = () => ({
  type: RESET_WALLET_DATA,
});

export const fetchCoinQuotes = () => async (dispatch, getState) => {
  const { currency } = getState().application;

  try {
    console.log('fetching quotes for currency', currency);
    const quotes = await getLatestQuotes(currency.currencyRate);
    console.log('Fetched quotes', quotes);
    dispatch({
      type: SET_COIN_QUOTES,
      payload: { ...quotes },
    });
  } catch (err) {
    console.warn('failed to fetch quotes', err);
  }
};
