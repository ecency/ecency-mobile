import bugsnagInstance from '../../config/bugsnag';
import coingeckoApi from '../../config/coingeckoApi';
import { convertMarketData } from './converters';
import { MarketData } from './models';


const PATH_COINS = 'coins';
const PATH_MARKET_CHART = 'market_chart';

export const fetchMarketChart = async (
    coin:string, 
    vs_currency:string, 
    days:number, 
    interval:'daily'|'hourly' = 'daily'
    ): Promise<MarketData> => {
    try{
        const params = {
            vs_currency,
            days,
            interval
        }

        const res = await coingeckoApi.get(`/${PATH_COINS}/${coin}/${PATH_MARKET_CHART}`, {
            params
        });
        const rawData = res.data;
        if(!rawData){
            throw new Error("Tag name not available")
        }

        const data = convertMarketData(rawData);

        return data;
        
      }catch(error){
        bugsnagInstance.notify(error);
        throw error;
      }
}

export const COINGECKO_COIN_IDS = {
    HIVE_DOLLAR:'hive_dollar',
    HIVE:'hive'
}