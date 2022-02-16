import { SET_SELECTED_COINS, SET_PRICE_HISTORY, SET_COINS_DATA } from '../constants/constants';
import { CoinBase, CoinData } from '../reducers/walletReducer';

export const setSelectedCoins = (coins: CoinBase[]) => ({
  payload: coins,
  type: SET_SELECTED_COINS,
});

export const setCoinsData = (data:{[key:string]:CoinData}) => ({
    payload:data,
    type:SET_COINS_DATA
})

export const setPriceHistory = (coinId:string, vsCurrency:string, data:number[]) => ({
    payload: {
        id:coinId,
        vsCurrency,
        data
    },
    type: SET_PRICE_HISTORY
})

