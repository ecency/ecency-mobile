import { getLatestQuotes } from '../../providers/ecency/ecency';
import { fetchAssetsPortfolio } from '../../utils/wallet';
import {
  SET_SELECTED_COINS,
  SET_PRICE_HISTORY,
  SET_COINS_DATA,
  SET_COIN_QUOTES,
  RESET_WALLET_DATA,
  UPDATE_UNCLAIMED_BALANCE,
} from '../constants/constants';
import { AssetBase, CoinData } from '../reducers/walletReducer';
import { AppDispatch, RootState } from '../store/store';

export const setSelectedCoins = (coins: AssetBase[]) => ({
  payload: coins,
  type: SET_SELECTED_COINS,
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

export const fetchCoinQuotes = () => (dispatch, getState) => {
  const { currency } = getState().application;
  console.log('fetching quotes for currency', currency);
  getLatestQuotes(currency.currencyRate).then((quotes) => {
    console.log('Fetched quotes', quotes);
    dispatch({
      type: SET_COIN_QUOTES,
      payload: { ...quotes },
    });
  });
};

export const fetchAndSetCoinsData = () => async (dispatch: AppDispatch, getState: RootState) => {
  const { currentAccount, globalProps } = getState().account;
  const { currency } = getState().application;
  const claimsCache = getState().cache.claimsCollection;

  const coinsData = await fetchAssetsPortfolio({
    globalProps,
    currentAccount,
    vsCurrency: currency.currency,
    currencyRate: currency.currencyRate,
    claimsCache,
  });

  return dispatch(setCoinsData(coinsData, currency.currency, currentAccount.username));
};
