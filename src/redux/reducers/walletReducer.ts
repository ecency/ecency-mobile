import DEFAULT_COINS from "../../constants/defaultCoins";
import { SET_PRICE_HISTORY, SET_SELECTED_COINS, SET_COINS_DATA, SET_COIN_ACTIVITIES, SET_COIN_QUOTES, RESET_WALLET_DATA } from "../constants/constants";

export interface DataPair {
    value:string|number;
    labelId:string;
}

export interface CoinBase {
    id:string,
    symbol:string,
    notCrypto:boolean,
}

export interface CoinData {
    currentPrice:number;
    balance:number;
    savings?:number;
    unclaimedBalance:string,
    estimateValue?:number;
    vsCurrency:string;
    actions:string[];
    extraDataPairs?:DataPair[];
}

export interface PriceHistory {
    lastFetchedAt:number;
    vsCurrency:string;
    data:number[];
}

export interface CoinActivity {
    iconType: string;
    textKey: string;
    created: string;
    icon: string;
    value:string;
    details: string;
    memo: string;
}

export interface QuoteItem {
    lastUpdated:string;
    percentChange:number;
    price:number;
}


interface State {
    selectedCoins:CoinBase[];
    coinsData:{
        [key: string]: CoinData;
    },
    priceHistories:{
        [key: string]: PriceHistory;
    }
    coinsActivities:{
        [key: string]: CoinActivity[];
    },
    quotes:{
        [key: string]: QuoteItem;
    }
    vsCurrency:string,
    username:string,
    updateTimestamp:number;
}

const initialState:State = {
    selectedCoins:DEFAULT_COINS,
    coinsData:{},
    priceHistories:{},
    coinsActivities:{},
    quotes: null,
    vsCurrency:'',
    username:'',
    updateTimestamp:0
};
  
export default function (state = initialState, action) {
    const {type, payload} = action;
    switch (type) {
    case RESET_WALLET_DATA:{
        return {
            ...initialState,
            selectedCoins:state.selectedCoins
        }
    }
    case SET_SELECTED_COINS:{
        return {
            ...state,
            selectedCoin:payload
        }
    }
    case SET_COINS_DATA:{
        return {
            ...state,
            coinsData:payload.data,
            vsCurrency:payload.vsCurrency,
            username:payload.username,
            updateTimestamp:new Date().getTime()
        }
    }
    case SET_PRICE_HISTORY:{
        state.priceHistories[payload.id] = {
            lastFetchedAt:new Date().getTime(),
            vsCurrency:payload.vsCurrency,
            data:payload.data
        };
        return {
            ...state
        }
    }
    case SET_COIN_ACTIVITIES:{
        state.coinsActivities[payload.id] = payload.data
        return {
            ...state
        }
    }
    case SET_COIN_QUOTES:{
        return {
            ...state,
            quotes:payload,
        }
    }
    default:
        return state;
    }
}

