import { SET_SELECTED_COINS, SET_PRICE_HISTORY, SET_COINS_DATA, SET_COIN_ACTIVITIES } from '../constants/constants';
import { CoinActivity, CoinBase, CoinData } from '../reducers/walletReducer';

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

export const setCoinActivities = (coinId:string, data:CoinActivity[]) => ({
    payload: {
        id:coinId,
        data,
    },
    type: SET_COIN_ACTIVITIES
})

